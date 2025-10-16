document.addEventListener('DOMContentLoaded', () => {
    //const WEBSOCKET_URL = "ws://localhost:8765";
    const WEBSOCKET_URL = CONFIG.websocket_url;
    const NEW_ALERT_DURATION_MS = 15000;
    const newAlertContainer = document.getElementById('new-alert-notification');
    let seenAlertProductIDs = new Set();

    const alertSound = document.getElementById('alertTone');

    const ALERT_TYPE_MAP = {
    // Warnings
    "TO": { name: "Tornado Warning", icon: "fa-wind" },
    "SV": { name: "Severe T-Storm Warning", icon: "fa-cloud-bolt" },
    "SVR": { name: "Severe T-Storm Warning", icon: "fa-cloud-bolt" },
    "FF": { name: "Flash Flood Warning", icon: "fa-cloud-showers-heavy" },
    "FFW": { name: "Flash Flood Warning", icon: "fa-cloud-showers-heavy" },
    "SPS": { name: "Special Weather Statement", icon: "fa-info-circle" },
    // Watches
    "TOA": { name: "Tornado Watch", icon: "fa-wind" },
    "SVA": { name: "Severe Thunderstorm Watch", icon: "fa-cloud-bolt" },
    "FFA": { name: "Flash Flood Watch", icon: "fa-cloud-showers-heavy" }
};
    const STATE_MAP = { 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'AS': 'American Samoa', 'DC': 'District of Columbia', 'FM': 'Micronesia', 'GU': 'Guam', 'MH': 'Marshall Islands', 'MP': 'Northern Mariana Islands', 'PW': 'Palau', 'PR': 'Puerto Rico', 'VI': 'U.S. Virgin Islands' };

    function connect() {
        const socket = new WebSocket(WEBSOCKET_URL);
        socket.onopen = () => console.log("New Alert Notifier connected.");
        socket.onclose = () => setTimeout(connect, 5000);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // --- MODIFICATION START: Listen for the correct message from the backend ---
            // The backend now sends a specific 'new_alert' message, which is more efficient.
            if (data.type === 'new_alert' && data.alert_data) {
                showNewAlertNotification(data.alert_data);
            }
        };
    }

    function getAlertDisplayInfo(alert) {
        let info = { ...(ALERT_TYPE_MAP[alert.phenomenon] || { name: alert.phenomenon }) };
        if (alert.is_emergency) {
            info.name = alert.phenomenon === 'TO' ? "Tornado Emergency" : "Flash Flood Emergency";
        }
        let stateName = '';
        if (alert.affected_areas && alert.affected_areas.length > 0) {
            stateName = STATE_MAP[alert.affected_areas[0].substring(0, 2).toUpperCase()];
        } else if (alert.display_locations) {
            const match = alert.display_locations.match(/,\s*([A-Z]{2})/);
            if (match) stateName = STATE_MAP[match[1].toUpperCase()];
        }
        if (stateName) info.name += ` - ${stateName}`;
        return info;
    }

    function showNewAlertNotification(alert) {
        const alertInfo = getAlertDisplayInfo(alert);
        document.getElementById('new-alert-title').textContent = `JUST ISSUED: ${alertInfo.name}`;
        document.getElementById('new-alert-location').textContent = alert.display_locations;
        newAlertContainer.className = `widget-container ${alert.phenomenon}`;
        if (alert.is_emergency) newAlertContainer.classList.add('EMERGENCY');
        newAlertContainer.classList.add('visible');

        const soundEnabled = localStorage.getItem('soundEnabled');
        if (alertSound && soundEnabled !== 'false') { // Defaults to ON if not set
            alertSound.play().catch(e => console.error("Error playing sound:", e));
        }
        
        setTimeout(() => newAlertContainer.classList.remove('visible'), NEW_ALERT_DURATION_MS);
    }

    connect();
});