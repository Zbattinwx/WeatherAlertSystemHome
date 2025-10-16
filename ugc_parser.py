# ugc_parser.py

UGC_TO_COUNTY = {}

def load_ugc_database():
    """
    Reads the ugc_database.txt file and populates the UGC_TO_COUNTY dictionary,
    now correctly formatting Zone codes with a 'Z'.
    """
    try:
        with open('ugc_database.txt', 'r', encoding='utf-8') as f:
            for line in f:
                if '|' not in line:
                    continue
                parts = line.strip().split('|')
                if len(parts) < 7:
                    continue # Skip malformed lines

                state_abbr = parts[0]
                location_name = parts[3]
                ugc_code_base = parts[4] # This is in the format "ST###" e.g., "FL140"
                county_name = parts[5]
                fips_code = parts[6]

                # --- CORRECTED LOGIC ---
                # Always construct the full Zone code (FLZ140) for the dictionary key
                if ugc_code_base and len(ugc_code_base) > 2:
                    # Construct the proper Zone code (e.g., FLZ140 from FL140)
                    zone_ugc = f"{ugc_code_base[:2]}Z{ugc_code_base[2:]}"
                    UGC_TO_COUNTY[zone_ugc] = {"name": location_name, "state": state_abbr}

                # Also create the County code (e.g., FLC083 from Marion County's FIPS)
                if fips_code and len(fips_code) == 5:
                    county_ugc = f"{state_abbr}C{fips_code[2:]}"
                    if county_ugc not in UGC_TO_COUNTY: # Don't overwrite if a zone already exists with this name
                         UGC_TO_COUNTY[county_ugc] = {"name": county_name, "state": state_abbr}

        print(f"✅ Successfully loaded {len(UGC_TO_COUNTY)} UGC codes into memory.")
        return True
        
    except FileNotFoundError:
        print("❌ CRITICAL: ugc_database.txt not found. County name lookup will not work.")
        return False
    except Exception as e:
        print(f"❌ An error occurred while loading the UGC database: {e}")
        return False