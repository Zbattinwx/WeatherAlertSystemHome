# weatherwise_control.py
import pyautogui
import time
import sys
import pygetwindow as gw

# The script will look for any window title containing this text.
WEATHERWISE_PARTIAL_TITLE = '- WeatherWise'

def zoom_to_location(location_name: str):
    """
    Finds the Weatherwise window, activates it, and automates the search.
    """
    print(f"--- AUTOMATION: Zooming to '{location_name}' ---")
    try:
        # Step 1: Find and focus the Weatherwise window.
        print(f"Searching for a window containing: '{WEATHERWISE_PARTIAL_TITLE}'")
        
        target_window = None
        all_windows = gw.getAllWindows()
        for window in all_windows:
            if WEATHERWISE_PARTIAL_TITLE in window.title:
                target_window = window
                break

        if not target_window:
            print(f"ERROR: Could not find a window with title containing '{WEATHERWISE_PARTIAL_TITLE}'.")
            return False
        
        # Activate the window
        try:
            target_window.activate()
        except Exception:
            # This often raises a non-fatal error on Windows, we can ignore it
            print("Activated window, continuing with automation...")
        
        time.sleep(1.0) # Allow time for window to settle

        # Step 2: Perform the search automation
        pyautogui.press('s')
        time.sleep(0.5)
        pyautogui.write(location_name, interval=0.05)
        time.sleep(0.4)
        pyautogui.press('enter')

        print("--- AUTOMATION: Complete ---")
        return True

    except Exception as e:
        print(f"--- AUTOMATION ERROR: {e} ---")
        return False

# This block allows you to test the script by running it directly
# To use: python weatherwise_control.py
if __name__ == '__main__':
    print("Running in test mode...")
    # Make sure your WeatherWise application is open before running the test
    test_location = "New York"
    print(f"Attempting to zoom to test location: {test_location}")
    time.sleep(3) # Gives you 3 seconds to focus the WeatherWise window manually if needed
    zoom_to_location(test_location)