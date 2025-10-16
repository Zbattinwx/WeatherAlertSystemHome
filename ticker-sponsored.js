document.addEventListener("DOMContentLoaded", () => {
  const WEBSOCKET_URL = CONFIG.websocket_url;
  const tickerContainer = document.getElementById("alert-ticker");

  // --- State Management ---
  let activeAlerts = [];
  let sponsors = [];
  let currentAlertIndex = 0;
  let currentSponsorIndex = 0;
  let rotationSpeed = 10000;
  let noAlertsMessage = CONFIG.ticker_no_alerts_message || "No Active Alerts";

  // NEW: Separate timers for alerts and sponsors
  let alertTimeoutId = null;
  let sponsorIntervalId = null;
  let allActiveAlerts = [];
   let lastAlertsJSON = null;

  let tickerFilters = {
    states: [], // Empty array means allow all
    phenomena: [] // Empty array means allow all
};

  const ALERT_TYPE_MAP = {
    TO: { name: "Tornado Warning", icon: "fas fa-wind" },
    SV: { name: "Severe Thunderstorm Warning", icon: "fas fa-cloud-bolt" },
    SVR: { name: "Severe Thunderstorm Warning", icon: "fas fa-cloud-bolt" },
    FF: { name: "Flash Flood Warning", icon: "fas fa-cloud-showers-heavy" },
    FFW: { name: "Flash Flood Warning", icon: "fas fa-cloud-showers-heavy" },
    SPS: { name: "Special Weather Statement", icon: "fas fa-info-circle" },
    TOA: { name: "Tornado Watch", icon: "fas fa-wind" },
    SVA: { name: "Severe Thunderstorm Watch", icon: "fas fa-cloud-bolt" },
    FFA: { name: "Flash Flood Watch", icon: "fas fa-cloud-showers-heavy" },
    WSA: { name: "Winter Storm Watch", icon: "fas fa-snowflake" },
    WSW: { name: "Winter Storm Warning", icon: "fas fa-snowflake" },
    SQW: { name: "Snow Squall Warning", icon: "fas fa-wind" },
    WW: { name: "Winter Weather Advisory", icon: "fas fa-snowflake" },
  };
  const STATE_MAP = { AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", AS: "American Samoa", DC: "District of Columbia", FM: "Micronesia", GU: "Guam", MH: "Marshall Islands", MP: "Northern Mariana Islands", PW: "Palau", PR: "Puerto Rico", VI: "U.S. Virgin Islands" };

  function connect() {
    const socket = new WebSocket(WEBSOCKET_URL);
    socket.onopen = () => console.log("Alert Ticker connected.");
    socket.onclose = () => {
      clearTimeout(alertTimeoutId);
      clearInterval(sponsorIntervalId);
      sponsorIntervalId = null;
      setTimeout(connect, 5000);
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "update") {
        const newAlertsJSON = JSON.stringify(data.alerts || []);

        // --- NEW LOGIC ---
        // If it's not the first load AND the alert data is identical to what we already have,
        // we'll skip the visual refresh to avoid interrupting the scroll animation.
        if (lastAlertsJSON !== null && newAlertsJSON === lastAlertsJSON) {
          return; // Exit the function, leaving the animation untouched.
        }

        // --- IF DATA IS NEW OR DIFFERENT ---
        // Store the new data snapshot for the next comparison.
        lastAlertsJSON = newAlertsJSON;
        
        // Update the master list of alerts and other settings.
        allActiveAlerts = data.alerts || [];
        sponsors = data.ticker_sponsor || [];
        rotationSpeed = data.ticker_rotation_speed_ms || 10000;
        noAlertsMessage = data.ticker_no_alerts_message || "No Active Alerts";

        // Now, trigger the visual refresh because the data has changed.
        applyFiltersAndRestart();

        // (Re)start the sponsor rotation if there are sponsors.
        if (sponsors.length > 0) {
          startSponsorRotation();
        }

      } else if (data.type === 'ticker_settings_update') {
        console.log('Received new ticker settings:', data.settings);
        tickerFilters = data.settings;

        // A settings update should always trigger a visual refresh.
        applyFiltersAndRestart(); 
      }
    }
  };

  function applyFiltersAndRestart() {
    let filtered = allActiveAlerts;

    // Apply state filter if any are set
    if (tickerFilters.states && tickerFilters.states.length > 0) {
        filtered = filtered.filter(alert => {
            if (!alert.affected_areas || alert.affected_areas.length === 0) return false;
            // Check if any of the alert's areas match a state in our filter
            return alert.affected_areas.some(area => tickerFilters.states.includes(area.substring(0, 2)));
        });
    }

    // Apply phenomenon (alert type) filter if any are set
    if (tickerFilters.phenomena && tickerFilters.phenomena.length > 0) {
        filtered = filtered.filter(alert => tickerFilters.phenomena.includes(alert.phenomenon));
    }

    // Update the list of alerts that will be displayed
    activeAlerts = filtered;

    // --- THIS IS THE KEY FIX ---
    // Always clear the previous rotation and start a new one. This ensures the
    // ticker immediately reflects the current state (either showing the new
    // alerts or the "No Active Alerts" message).
    clearTimeout(alertTimeoutId);
    currentAlertIndex = 0; // Reset index to start from the beginning of the new list
    rotateAlerts();
}

  function getAlertDisplayInfo(alert) {
    let info = { ...(ALERT_TYPE_MAP[alert.phenomenon] || { name: alert.phenomenon, icon: "fa-exclamation-triangle" }), stateName: "" };
    let threatPrefix = "";
    if (alert.is_emergency) {
      info.name = alert.phenomenon === 'TO' ? "Tornado Emergency" : "Flash Flood Emergency";
    } else {
      if (alert.damage_threat === 'DESTRUCTIVE' || alert.damage_threat === 'CATASTROPHIC') { threatPrefix = `${alert.damage_threat} `; }
      else if (alert.damage_threat === 'CONSIDERABLE') { threatPrefix = `CONSIDERABLE `; }
      info.name = threatPrefix + info.name;
      if (alert.tornado_observed && alert.phenomenon === 'TO') { info.name = "Observed " + info.name; }
    }
    if (alert.affected_areas && alert.affected_areas.length > 0) {
      const stateAbbr = alert.affected_areas[0].substring(0, 2).toUpperCase();
      info.stateName = STATE_MAP[stateAbbr];
    } else if (alert.display_locations) {
      const match = alert.display_locations.match(/,\s*([A-Z]{2})/);
      if (match) info.stateName = STATE_MAP[match[1].toUpperCase()];
    }
    return info;
  }
  
  
  // NEW: A dedicated, independent loop for sponsors
  function startSponsorRotation() {
    if (sponsorIntervalId) clearInterval(sponsorIntervalId);
    
    const rotate = () => {
        const sponsorContainer = document.querySelector(".sponsor-container");
        if (!sponsorContainer || !Array.isArray(sponsors) || sponsors.length === 0) return;
        
        const sponsorText = sponsorContainer.querySelector(".sponsor-text");
        const sponsorLogo = sponsorContainer.querySelector(".sponsor-logo");
        const sponsor = sponsors[currentSponsorIndex];

        sponsorLogo.classList.add("fading");
        setTimeout(() => {
            if (sponsor.logo_url) {
                sponsorLogo.src = sponsor.logo_url;
                sponsorLogo.style.display = "block";
                sponsorText.style.display = "none";
            } else if (sponsor.text) {
                sponsorText.textContent = sponsor.text;
                sponsorText.style.display = "block";
                sponsorLogo.style.display = "none";
            }
            sponsorLogo.classList.remove("fading");
        }, 200);

        currentSponsorIndex = (currentSponsorIndex + 1) % sponsors.length;
    };
    
    rotate(); // Rotate immediately
    sponsorIntervalId = setInterval(rotate, rotationSpeed); // Then rotate on a fixed interval
  }

  // REFACTORED: This function now ONLY handles alerts
function rotateAlerts() {
    clearTimeout(alertTimeoutId);
    const locationsContainer = document.getElementById("ticker-locations");
    const locationsSpan = locationsContainer.querySelector("span");

    // Handle the "No Alerts" case
    if (activeAlerts.length === 0) {
      tickerContainer.classList.add("no-alerts-active");

      // 1. Clear all text fields to prevent stale data
      document.getElementById("ticker-title").textContent = "";
      document.getElementById("ticker-state").textContent = "";
      document.getElementById("ticker-expires-time").textContent = "";
      
      // 2. Put the "No Alerts" message in the bottom row's span
      locationsContainer.classList.remove("scrolling");
      locationsSpan.style.animationDuration = "";
      locationsSpan.textContent = noAlertsMessage;
      
      // 3. NEW: Check if the message needs to scroll
      setTimeout(() => {
        const containerWidth = locationsContainer.clientWidth;
        const textWidth = locationsSpan.scrollWidth;

        if (textWidth > containerWidth) {
          locationsContainer.classList.add("scrolling");
          const durationInSeconds = textWidth / 75; // Adjust speed here if needed
          locationsSpan.style.animationDuration = `${durationInSeconds}s`;
        }
      }, 100); // Delay to allow browser to calculate widths
      
      return; // Stop here until new alerts arrive
    }

    // --- Handle the "Has Alerts" case ---
    tickerContainer.classList.remove("no-alerts-active");

    if (currentAlertIndex >= activeAlerts.length) {
      currentAlertIndex = 0;
    }
    
    const alert = activeAlerts[currentAlertIndex];
    const alertInfo = getAlertDisplayInfo(alert);
    
    // Set up the new alert's content
    tickerContainer.className = `ticker-container ${alert.phenomenon}`;
    document.querySelector(".ticker-icon i").className = `fas ${alertInfo.icon}`;
    document.getElementById("ticker-title").textContent = alertInfo.name;
    document.getElementById("ticker-state").textContent = alertInfo.stateName || "";
    const expires = alert.expiration_time ? new Date(alert.expiration_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "N/A";
    document.getElementById("ticker-expires-time").textContent = expires;
    
    locationsContainer.classList.remove("scrolling");
    locationsSpan.style.animationDuration = "";
    locationsSpan.textContent = alert.display_locations;
    
    // Calculate display time for this alert
    let displayTime = rotationSpeed;
    setTimeout(() => {
      const containerWidth = locationsContainer.clientWidth;
      const textWidth = locationsSpan.scrollWidth;
      if (textWidth > containerWidth) {
        const durationInSeconds = textWidth / 60;
        displayTime = (durationInSeconds * 1000) + 1500;
        locationsSpan.style.animationDuration = `${durationInSeconds}s`;
        locationsContainer.classList.add("scrolling");
      }
      
      currentAlertIndex++;
      alertTimeoutId = setTimeout(rotateAlerts, displayTime);
    }, 100);
}

  connect();
});