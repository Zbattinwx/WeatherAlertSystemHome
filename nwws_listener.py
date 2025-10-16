# nwws_listener.py
import time
from typing import Callable

def listen_for_alerts(on_alert_received: Callable[[str], None]):
    """
    Simulates listening for alerts from the NWWS.
    In a real application, this would connect to the XMPP server.
    """
    print("Listener started. Simulating incoming alert in 5 seconds...")
    time.sleep(5)

    # --- This is a sample alert text ---
    # In a real app, this would come from the live feed.
    sample_alert = """
911 
WWUS54 KBMX 091807
SVSBMX
ALC001-005-007-009-011-015-017-019-021-027-029-037-047-051-055-091815-

SEVERE WEATHER STATEMENT
NATIONAL WEATHER SERVICE BIRMINGHAM AL
107 PM CDT TUE JUL 9 2024

...THE SEVERE THUNDERSTORM WARNING FOR ETOWAH...SOUTHEASTERN
BLOUNT...SOUTHWESTERN CHEROKEE AND NORTHWESTERN CALHOUN COUNTIES IS
CANCELLED...

THE STORMS WHICH PROMPTED THE WARNING HAVE WEAKENED BELOW SEVERE
LIMITS...AND NO LONGER POSE AN IMMEDIATE THREAT TO LIFE OR PROPERTY.
THEREFORE...THE WARNING HAS BEEN CANCELLED.

$$

/O.CAN.KBMX.SV.W.0253.000000T0000Z-240709T1815Z/
"""
    # ------------------------------------

    print("Alert Received!")
    on_alert_received(sample_alert)