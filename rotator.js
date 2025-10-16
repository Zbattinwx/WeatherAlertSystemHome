document.addEventListener('DOMContentLoaded', () => {
    const WEBSOCKET_URL = "ws://localhost:8765";
    //const WEBSOCKET_URL = CONFIG.websocket_url;
    const ROTATION_SPEED_MS = 10000;
    const rotatorContainer = document.getElementById('alert-rotator');
    let activeAlerts = [];
    let currentRotationIndex = 0;
    let rotationInterval;

    const ALERT_TYPE_MAP = { "TO": { name: "Tornado Warning" }, "SV": { name: "Severe Thunderstorm Warning" }, "SVR": { name: "Severe Thunderstorm Warning" }, "FF": { name: "Flash Flood Warning" }, "FFW": { name: "Flash Flood Warning" }, "SPS": { name: "Special Weather Statement" } };
    const STATE_MAP = { 'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'AS': 'American Samoa', 'DC': 'District of Columbia', 'FM': 'Micronesia', 'GU': 'Guam', 'MH': 'Marshall Islands', 'MP': 'Northern Mariana Islands', 'PW': 'Palau', 'PR': 'Puerto Rico', 'VI': 'U.S. Virgin Islands' };

    function connect() {
        const socket = new WebSocket(WEBSOCKET_URL);
        socket.onopen = () => console.log("Alert Rotator connected.");
        socket.onclose = () => setTimeout(connect, 5000);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'update') {
                activeAlerts = data.alerts;
                updateRotator();
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

    function updateRotator() {
        clearInterval(rotationInterval);
        if (activeAlerts.length === 0) {
            rotatorContainer.classList.remove('visible');
            return;
        }
        displayRotatedAlert();
        if (activeAlerts.length > 1) {
            rotationInterval = setInterval(displayRotatedAlert, ROTATION_SPEED_MS);
        }
    }

    function displayRotatedAlert() {
        currentRotationIndex %= activeAlerts.length;
        const alert = activeAlerts[currentRotationIndex];
        const alertInfo = getAlertDisplayInfo(alert);
        document.getElementById('rotator-title').textContent = alertInfo.name;
        document.getElementById('rotator-location').textContent = alert.display_locations;
        const expires = alert.expiration_time ? new Date(alert.expiration_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        document.getElementById('rotator-expires').textContent = expires;
        rotatorContainer.className = `widget-container ${alert.phenomenon}`;
        if (alert.is_emergency) rotatorContainer.classList.add('EMERGENCY');
        rotatorContainer.classList.add('visible');
        currentRotationIndex++;
    }

    connect();
});