# alert_parser.py
import re
from datetime import datetime, timedelta, timezone
from alert import Alert
from ugc_parser import UGC_TO_COUNTY

TIMEZONE_MAP = {
    'EST': timezone(timedelta(hours=-5)), 'EDT': timezone(timedelta(hours=-4)),
    'CST': timezone(timedelta(hours=-6)), 'CDT': timezone(timedelta(hours=-5)),
    'MST': timezone(timedelta(hours=-7)), 'MDT': timezone(timedelta(hours=-6)),
    'PST': timezone(timedelta(hours=-8)), 'PDT': timezone(timedelta(hours=-7)),
    'AKST': timezone(timedelta(hours=-9)), 'AKDT': timezone(timedelta(hours=-8)),
    'HST': timezone(timedelta(hours=-10)), 'UTC': timezone.utc, 'Z': timezone.utc
}

def get_storm_motion_string(degrees, knots):
    """Converts direction in degrees and speed in knots to a formatted string."""
    if degrees is None or knots is None:
        return None
    
    # Convert knots to mph
    mph = round(knots * 1.15078)
    
    # To get the direction the storm is moving TOWARDS, we add 180 degrees.
    # The modulo operator (%) ensures the result wraps around the 360-degree compass.
    destination_degrees = (degrees + 180) % 360
    
    # Convert degrees to cardinal direction
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    ix = round(destination_degrees / (360. / len(dirs)))
    direction = dirs[ix % len(dirs)]
    
    return f"{direction} {mph} MPH"

def get_location_string(ugc_list):
    """Translates UGC codes into a formatted string of "County, ST" names."""
    if not ugc_list:
        return "Unknown Location"
    locations = [UGC_TO_COUNTY.get(code, {'name': code, 'state': ''}) for code in sorted(list(set(ugc_list)))]
    location_strings = sorted(list(set(f"{loc['name']}, {loc['state']}".strip(', ') for loc in locations)))
    if len(location_strings) == 1: return location_strings[0]
    if len(location_strings) == 2: return f"{location_strings[0]} and {location_strings[1]}"
    return ", ".join(location_strings[:-1]) + f", and {location_strings[-1]}"

def parse_ugc_line(ugc_line_text: str) -> list:
    """Parses a condensed UGC line, including ranges (e.g., 001>005), into a full list of UGC codes."""
    full_codes = []
    # Clean up the line by removing the trailing timestamp and any extra dashes
    cleaned_text = re.sub(r'-\d{6}-?$', '', ugc_line_text).strip('-')
    
    # Extract the prefix (e.g., VAZ, MEC)
    prefix_match = re.match(r'([A-Z]{2}[CZ])', cleaned_text)
    if not prefix_match:
        return []
    prefix = prefix_match.group(1)
    
    # Remove the prefix to isolate the number parts
    number_text = cleaned_text[len(prefix):]

    parts = number_text.split('-')
    for part in parts:
        if not part: continue
        if '>' in part: # Handle ranges like "032>034"
            try:
                start, end = map(int, part.split('>'))
                for i in range(start, end + 1):
                    full_codes.append(f"{prefix}{str(i).zfill(3)}")
            except ValueError:
                continue # Skip malformed range
        elif part.isdigit(): # Handle individual numbers
            full_codes.append(f"{prefix}{part.zfill(3)}")
            
    return full_codes

def parse_alert(raw_alert_text: str) -> Alert:
    """
    Parses a weather alert, including VTEC, threats, and polygon coordinates.
    """
    alert = Alert(raw_text=raw_alert_text)
    is_xml = bool(re.search(r'<alert.*?>', raw_alert_text, re.DOTALL))
    upper_text = raw_alert_text.upper()

    expires_match = re.search(r'<(?:eventEndingTime|expires)>(.*?)</(?:eventEndingTime|expires)>', raw_alert_text)
    if expires_match:
        try:
            alert.expiration_time = datetime.fromisoformat(expires_match.group(1))
        except (ValueError, TypeError):
            pass

    if is_xml:
        fips_codes = re.findall(r'<valueName>(?:FIPS6|SAME)</valueName>[\s\S]*?<value>(\d{5,6})</value>', raw_alert_text)
        if fips_codes:
            alert.fips_codes = [f.zfill(6) for f in fips_codes]

        ugc_codes = re.findall(r'<valueName>UGC</valueName>[\s\S]*?<value>([A-Z]{2}[CZ]\d{3})</value>', raw_alert_text)
        if ugc_codes:
            alert.affected_areas = ugc_codes
            alert.display_locations = get_location_string(ugc_codes)
        else:
            area_desc_match = re.search(r'<areaDesc>([\s\S]*?)</areaDesc>', raw_alert_text)
            if area_desc_match:
                alert.display_locations = area_desc_match.group(1).replace(';', ',').replace('\n', ' ')
    else:
        # --- REVISED UGC PARSING LOGIC ---
        all_ugcs = []
        
        # Find UGC blocks, which may span multiple lines, and end with a timestamp.
        # The `[\s\S]*?` part is crucial as it matches any character including newlines.
        ugc_block_list = re.findall(r'^[A-Z]{2}[CZ][\s\S]*?-\d{6}-?', raw_alert_text, re.MULTILINE)
        
        for block in ugc_block_list:
            # Clean the block: remove timestamp, replace newlines with dashes, and strip extra dashes.
            cleaned_block = re.sub(r'-\d{6}-?$', '', block).replace('\n', '-').strip('-')
            parts = cleaned_block.split('-')
            current_prefix = ""
            for part in parts:
                if not part: continue
                
                # Check if this part is a new state/zone prefix (e.g., OKC, ARC)
                prefix_match = re.match(r'([A-Z]{2}[CZ])', part)
                if prefix_match:
                    current_prefix = prefix_match.group(1)
                    number = part[len(current_prefix):]
                    if number.isdigit():
                        all_ugcs.append(f"{current_prefix}{number.zfill(3)}")
                # Otherwise, if it's just a number, use the last seen prefix
                elif part.isdigit() and current_prefix:
                    all_ugcs.append(f"{current_prefix}{part.zfill(3)}")

        if all_ugcs:
            alert.affected_areas = sorted(list(set(all_ugcs)))
            alert.display_locations = get_location_string(alert.affected_areas)
        else:
            # Fallback for watch products that only list counties by name
            counties_block_match = re.search(r'IN (?:.*?) THIS WATCH INCLUDES \d+ COUNTIES\n\n(?:.*\n\n)?((?:.|\n)*?)\$\$', upper_text)
            if counties_block_match:
                alert.display_locations = counties_block_match.group(1).replace('\n', ' ').replace('               ', ', ').strip()
    # --- MODIFICATION END ---

    vtec_match = re.search(r'(/O\..*?/)', raw_alert_text)
    if vtec_match:
        full_vtec_string = vtec_match.group(1)
        alert.vtec_string = full_vtec_string
        try:
            vtec_parts = full_vtec_string.strip('/').split('.')
            action, office, phenomenon, significance, event_number = vtec_parts[1:6]
            
            if action in ['CAN', 'EXP']: alert.is_cancellation = True
            elif action == 'CON': alert.is_update = True
            
            alert.significance = significance.strip()
            phenomenon_clean = phenomenon.strip()
            significance_clean = significance.strip()
            
            if significance_clean == 'A':
                alert.phenomenon = f"{phenomenon_clean}A"
                alert.product_id = f"{phenomenon_clean}.{significance_clean}.{event_number.strip()}"
            else:
                alert.phenomenon = phenomenon_clean
                alert.product_id = f"{phenomenon_clean}.{office.strip()}.{event_number.strip()}"

            if not alert.expiration_time:
                alert.expiration_time = Alert.from_vtec_string(full_vtec_string)
        except (IndexError, ValueError): 
            pass

    elif re.search(r'^\s*Special Weather Statement', raw_alert_text, re.MULTILINE | re.IGNORECASE):
        alert.phenomenon = "SPS"
        awips_id_match = re.search(r'<valueName>AWIPSidentifier</valueName>\s*<value>(.*?)</value>', raw_alert_text) or re.search(r'^\s*([A-Z]{6})\s*$', raw_alert_text, re.MULTILINE)
        if awips_id_match: alert.product_id = awips_id_match.group(1).strip()
        
        if not alert.expiration_time:
            expires_match_text = re.search(r'(?:UNTIL|EXPIRES AT|THROUGH|AFTER|BY)\s+(\d{3,4})\s+(AM|PM)?\s*([A-Z]{3,4})?', upper_text)
            if expires_match_text:
                try:
                    time_str, am_pm, tz_str = expires_match_text.groups()
                    time_str = time_str.zfill(4)
                    hour, minute = int(time_str[:2]), int(time_str[2:])
                    if am_pm == 'PM' and hour != 12: hour += 12
                    elif am_pm == 'AM' and hour == 12: hour = 0
                    tz_info = TIMEZONE_MAP.get(tz_str)
                    now_in_tz = datetime.now(tz_info)
                    expire_time = now_in_tz.replace(hour=hour, minute=minute, second=0, microsecond=0)
                    if expire_time < now_in_tz:
                        expire_time += timedelta(days=1)
                    alert.expiration_time = expire_time
                except Exception:
                    pass
    
    if 'TORNADO...OBSERVED' in upper_text: alert.tornado_observed = True
    if 'TORNADO EMERGENCY' in upper_text or 'FLASH FLOOD EMERGENCY' in upper_text: alert.is_emergency = True
    if 'TORNADO...POSSIBLE' in upper_text: alert.tornado_possible = True
    if 'DAMAGE THREAT...CATASTROPHIC' in upper_text: alert.damage_threat = 'CATASTROPHIC'
    elif any(s in upper_text for s in ['DAMAGE THREAT...DESTRUCTIVE', 'HAIL THREAT...DESTRUCTIVE', 'WIND THREAT...DESTRUCTIVE']):
        alert.damage_threat = 'DESTRUCTIVE'
    elif 'DAMAGE THREAT...CONSIDERABLE' in upper_text: alert.damage_threat = 'CONSIDERABLE'

    detection_match = re.search(r'<tornadoDetection>([\s\S]*?)</tornadoDetection>', raw_alert_text)
    if detection_match:
        status = detection_match.group(1).strip().upper()
        alert.tornado_detection = status
        # If the detection status is OBSERVED, also set the boolean flag for consistency
        if status == 'OBSERVED':
            alert.tornado_observed = True
    
    # --- WIND GUST PARSING ---
    # Method 1: Look for the structured XML-like tag.
    wind_gust_match = re.search(r'<maxWindGust>([\s\S]*?)</maxWindGust>', raw_alert_text)
    if wind_gust_match:
        alert.max_wind_gust = wind_gust_match.group(1).strip()
    else:
        # Method 2: Fallback to the plain text MAX... line (case-insensitive).
        wind_gust_match = re.search(r'^MAX WIND GUST\.\.\.(.*)$', raw_alert_text, re.MULTILINE | re.IGNORECASE)
        if wind_gust_match:
            alert.max_wind_gust = wind_gust_match.group(1).strip()
        else:
            # Method 3: Final fallback to the HAZARD... line.
            wind_hazard_match = re.search(r'HAZARD\.\.\.([\s\S]*?)(\d+\s*MPH)', upper_text)
            if wind_hazard_match:
                alert.max_wind_gust = wind_hazard_match.group(2)

    # --- HAIL SIZE PARSING ---
    # Method 1: Look for the structured XML-like tag.
    hail_size_match = re.search(r'<maxHailSize>([\s\S]*?)</maxHailSize>', raw_alert_text)
    if hail_size_match:
        alert.max_hail_size = hail_size_match.group(1).strip().replace("Up to ", "") + '"'
    else:
        # Method 2: Fallback to the plain text MAX... line (case-insensitive).
        hail_size_match = re.search(r'^MAX HAIL SIZE\.\.\.(.*)$', raw_alert_text, re.MULTILINE | re.IGNORECASE)
        if hail_size_match:
            hail_val = hail_size_match.group(1).strip()
            # Don't display hail if the value is 0.00 IN
            if "0.00" not in hail_val:
                alert.max_hail_size = hail_val
        else:
            # Method 3: Final fallback to the HAZARD... line.
            hail_hazard_match = re.search(r'HAZARD\.\.\.([\s\S]*?)(?:AND\s+)?((?:[\d\.]+\s*INCH|GOLF\s*BALL|QUARTER|NICKEL|DIME|PEA)\s*SIZE\s*HAIL)', upper_text)
            if hail_hazard_match:
                alert.max_hail_size = hail_hazard_match.group(2).replace(" SIZE HAIL", "").strip()
                
    motion_deg, motion_kt = None, None

    # Method 1: Look for the structured XML parameter
    motion_match_xml = re.search(r'<valueName>eventMotionDescription</valueName>\s*<value>.*?\.\.\.(\d{3})DEG\.\.\.(\d+)KT.*?</value>', raw_alert_text)
    if motion_match_xml:
        try:
            motion_deg = int(motion_match_xml.group(1))
            motion_kt = int(motion_match_xml.group(2))
        except (ValueError, IndexError):
            pass
    else:
        # Method 2: Look for the text-based TIME...MOT...LOC line
        motion_match_text = re.search(r'TIME\.\.\.MOT\.\.\.LOC\s+\d+Z\s+(\d{3})DEG\s+(\d+)KT', raw_alert_text)
        if motion_match_text:
            try:
                motion_deg = int(motion_match_text.group(1))
                motion_kt = int(motion_match_text.group(2))
            except (ValueError, IndexError):
                pass

    if motion_deg is not None and motion_kt is not None:
        alert.storm_motion = get_storm_motion_string(motion_deg, motion_kt)

    polygon_list = []
    if is_xml:
        poly_matches = re.findall(r'<polygon>([\s\S]*?)</polygon>', raw_alert_text)
        for poly_str in poly_matches:
            current_poly = []
            coords = poly_str.strip().split(' ')
            for pair in coords:
                try: lat, lon = map(float, pair.split(',')); current_poly.append([lat, lon])
                except ValueError: continue
            if current_poly: polygon_list.append(current_poly)
    else:
        # --- FIX: Flexible polygon parsing for different product types ---
        # First, try to find a polygon block ending with TIME...MOT...LOC (for SPS, etc.)
        section_match = re.search(r'LAT\.\.\.LON(.*?)\n\s*TIME\.\.\.MOT\.\.\.LOC', raw_alert_text, re.DOTALL)
        
        # If that fails, fall back to looking for a block ending with $$ (for FFW, etc.)
        if not section_match:
            section_match = re.search(r'LAT\.\.\.LON(.*?)\$\$', raw_alert_text, re.DOTALL)

        if section_match:
            coord_text = section_match.group(1)
            coords = re.findall(r'\d{4}', coord_text)
            
            current_poly = []
            if len(coords) % 2 == 0:
                it = iter(coords)
                for lat_str in it:
                    try:
                        lon_str = next(it)
                        lat = float(lat_str) / 100.0
                        lon = -float(lon_str) / 100.0
                        current_poly.append([lat, lon])
                    except (StopIteration, ValueError):
                        break 
            if current_poly:
                polygon_list.append(current_poly)
    
    if len(polygon_list) == 1: alert.polygon = polygon_list[0]
    elif len(polygon_list) > 1: alert.polygon = polygon_list
        
    if not alert.expiration_time:
        is_targeted_product = alert.phenomenon in {"TO", "SV", "FF", "SS", "SPS", "SVR", "FFW", "TOA", "SVA", "FFA"}
        if is_targeted_product:
            print(f"Assigning default 60-min lifetime to {alert.product_id or 'unknown product'}")
            alert.expiration_time = datetime.now(timezone.utc) + timedelta(minutes=60)

    return alert