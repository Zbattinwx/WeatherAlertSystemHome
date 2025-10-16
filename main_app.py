# main_app.py
import asyncio
import collections
import json
import logging
import re
import sys
from html import unescape
from xml.etree import ElementTree
import aiohttp
from ugc_parser import load_ugc_database
from datetime import datetime, timedelta, timezone
from ugc_parser import UGC_TO_COUNTY

import slixmpp
import websockets
import weatherwise_control
import aiofiles

import http.server
import socketserver
import threading
import uuid

from google.oauth2 import service_account
from googleapiclient.discovery import build

from alert import Alert
from alert_parser import parse_alert, get_location_string


# New imports for the restart logic
import os
import signal


GOOGLE_CHAT_SPACE_ID = "spaces/AAAAVWPv5-E" 

last_message_timestamp = None
user_cache = {} # ADD THIS LINE
latest_storm_threats = []

try:
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
except ImportError:
    # For Python < 3.9, you would need to pip install tzdata
    from backports.zoneinfo import ZoneInfo, ZoneInfoNotFoundError


def to_json(self):
        return self.__dict__


try:
    with open('config.json', 'r') as f:
        config = json.load(f)
except FileNotFoundError:
    sys.exit("FATAL: config.json not found!")


_ALERT_CACHE_FILE = "active_alerts.json"
_SERVER_START_TIME = datetime.now()
_RESTART_INTERVAL_HOURS = config.get("restart_interval_hours", 24)


NWWS_USERNAME = config.get('nwws_credentials', {}).get('username')
NWWS_PASSWORD = config.get('nwws_credentials', {}).get('password')

if config.get("alert_source") == "nwws" and (not NWWS_USERNAME or not NWWS_PASSWORD):
    sys.exit("FATAL: 'username' or 'password' not found in config.json for NWWS mode")

WEBSOCKET_HOST = "0.0.0.0"
WEBSOCKET_PORT = 8000

HTTP_PORT = 8080

active_alerts = {}
recent_products = collections.deque(maxlen=20)
latest_afds = {}
manual_lsrs = []
TARGET_AFD_OFFICES = {"ILN", "IWX", "CLE", "PBZ", "RLX"}
connected_clients = set()
TARGET_PHENOMENA = {"TO", "SV", "FF", "SS", "SPS", "SVR", "FFW", "TOA", "SVA", "FFA"}
""" TARGET_PHENOMENA = {"TO", "SV", "FF", "SS", "SPS", "SVR", "FFW", "TOA", "SVA", "FFA", "WSA", "WSW", "SQW", "WW"} """

HIGH_PRIORITY_ALERTS = {"TO", "SV", "SVR", "FF", "FFW", "WSW", "SS", "WSA"}

NWS_EVENT_TO_PHENOMENON = {
    "Tornado Warning": "TO",
    "Severe Thunderstorm Warning": "SV",
    "Flash Flood Warning": "FF",
    "Special Weather Statement": "SPS",
    "Tornado Watch": "TOA",
    "Severe Thunderstorm Watch": "SVA",
    "Flash Flood Watch": "FFA",
    "Winter Storm Watch": "WSA",
    "Winter Storm Warning": "WSW",
    "Storm Surge Warning": "SS",
    "Snow Squall Warning": "SQW",
    "Winter Weather Advisory": "WW",
}


STATE_FIPS_MAP = {
    'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06', 'CO': '08', 'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12',
    'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19', 'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23',
    'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28', 'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
    'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38', 'OH': '39', 'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44',
    'SC': '45', 'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50', 'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55', 'WY': '56'
}


WFO_TIMEZONES = {
    # Eastern Time
    "BOX": "America/New_York", "BTV": "America/New_York", "CAR": "America/New_York",
    "GYX": "America/New_York", "OKX": "America/New_York", "PHI": "America/New_York",
    "ALY": "America/New_York", "BGM": "America/New_York", "BUF": "America/New_York",
    "CTP": "America/New_York", "PBZ": "America/New_York", "AKQ": "America/New_York",
    "LWX": "America/New_York", "RNK": "America/New_York", "ILN": "America/New_York",
    "CLE": "America/New_York", "IWX": "America/New_York", "DTX": "America/New_York",
    "APX": "America/New_York", "GRR": "America/New_York", "MQT": "America/New_York",
    "ILM": "America/New_York", "MHX": "America/New_York", "RAH": "America/New_York",
    "GSP": "America/New_York", "CHS": "America/New_York", "CAE": "America/New_York",
    "JAX": "America/New_York", "MLB": "America/New_York", "MFL": "America/New_York",
    "KEY": "America/New_York", "TBW": "America/New_York", "TAE": "America/New_York",
    "FFC": "America/New_York", "RLX": "America/New_York", "JKL": "America/New_York",
    "LMK": "America/New_York", "IND": "America/Indianapolis",
    
    # Central Time
    "LOT": "America/Chicago", "ILX": "America/Chicago", "DVN": "America/Chicago",
    "DMX": "America/Chicago", "MPX": "America/Chicago", "DLH": "America/Chicago",
    "GRB": "America/Chicago", "MKX": "America/Chicago", "ARX": "America/Chicago",
    "EAX": "America/Chicago", "SGF": "America/Chicago", "LSX": "America/Chicago",
    "PAH": "America/Chicago", "MEG": "America/Chicago", "OHX": "America/Chicago",
    "MRX": "America/Chicago", "HUN": "America/Chicago", "BMX": "America/Chicago",
    "MOB": "America/Chicago", "JAN": "America/Chicago", "LIX": "America/Chicago",
    "LCH": "America/Chicago", "SHV": "America/Chicago", "LZK": "America/Chicago",
    "TSA": "America/Chicago", "OUN": "America/Chicago", "TUL": "America/Chicago",
    "FWD": "America/Chicago", "HGX": "America/Chicago", "CRP": "America/Chicago",
    "BRO": "America/Chicago", "EWX": "America/Chicago", "SJT": "America/Chicago",
    "AMA": "America/Chicago", "LUB": "America/Chicago", "MAF": "America/Chicago",
    "TOP": "America/Chicago", "ICT": "America/Chicago", "GID": "America/Chicago",
    "OAX": "America/Chicago", "LBF": "America/Chicago", "GLD": "America/Chicago",
    "DDC": "America/Chicago", "FSD": "America/Chicago", "ABR": "America/Chicago",
    "UNR": "America/Chicago", "BIS": "America/Chicago", "FGF": "America/Chicago",

    # Mountain Time
    "BOU": "America/Denver", "PUB": "America/Denver", "GJT": "America/Denver",
    "ABQ": "America/Denver", "EPZ": "America/Denver", "SLC": "America/Denver",
    "PIH": "America/Denver", "BOI": "America/Denver", "MSO": "America/Denver",
    "TFX": "America/Denver", "GGW": "America/Denver", "BYZ": "America/Denver",
    "RIW": "America/Denver", "CYS": "America/Denver",

    # Pacific Time
    "SEW": "America/Los_Angeles", "PDT": "America/Los_Angeles", "MFR": "America/Los_Angeles",
    "EKA": "America/Los_Angeles", "STO": "America/Los_Angeles", "REV": "America/Los_Angeles",
    "LKN": "America/Los_Angeles", "VFX": "America/Los_Angeles", "SGX": "America/Los_Angeles",
    "LOX": "America/Los_Angeles", "HNX": "America/Los_Angeles",
    
    # Arizona (Mountain Standard Time - no DST)
    "PSR": "America/Phoenix", "TWC": "America/Phoenix", "FGZ": "America/Phoenix",

    # Alaska/Hawaii
    "AJK": "America/Juneau", "ALU": "America/Adak", "HFO": "Pacific/Honolulu"
}

USER_TO_IMPERSONATE = 'zach@belparkweather.org'


async def poll_storm_threat_data():
    """Periodically checks for and loads storm threat data from the processor."""
    global latest_storm_threats
    print("🌪️ Storm Threat polling service started.")
    while True:
        if not config.get("enable_storm_threat", False):
            print("Storm threat system is disabled in config.json. Waiting...")
            await asyncio.sleep(120)
            continue # This will skip the rest of the loop and start the next iteration
        
        try:
            # Use aiofiles for non-blocking file I/O
            async with aiofiles.open('storm_data.json', mode='r') as f:
                contents = await f.read()
                latest_storm_threats = json.loads(contents)
                print(f"✅ Loaded {len(latest_storm_threats)} storm threat objects.")
                # After loading new data, trigger a broadcast to all clients
                await broadcast_updates()
        except FileNotFoundError:
            # This is normal if the processor hasn't run yet
            latest_storm_threats = []
        except json.JSONDecodeError:
            print("⚠️ Error decoding storm_data.json. File might be partially written.")
        except Exception as e:
            print(f"❌ Error in storm threat poller: {e}")
        
        # Wait 2 minutes before checking again
        await asyncio.sleep(30)


def save_alerts_to_disk():
    """Saves the current state of active_alerts and recent_products to a JSON file."""
    print(f"💾 Saving {len(active_alerts)} alerts and {len(recent_products)} products to disk.")
    try:
        with open(_ALERT_CACHE_FILE, 'w') as f:
            data_to_save = {
                "active_alerts": {
                    alert_id: alert.to_json() for alert_id, alert in active_alerts.items()
                },
                "recent_products": list(recent_products),
                "latest_afds": latest_afds
            }
            json.dump(data_to_save, f, indent=2)
    except Exception as e:
        print(f"❌ Error saving alerts to disk: {e}")

def load_alerts_from_disk():
    """Loads the state of active_alerts and recent_products from a JSON file."""
    global active_alerts, recent_products, latest_afds
    if not os.path.exists(_ALERT_CACHE_FILE):
        print("🗄️ No existing alert cache file found.")
        return

    try:
        with open(_ALERT_CACHE_FILE, 'r') as f:
            data = json.load(f)

        # Restore active_alerts
        active_alerts.clear()
        for alert_id, alert_data in data.get("active_alerts", {}).items():
            # ✅ FIX: Check for and pass 'raw_text' to the constructor
            raw_text_from_cache = alert_data.get("raw_text")
            if not raw_text_from_cache:
                print(f"⚠️ Skipping alert {alert_id} from cache, missing raw_text.")
                continue

            # Instantiate the Alert with the required text, then update it
            alert = Alert(raw_text_from_cache)
            alert.__dict__.update(alert_data)

            # Ensure datetime objects are properly restored
            if isinstance(alert.issue_time, str):
                alert.issue_time = datetime.fromisoformat(alert.issue_time)
            if isinstance(alert.expiration_time, str):
                alert.expiration_time = datetime.fromisoformat(alert.expiration_time)
            active_alerts[alert_id] = alert

        # Restore recent_products
        recent_products.clear()
        for product in data.get("recent_products", []):
            recent_products.append(product)

        # Restore AFD data
        latest_afds.update(data.get("latest_afds", {}))

        print(f"✅ Loaded {len(active_alerts)} alerts and {len(recent_products)} products from disk.")
    except Exception as e:
        print(f"❌ Error loading alerts from disk: {e}")
        # Clean up corrupted file
        if os.path.exists(_ALERT_CACHE_FILE):
            os.remove(_ALERT_CACHE_FILE)
            print("⚠️ Removed corrupted alert cache file.")



async def poll_google_chat_messages():
    """Periodically polls Google Chat for new messages."""
    global last_message_timestamp, user_cache
    
    print("💬 Google Chat polling service started.")
    
    try:
        # --- 📍 CHANGE #1: ADD NEW SCOPE ---
        # We now need scopes for BOTH the Chat API and the People API.
        creds = service_account.Credentials.from_service_account_file(
            'service-account.json',
            scopes=[
                'https://www.googleapis.com/auth/chat.messages.readonly',
                'https://www.googleapis.com/auth/directory.readonly' # <-- New scope for People API
            ],
            subject=USER_TO_IMPERSONATE
        )
        # --- 📍 CHANGE #2: BUILD TWO SEPARATE SERVICES ---
        chat_service = build('chat', 'v1', credentials=creds)
        people_service = build('people', 'v1', credentials=creds) # <-- New service for People API
        
    except Exception as e:
        print(f"❌ FATAL: Could not build Google services. Check service-account.json and permissions. Error: {e}")
        return

    while True:
        try:
            results = chat_service.spaces().messages().list(
                parent=GOOGLE_CHAT_SPACE_ID,
                pageSize=25,
                orderBy="createTime DESC"
            ).execute()

            messages = results.get('messages', [])
            messages.reverse()

            messages_to_send = []
            if not messages:
                pass
            elif last_message_timestamp is None:
                messages_to_send = messages
            else:
                for msg in messages:
                    if msg['createTime'] > last_message_timestamp:
                        messages_to_send.append(msg)

            if messages_to_send:
                print(f"  ✅ Found {len(messages_to_send)} new messages. Looking up authors...")
                for msg in messages_to_send:
                    if msg.get('sender', {}).get('type') != 'HUMAN':
                        continue
                    
                    author_name = "Unknown Sender"
                    user_id_from_chat = msg.get('sender', {}).get('name') # This will be 'users/12345...'

                    if user_id_from_chat in user_cache:
                         author_name = user_cache[user_id_from_chat]
                    elif user_id_from_chat:
                        try:
                            # --- 📍 CHANGE #3: USE THE PEOPLE API FOR LOOKUP ---
                            # The People API needs the numeric ID, not the "users/" prefix.
                            person_id = user_id_from_chat.replace("users/", "")
                            
                            print(f"    -> Preparing to look up user via People API: {person_id}")

                            # Call the People API to get the user's name
                            user_info = people_service.people().get(
                                resourceName=f"people/{person_id}",
                                personFields='names' # We only need the name fields
                            ).execute()
                            
                            # Extract the display name from the People API response
                            display_name = "Unknown Sender"
                            names = user_info.get('names', [])
                            if names:
                                display_name = names[0].get('displayName', 'Unknown Sender')
                            
                            print(f"    -> Successfully fetched info for {display_name}")
                            author_name = display_name
                            user_cache[user_id_from_chat] = author_name
                            
                        except Exception as e:
                            print(f"!!! An unexpected error occurred during user lookup for {user_id_from_chat}: {e}")
                            author_name = "Error: See Console"

                    message_payload = {
                        "type": "chat_message",
                        "author": author_name,
                        "text": msg.get('text', '[Attachment or non-text message]')
                    }
                    await broadcast_message(json.dumps(message_payload))
                
                last_message_timestamp = messages_to_send[-1]['createTime']
                
        except Exception as e:
            print(f"❌ Error during polling loop: {e}")
        
        await asyncio.sleep(10)


class NWWSBot(slixmpp.ClientXMPP):
    """The main bot class to connect to the NWWS-OI service."""
    def __init__(self, jid, password):
        super().__init__(jid, password, sasl_mech='PLAIN')
        self.add_event_handler("session_start", self.on_session_start)
        self.add_event_handler("groupchat_message", self.on_muc_message)
        self.add_event_handler("disconnected", self.on_disconnected)
        
        # This will hold our reconnection task to ensure we don't run duplicates
        self.reconnect_task = None

    async def on_session_start(self, event):
        # When a session starts, it means we are connected.
        # We must cancel any pending reconnection task.
        if self.reconnect_task and not self.reconnect_task.done():
            self.reconnect_task.cancel()
            print("✅ Reconnection successful. Reconnect task cancelled.")
        self.reconnect_task = None

        print("🚀 Session started. Joining alert channel...")
        await self.get_roster()
        self.send_presence()
        await self.plugin['xep_0045'].join_muc('nwws@conference.nwws-oi.weather.gov', 'WeatherWiseBot')

    def on_muc_message(self, msg):
        if msg['type'] != 'groupchat' or msg['mucnick'] == 'WeatherWiseBot':
            return

        alert_body = msg.xml.find('{nwws-oi}x')
        if alert_body is not None and alert_body.text:
            raw_text = unescape(alert_body.text).strip()
            
            match = re.search(r'^\s*(AFD[A-Z]{3})\s*$', raw_text, re.MULTILINE | re.IGNORECASE)
            if match:
                product_id = match.group(1).upper()
                office = product_id[3:]
                if office in TARGET_AFD_OFFICES:
                    print(f"✅ Captured AFD for {office}.")
                    latest_afds[office] = raw_text
                    # Broadcast the update and stop further processing for this product
                    asyncio.create_task(broadcast_updates())
                    return

            recent_products.appendleft({'text': raw_text, 'id': raw_text})
            asyncio.create_task(broadcast_updates())
            asyncio.create_task(handle_incoming_alert(raw_text))
            return

        if msg['body']:
            print(f"Received summary line (no full text found): {msg['body']}")

    def on_disconnected(self, event):
        """Handles disconnection and schedules a persistent reconnection task."""
        print("🔌 INFO: Disconnected from the NWWS-OI server.")
        
        # Start the reconnect task only if it's not already running.
        if self.reconnect_task is None or self.reconnect_task.done():
            print("   -> Scheduling persistent reconnection task.")
            self.reconnect_task = asyncio.create_task(self.attempt_reconnect())
        else:
            print("   -> Reconnection task is already active.")

    async def attempt_reconnect(self):
        """Continuously attempts to reconnect with an incremental backoff."""
        wait_time = 5  # Initial wait time in seconds
        while True:
            try:
                print(f"   -> Attempting to reconnect in {wait_time} seconds...")
                await asyncio.sleep(wait_time)
                # The connect() coroutine will re-run the entire connection flow
                await self.connect()
                # If connect() succeeds, the session_start event will fire
                # and cancel this task. We break the loop here.
                break 
            except Exception as e:
                print(f"   -> Reconnect attempt failed: {e}")
                # Increase wait time for the next attempt (exponential backoff)
                # but cap it at 5 minutes (300 seconds)
                wait_time = min(wait_time * 2, 300) 

def filter_api_alert(alert_properties, filters):
    if not filters:
        return True
    states = filters.get("states", [])
    if states and not any(state in alert_properties.get("areaDesc", "") for state in states):
        return False
    offices = filters.get("offices", [])
    if offices and alert_properties.get("senderName") in offices:
        return True
    ugc_codes = filters.get("ugc_codes", [])
    if ugc_codes:
        alert_ugc = alert_properties.get("geocode", {}).get("UGC", [])
        if any(code in ugc_codes for code in alert_ugc):
            return True
    if offices or ugc_codes:
        return False
    return True

async def poll_nws_api():
    """
    Periodically polls the NWS API for active alerts and sends them
    through the same handling pipeline as NWWS alerts.
    """
    states_to_query = config.get("filters", {}).get("states", [])
    if not states_to_query:
        print("⚠️ No states listed in config.json filters. API polling will not run.")
        return

    # Use a set to keep track of alert IDs we've already processed
    processed_ids = set()

    api_url = f"https://api.weather.gov/alerts/active?status=actual&area={','.join(states_to_query)}"
    print(f"📡 Polling NWS API for states: {states_to_query}")

    async with aiohttp.ClientSession(headers={"User-Agent": "WeatherDashboard/1.0"}) as session:
        while True:
            try:
                async with session.get(api_url) as response:
                    if response.status != 200:
                        print(f"❌ Error fetching from NWS API: {response.status}")
                        await asyncio.sleep(60)
                        continue

                    data = await response.json()
                    alert_features = data.get("features", [])
                    print(f"API poll found {len(alert_features)} active features.")

                    # Get the full text for each new alert
                    for feature in alert_features:
                        alert_id = feature.get("properties", {}).get("id")
                        if alert_id and alert_id not in processed_ids:
                            # The '@id' field contains the URL to the full alert text
                            full_text_url = feature.get('@id')
                            if full_text_url:
                                async with session.get(full_text_url) as text_response:
                                    if text_response.status == 200:
                                        # The response is a JSON object containing the raw text
                                        alert_data = await text_response.json()
                                        raw_text = alert_data.get("properties", {}).get("productText")
                                        if raw_text:
                                            # Send the full text to our universal handler
                                            await handle_incoming_alert(raw_text)
                                            processed_ids.add(alert_id)
                                    else:
                                        print(f"❌ Failed to fetch full text for {alert_id}")
            except Exception as e:
                print(f"An error occurred during API polling: {e}")

            # Wait for the next poll
            await asyncio.sleep(60)
            
def filter_nwws_alert(parsed_alert, filters):
    """
    Checks if an alert from NWWS should be kept based on the provided filters.
    The logic is an OR: if any filter is defined, the alert must match at least one.
    """
    # If no filters are defined, or all filter lists within are empty, pass everything.
    if not filters or all(not v for v in filters.values()):
        return True

    # If any filter type is defined, the alert must match at least one of the criteria below.
    # We start by assuming it doesn't match.
    matches_criteria = False
    
    # --- Check State Filter ---
    states = filters.get("states", [])
    if states:
        # Get the 2-letter state codes from the alert's UGCs (e.g., 'OH' from 'OHC123')
        alert_states = {ugc[:2] for ugc in parsed_alert.affected_areas}
        if any(state in alert_states for state in states):
            matches_criteria = True
            
    # --- Check Office Filter ---
    offices = filters.get("offices", [])
    if not matches_criteria and offices:
        if parsed_alert.issuing_office in offices:
            matches_criteria = True

    # --- Check UGC Filter ---
    ugc_codes = filters.get("ugc_codes", [])
    if not matches_criteria and ugc_codes:
        if any(code in ugc_codes for code in parsed_alert.affected_areas):
            matches_criteria = True
            
    # The function returns True only if one of the checks flipped the flag.
    return matches_criteria



def populate_fips_codes_from_ugc(alert: Alert):
    """
    Looks up each UGC code (both County and Zone) in the loaded database
    and adds the corresponding FIPS code to the alert.
    """
    if not alert.affected_areas:
        return

    # Start with any FIPS codes that might already exist (e.g., from XML parsing)
    all_fips = set(alert.fips_codes)
    
    for ugc in alert.affected_areas:
        # Look up the UGC code in our pre-loaded database
        county_info = UGC_TO_COUNTY.get(ugc)
        
        # The database contains the mapping from UGC (like OHZ075 or OHC015) to its FIPS code
        if county_info and 'fips' in county_info:
            all_fips.add(county_info['fips'].zfill(6))
    
    alert.fips_codes = sorted(list(all_fips))


async def send_alert_to_google_chat(alert: Alert):
    """Formats and sends a new alert notification to a Google Chat webhook."""
    
    if not config.get("send_google_chat_alerts", False):
        return
    
    webhook_url = config.get("google_chat_webhook_url")
    if not webhook_url:
        return # Do nothing if the URL isn't configured

    alert_type_map = {
        "TO": "Tornado Warning", "SV": "Severe Thunderstorm Warning", "SVR": "Severe Thunderstorm Warning",
        "FF": "Flash Flood Warning", "FFW": "Flash Flood Warning"
    }
    alert_name = alert_type_map.get(alert.phenomenon, "Weather Alert")
    
    # Add a prefix for high-impact events
    if alert.is_emergency:
        alert_name = f"🚨 **TORNADO EMERGENCY** 🚨"
    elif alert.damage_threat in ["DESTRUCTIVE", "CATASTROPHIC"]:
        alert_name = f"**{alert.damage_threat.upper()}** {alert_name}"
    elif alert.tornado_observed:
        alert_name = f"**OBSERVED** {alert_name}"
        
    expires_text = "N/A"
    if alert.expiration_time:
        try:
            # Look up the IANA timezone name from the WFO ID, default to New York (Eastern)
            iana_tz_name = WFO_TIMEZONES.get(alert.issuing_office, "America/New_York")
            target_tz = ZoneInfo(iana_tz_name)
            
            # Convert the UTC time to the target timezone
            local_time = alert.expiration_time.astimezone(target_tz)
            
            # Format the string with the correct local time and timezone abbreviation
            expires_text = local_time.strftime('%I:%M %p %Z')

        except ZoneInfoNotFoundError:
            # Fallback for rare cases where a timezone isn't found
            expires_text = alert.expiration_time.strftime('%I:%M %p UTC')
        except Exception as e:
            print(f"Error converting timezone for alert {alert.product_id}: {e}")
            expires_text = "Error"

    # Prepare the message payload for Google Chat
    message = {
        "cardsV2": [{
            "cardId": "weatherAlertCard",
            "card": {
                "header": {
                    "title": f"New {alert_name}",
                    "subtitle": f"For: {alert.display_locations}"
                },
                "sections": [{
                    "widgets": [
                        
                        { "textParagraph": { "text": f"<b>Expires:</b> {expires_text}" } },
                        { "textParagraph": { "text": f"<b>Threats:</b> Wind: {alert.max_wind_gust or 'N/A'}, Hail: {alert.max_hail_size or 'N/A'}" } }
                    ]
                }]
            }
        }]
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(webhook_url, json=message) as response:
                if response.status == 200:
                    print(f"✅ Successfully sent alert {alert.product_id} to Google Chat.")
                else:
                    print(f"❌ Failed to send alert to Google Chat. Status: {response.status}, Response: {await response.text()}")
    except Exception as e:
        print(f"❌ An error occurred while sending alert to Google Chat: {e}")
        
        
def create_statewide_summary(alerts):
    """
    Processes all active alerts and returns a dictionary mapping
    each FIPS code to its highest-priority alert phenomenon.
    """
    # Lower number = higher priority
    priority = {
        "TO": 1, "FF": 2, "SV": 3, "SVR": 3,
        "TOA": 4, "SVA": 5, "FFA": 6, "SPS": 7
    }
    
    county_threats = {}
    
    for alert in alerts:
        alert_phenomenon = alert.get("phenomenon")
        alert_priority = priority.get(alert_phenomenon, 99)
        
        for fips in alert.get("fips_codes", []):
            if fips not in county_threats or alert_priority < priority.get(county_threats[fips], 99):
                county_threats[fips] = alert_phenomenon

    return county_threats


async def handle_incoming_alert(raw_text: str):
    """
    Parses, manages, and broadcasts alerts. Intelligently merges updates,
    appends new text, preserves original threats, and ignores expired products.
    """
    parsed_alert = parse_alert(raw_text)
    
    try:
        if '$$' in parsed_alert.raw_text and parsed_alert.product_id:
            main_block = parsed_alert.raw_text.split('$$')[0]
            text_parts = main_block.split(parsed_alert.product_id)
            if len(text_parts) > 1:
                parsed_alert.text = text_parts[1].strip()
    except Exception as e:
        print(f"Could not automatically extract plain text for {parsed_alert.product_id}: {e}")
        if not hasattr(parsed_alert, 'text'):
            parsed_alert.text = parsed_alert.raw_text

    if parsed_alert.expiration_time and parsed_alert.expiration_time < datetime.now(timezone.utc):
        print(f"Ignoring stale, already-expired product: {parsed_alert.product_id or 'Unknown ID'}")
        return
    
    if not parsed_alert.product_id or parsed_alert.phenomenon not in TARGET_PHENOMENA:
        return

    filters = config.get("filters", {})
    if not filter_nwws_alert(parsed_alert, filters):
        return

    if parsed_alert.affected_areas and not parsed_alert.fips_codes:
        populate_fips_codes_from_ugc(parsed_alert)

    alert_id_to_manage = parsed_alert.product_id
    broadcast_needed = False

    if parsed_alert.is_cancellation:
        if alert_id_to_manage in active_alerts:
            print(f"❌ CANCELLATION: Removing {alert_id_to_manage}.")
            del active_alerts[alert_id_to_manage]
            broadcast_needed = True
    
    elif alert_id_to_manage in active_alerts:
        print(f"🔄 Merging update for alert: {alert_id_to_manage}")
        existing_alert = active_alerts[alert_id_to_manage]

        # --- Additive Merge for Counties (from previous fix) ---
        if parsed_alert.affected_areas:
            combined_ugcs = sorted(list(set(existing_alert.affected_areas + parsed_alert.affected_areas)))
            if combined_ugcs != existing_alert.affected_areas:
                print(f"  -> Updating/merging county data for watch {alert_id_to_manage}")
                existing_alert.affected_areas = combined_ugcs
                populate_fips_codes_from_ugc(existing_alert)
                existing_alert.display_locations = get_location_string(existing_alert.affected_areas)

        # --- NEW: Logic to preserve threat details from the original alert ---
        # WOU products don't contain threat details. This ensures we don't
        # overwrite the original threats with empty values from the updates.
        if parsed_alert.max_wind_gust:
            existing_alert.max_wind_gust = parsed_alert.max_wind_gust
        if parsed_alert.max_hail_size:
            existing_alert.max_hail_size = parsed_alert.max_hail_size
        if parsed_alert.storm_motion:
            existing_alert.storm_motion = parsed_alert.storm_motion
        
        # Boolean flags are merged with 'or' to ensure a 'True' is never lost.
        existing_alert.is_emergency = existing_alert.is_emergency or parsed_alert.is_emergency
        existing_alert.tornado_observed = existing_alert.tornado_observed or parsed_alert.tornado_observed
        existing_alert.tornado_possible = existing_alert.tornado_possible or parsed_alert.tornado_possible

        # The damage threat is merged by comparing numeric levels.
        threat_levels = {'NONE': 0, 'BASE': 1, 'CONSIDERABLE': 2, 'DESTRUCTIVE': 3, 'CATASTROPHIC': 4}
        existing_threat_val = threat_levels.get(existing_alert.damage_threat, 0)
        new_threat_val = threat_levels.get(parsed_alert.damage_threat, 0)
        if new_threat_val > existing_threat_val:
            existing_alert.damage_threat = parsed_alert.damage_threat

        # --- Other housekeeping updates ---
        # Append raw text from updates instead of overwriting.
        if parsed_alert.raw_text not in existing_alert.raw_text:
             existing_alert.raw_text += f"\n\n--- UPDATE ---\n\n{parsed_alert.raw_text}"
        
        existing_alert.polygon = parsed_alert.polygon
        existing_alert.expiration_time = parsed_alert.expiration_time
        
        broadcast_needed = True

    else:
        # This block handles the very first time an alert (like the initial SEL) is seen.
        if parsed_alert.phenomenon in HIGH_PRIORITY_ALERTS:
            print(f"🔔 New high-priority alert: {alert_id_to_manage}. Triggering chime.")
            chime_message = json.dumps({"type": "new_alert", "alert_data": parsed_alert.to_json()})
            asyncio.create_task(broadcast_message(chime_message))
            asyncio.create_task(send_alert_to_google_chat(parsed_alert))
        
        print(f"➕ New alert added: {alert_id_to_manage}")
        active_alerts[alert_id_to_manage] = parsed_alert
        broadcast_needed = True

    if await clear_expired_alerts():
        broadcast_needed = True

    if broadcast_needed:
        await broadcast_updates()


async def clear_expired_alerts():
    """
    Performs a single pass to remove expired alerts from the global list.
    Returns True if alerts were removed, False otherwise.
    """
    now_utc = datetime.now(timezone.utc)
    initial_count = len(active_alerts)
    
    unexpired_alerts = {
        alert_id: alert for alert_id, alert in active_alerts.items()
        if not (alert.expiration_time and alert.expiration_time < now_utc)
    }
    
    if len(unexpired_alerts) < initial_count:
        print(f"🧹 Cleared {initial_count - len(unexpired_alerts)} expired alert(s).")
        active_alerts.clear()
        active_alerts.update(unexpired_alerts)
        return True
    return False

async def background_cleanup_task():
    """The background task that periodically clears expired alerts."""
    while True:
        await asyncio.sleep(60)
        # If the cleanup removed any alerts, broadcast the changes to all clients.
        if await clear_expired_alerts():
            await broadcast_updates()

    

async def broadcast_updates():
    if not connected_clients:
        return
    ticker_speed = config.get("ticker_rotation_speed_ms", 10000)
    no_alerts_message = config.get("ticker_no_alerts_message", "No Active Alerts")
    dashboard_password = config.get("dashboard_password")
    alerts_list = [alert.to_json() for alert in active_alerts.values()]
    statewide_summary = create_statewide_summary(alerts_list)
    
    message_data = {
        "type": "update",
        "source": config.get("alert_source", "nwws"),
        "alerts": [alert.to_json() for alert in active_alerts.values()],
        "recent_products": list(recent_products),
        "manual_lsrs": manual_lsrs,
        "ticker_rotation_speed_ms": ticker_speed,
        "ticker_no_alerts_message": no_alerts_message,
        "dashboard_password": dashboard_password,
        "ticker_sponsor": config.get("ticker_sponsor"),
        "afds": latest_afds,
        "ticker_suppress_sps_on_outbreak": config.get("ticker_suppress_sps_on_outbreak", False),
        "statewide_summary": statewide_summary,
        "storm_threat_data": latest_storm_threats
    }
    message = json.dumps(message_data, indent=2)
    
    await asyncio.gather(*[client.send(message) for client in connected_clients], return_exceptions=True)

async def broadcast_message(message: str):
    """Broadcasts a raw message string to all connected clients."""
    if connected_clients:
        # Use asyncio.gather to send messages to all clients concurrently
        await asyncio.gather(*[client.send(message) for client in connected_clients], return_exceptions=True)

async def client_handler(websocket):
    connected_clients.add(websocket)
    print(f"\n💻 New client connected. Total clients: {len(connected_clients)}")
    try:
        # First, clean up any expired alerts before sending the initial state.
        await clear_expired_alerts()
        # Then, send the clean list to the new client.
        await broadcast_updates()

        async for message in websocket:
            try:
                data = json.loads(message)
                if data.get('type') == 'feature_alert':
                    print(f"Featuring alert: {data.get('alert_data', {}).get('product_id')}")
                    # Re-broadcast this message to all clients (including the new widget)
                    await broadcast_message(message)
                    
                elif data.get('type') == 'manual_lsr':
                    report_payload = data.get('payload', {})
                    if 'lat' in report_payload and 'lng' in report_payload:
                        # Add server-side info to the report
                        report_payload['id'] = str(uuid.uuid4())
                        report_payload['timestamp'] = datetime.now(timezone.utc).isoformat()
                        print(f"📝 Received manual storm report: {report_payload['typeText']}")
                        manual_lsrs.append(report_payload)
                        # Immediately broadcast the update so everyone sees it
                        await broadcast_updates()
                
                elif data.get('type') == 'feature_camera':
                    print(f"Featuring ODOT Camera: {data.get('camera_data', {}).get('title')}")
                    # Re-broadcast this message to all clients (including our new camera widget)
                    await broadcast_message(message)
                    
                elif data.get('type') == 'hide_camera_widget':
                    print("Broadcasting request to hide camera widget.")
                    await broadcast_message(message)
                    
                elif data.get('type') == 'clear_manual_lsrs':
                    print("🗑️ Clearing all manual storm reports.")
                    manual_lsrs.clear() # This empties the list
                    await broadcast_updates() # This tells everyone the list is now empty
                    
                elif data.get('type') == 'update_ticker_settings':
                    settings = data.get('settings', {})
                    print(f"⚙️ Received ticker settings to broadcast: {settings}")
                    
                    # Prepare the message to send out to all ticker clients
                    broadcast_payload = {
                        "type": "ticker_settings_update",
                        "settings": settings
                    }
                    
                    # Use the existing broadcast function to send to all clients
                    await broadcast_message(json.dumps(broadcast_payload))
                    
                elif data.get('type') in ['show_lower_third', 'hide_lower_third']:
                    print(f"Broadcasting command: {data.get('type')}")
                    await broadcast_message(message)
                
                elif data.get('type') == 'zoom' and 'location' in data:
                    location = data['location']
                    print(f"🔎 Received zoom request for: {location}")
                    loop = asyncio.get_running_loop()
                    await loop.run_in_executor(
                        None,
                        weatherwise_control.zoom_to_location,
                        location
                    )
            except json.JSONDecodeError:
                print(f"Received non-JSON message: {message}")
            except Exception as e:
                print(f"Error processing client message: {e}")
    except websockets.exceptions.ConnectionClosed:
        print("Client connection closed.")
    finally:
        connected_clients.remove(websocket)
        print(f"Client disconnected. Total clients: {len(connected_clients)}")

def start_http_server():
        """Starts a simple HTTP server in a separate thread."""
    # This handler will serve files from the directory where you run the script
        handler = http.server.SimpleHTTPRequestHandler
    
    # Create and start the server
        with socketserver.TCPServer(("", HTTP_PORT), handler) as httpd:
            print(f"✅ HTTP server started on http://{WEBSOCKET_HOST}:{HTTP_PORT}")
            print(f"   View your dashboard at http://<Your_Remote_IP>:{HTTP_PORT}/index.html")
            httpd.serve_forever()
            
async def watch_config_file():
    """Periodically checks the config file for changes and reloads it without a restart."""
    print("⚙️ Configuration watcher started. Checking for changes every 60 seconds.")
    while True:
        await asyncio.sleep(60)
        try:
            with open('config.json', 'r') as f:
                new_config = json.load(f)
            
            # If the file content is different from the in-memory config
            if new_config != config:
                print("⚙️ Detected change in config.json. Reloading configuration...")
                # Update the existing config dictionary in place
                config.clear()
                config.update(new_config)
                
                # Broadcast updates to clients so they get the new settings
                await broadcast_updates()

        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"⚠️ Error reloading config.json: {e}. Keeping previous configuration.")
        except Exception as e:
            print(f"An unexpected error occurred while watching config file: {e}")


async def check_for_restart():
    """Checks if the configured restart interval has passed and triggers a graceful restart."""
    print(f"⏲️ Scheduled restart enabled. Checking every 60 minutes for a restart after {_RESTART_INTERVAL_HOURS} hours.")
    while True:
        await asyncio.sleep(3600)  # Check every 60 minutes
        elapsed_time = datetime.now() - _SERVER_START_TIME
        if elapsed_time.total_seconds() > _RESTART_INTERVAL_HOURS * 3600:
            print("⏳ Scheduled restart initiated. Saving state and restarting server...")
            save_alerts_to_disk()
            # Find and terminate the current process to trigger the restart mechanism
            os.kill(os.getpid(), signal.SIGINT)



async def main():
    # Start the HTTP server in a daemon thread so it doesn't block the main app
    http_thread = threading.Thread(target=start_http_server, daemon=True)
    http_thread.start()
    load_ugc_database()

    
    load_alerts_from_disk()
    
    
    asyncio.create_task(background_cleanup_task())
    asyncio.create_task(watch_config_file())
    asyncio.create_task(poll_google_chat_messages())
    asyncio.create_task(poll_storm_threat_data())

    
    if _RESTART_INTERVAL_HOURS > 0:
        asyncio.create_task(check_for_restart())
    
    
    async with websockets.serve(client_handler, WEBSOCKET_HOST, WEBSOCKET_PORT):
        print(f"✅ WebSocket server started on ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}")

        if config.get("alert_source") == "nws_api":
            print("✅ Running in NWS API mode.")
            await poll_nws_api()
        else:
            print("✅ Running in NWWS (XMPP) mode.")
            jid = f"{NWWS_USERNAME}@nwws-oi.weather.gov"
            xmpp = NWWSBot(jid, NWWS_PASSWORD)
            xmpp.register_plugin('xep_0045')
            xmpp.connect()
            await asyncio.Event().wait()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='%(levelname)-8s %(message)s')
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down...")