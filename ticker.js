document.addEventListener('DOMContentLoaded', () => {
    const WEBSOCKET_URL = CONFIG.websocket_url;
    const tickerContainer = document.getElementById('alert-ticker');
    
    // --- State Management ---
    let allActiveAlerts = [];
    let activeAlerts = [];
    let currentAlertIndex = 0;
    let rotationSpeed = 10000;
    let alertTimeoutId;
    let noAlertsMessage = 'No Active Alerts';
    let suppressSps = false;
    let lastAlertsJSON = null; // ADD THIS LINE to track changes

    let tickerFilters = {
        states: [],
        phenomena: []
    };

    const ALERT_TYPE_MAP = {
        "TO": { name: "Tornado Warning", icon: "fa-wind" },
        "SV": { name: "Severe T-Storm Warning", icon: "fa-cloud-bolt" },
        "SVR": { name: "Severe T-Storm Warning", icon: "fa-cloud-bolt" },
        "FF": { name: "Flash Flood Warning", icon: "fa-cloud-showers-heavy" },
        "FFW": { name: "Flash Flood Warning", icon: "fa-cloud-showers-heavy" },
        "SPS": { name: "Special Weather Statement", icon: "fa-info-circle" },
        "TOA": { name: "Tornado Watch", icon: "fa-wind" },
        "SVA": { name: "Severe Thunderstorm Watch", icon: "fa-cloud-bolt" },
        "FFA": { name: "Flash Flood Watch", icon: "fa-cloud-showers-heavy" }
    };
    const STATE_MAP = { 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'AS': 'American Samoa', 'DC': 'District of Columbia', 'FM': 'Micronesia', 'GU': 'Guam', 'MH': 'Marshall Islands', 'MP': 'Northern Mariana Islands', 'PW': 'Palau', 'PR': 'Puerto Rico', 'VI': 'U.S. Virgin Islands' };

    function connect() {
        const socket = new WebSocket(WEBSOCKET_URL);
        socket.onopen = () => console.log("Alert Ticker connected.");
        socket.onclose = () => {
            clearTimeout(alertTimeoutId);
            setTimeout(connect, 5000);
        };
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'update') {
                const newAlertsJSON = JSON.stringify(data.alerts || []);

                // If alert data hasn't changed, do nothing to prevent interrupting the scroll.
                if (lastAlertsJSON !== null && newAlertsJSON === lastAlertsJSON) {
                    return; 
                }

                // If data IS new, store it and update the ticker.
                lastAlertsJSON = newAlertsJSON;
                
                allActiveAlerts = data.alerts;
                rotationSpeed = data.ticker_rotation_speed_ms || 10000;
                noAlertsMessage = data.ticker_no_alerts_message || 'No Active Alerts';
                suppressSps = data.ticker_suppress_sps_on_outbreak || false;
                applyFilters();

            } else if (data.type === 'ticker_settings_update') {
                console.log('Received new ticker settings:', data.settings);
                tickerFilters = data.settings;
                applyFilters();
            }
        }
    };

    function applyFilters() {
        let filtered = allActiveAlerts;

        const severeWarningCount = allActiveAlerts.filter(alert => alert.phenomenon !== 'SPS').length;
        if (suppressSps && severeWarningCount >= 3) {
            filtered = allActiveAlerts.filter(alert => alert.phenomenon !== 'SPS');
        }

        if (tickerFilters.states && tickerFilters.states.length > 0) {
            filtered = filtered.filter(alert => {
                if (!alert.affected_areas || alert.affected_areas.length === 0) return false;
                return alert.affected_areas.some(area => tickerFilters.states.includes(area.substring(0, 2)));
            });
        }

        if (tickerFilters.phenomena && tickerFilters.phenomena.length > 0) {
            filtered = filtered.filter(alert => tickerFilters.phenomena.includes(alert.phenomenon));
        }

        activeAlerts = filtered;

        clearTimeout(alertTimeoutId);
        currentAlertIndex = 0;
        rotateAlerts();
    }

    function getAlertDisplayInfo(alert) {
        let info = {
            ...(ALERT_TYPE_MAP[alert.phenomenon] || { name: alert.phenomenon, icon: 'fa-exclamation-triangle' }),
            stateName: ''
        };
        
        let threatPrefix = '';
        if (alert.is_emergency) {
            info.name = alert.phenomenon === 'TO' ? "Tornado Emergency" : "Flash Flood Emergency";
        } else {
            if (alert.damage_threat === 'DESTRUCTIVE' || alert.damage_threat === 'CATASTROPHIC') {
                threatPrefix = `${alert.damage_threat} `;
            } else if (alert.damage_threat === 'CONSIDERABLE') {
                threatPrefix = `CONSIDERABLE `;
            }
            info.name = threatPrefix + info.name;
            if (alert.tornado_observed && alert.phenomenon === 'TO') {
                info.name = "Observed " + info.name;
            }
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

    function rotateAlerts() {
        clearTimeout(alertTimeoutId);
        const locationsContainer = document.getElementById('ticker-locations');
        const locationsSpan = locationsContainer.querySelector('span');

        if (activeAlerts.length === 0) {
            tickerContainer.classList.add('no-alerts-active');
            document.getElementById('ticker-title').textContent = "";
            document.getElementById('ticker-state').textContent = "";
            document.getElementById('ticker-expires-time').textContent = "";
            locationsContainer.classList.remove('scrolling');
            locationsSpan.style.animationDuration = '';
            locationsSpan.textContent = noAlertsMessage;

            setTimeout(() => {
                const containerWidth = locationsContainer.clientWidth;
                const textWidth = locationsSpan.scrollWidth;
                if (textWidth > containerWidth) {
                    locationsContainer.classList.add("scrolling");
                    const durationInSeconds = textWidth / 75;
                    locationsSpan.style.animationDuration = `${durationInSeconds}s`;
                }
            }, 100);
            return;
        }

        tickerContainer.classList.remove('no-alerts-active');
        
        if (currentAlertIndex >= activeAlerts.length) {
            currentAlertIndex = 0;
        }

        const alert = activeAlerts[currentAlertIndex];
        const alertInfo = getAlertDisplayInfo(alert);

        locationsContainer.classList.remove('scrolling');
        locationsSpan.style.animationDuration = '';

        document.querySelector('.ticker-icon i').className = `fas ${alertInfo.icon}`;
        document.getElementById('ticker-title').textContent = alertInfo.name;
        document.getElementById('ticker-state').textContent = alertInfo.stateName || '';
        const expires = alert.expiration_time ? new Date(alert.expiration_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        document.getElementById('ticker-expires-time').textContent = expires;
        locationsSpan.textContent = alert.display_locations;
        tickerContainer.className = `ticker-container ${alert.phenomenon}`;

        let displayTime = rotationSpeed;
        setTimeout(() => {
            const containerWidth = locationsContainer.clientWidth;
            const textWidth = locationsSpan.scrollWidth;
            if (textWidth > containerWidth) {
                const durationInSeconds = textWidth / 60;
                displayTime = (durationInSeconds * 1000) + 1500;
                locationsSpan.style.animationDuration = `${durationInSeconds}s`;
                locationsContainer.classList.add('scrolling');
            }
            
            currentAlertIndex++;
            alertTimeoutId = setTimeout(rotateAlerts, displayTime);
        }, 100);
    }

    connect();
});