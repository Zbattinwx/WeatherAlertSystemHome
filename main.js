// --- Configuration ---
const WEBSOCKET_URL = "ws://localhost:8765";
//const WEBSOCKET_URL = CONFIG.websocket_url;

// --- DOM Elements ---
const torCountEl = document.getElementById('tor-count');
const svrCountEl = document.getElementById('svr-count');
const ffwCountEl = document.getElementById('ffw-count');
const spsCountEl = document.getElementById('sps-count');
const listContainerEl = document.getElementById('alert-list-container');

// --- State ---
let socket;

// --- Mappings ---
// This object maps the codes from Python to the full names for display
const ALERT_CODES = {
    "TO": "Tornado Warning",
    "SV": "Severe Thunderstorm Warning",
    "FF": "Flash Flood Warning",
    "MA": "Marine Warning",
    "SS": "Storm Surge Warning",
    "SPS": "Special Weather Statement"
};

/**
 * Connects to the WebSocket server and sets up event listeners.
 */
function connect() {
    socket = new WebSocket(WEBSOCKET_URL);
    socket.onopen = () => {
        console.log("✅ Connected to Python backend.");
        document.body.style.borderColor = '#00ff00'; // Green border on connect
    };
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
            updateDisplay(data.alerts);
        }
    };
    socket.onclose = () => {
        console.log("❌ Disconnected. Retrying in 5 seconds...");
        document.body.style.borderColor = '#ff0000'; // Red border on disconnect
        setTimeout(connect, 5000);
    };
    socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
        socket.close();
    };
}

/**
 * Sends a 'zoom_to_alert' command to the backend.
 * @param {string} alertId - The unique ID of the alert to zoom to.
 */
function handleZoomClick(alertId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log(`Sending zoom command for alert: ${alertId}`);
        socket.send(JSON.stringify({
            type: 'zoom_to_alert',
            alert_id: alertId // Ensure the key matches the backend expectation
        }));
    }
}

/**
 * Updates the entire display with new alert data.
 * @param {Array<Object>} alerts - The list of active alert objects from the backend.
 */
function updateDisplay(alerts) {
    // 1. Reset counters
    let counters = { "TO": 0, "SV": 0, "FF": 0, "SPS": 0 };

    // 2. Count alerts based on their phenomenon code
    alerts.forEach(alert => {
        if (counters.hasOwnProperty(alert.phenomenon)) {
            counters[alert.phenomenon]++;
        }
    });

    // 3. Update counter elements on the page
    torCountEl.textContent = counters.TO;
    svrCountEl.textContent = counters.SV;
    ffwCountEl.textContent = counters.FF;
    spsCountEl.textContent = counters.SPS;

    // 4. Clear and rebuild the alert list
    listContainerEl.innerHTML = ''; 
    
    if (alerts.length > 0) {
        alerts.forEach(alert => {
            const item = document.createElement('div');
            
            // Get the full name and a class for styling
            const fullName = ALERT_CODES[alert.phenomenon] || alert.phenomenon;
            const typeClass = (alert.phenomenon || 'def').toLowerCase();

            item.className = `alert-item ${typeClass}`;
            
            item.innerHTML = `
                <div class="alert-item-info">
                    <div class="type">${fullName.toUpperCase()}</div>
                    <div class="locations">${alert.display_locations}</div>
                </div>
                <div class="alert-item-zoom-button" onclick="handleZoomClick('${alert.id}')">
                    ZOOM
                </div>
            `;
            listContainerEl.appendChild(item);
        });
    } else {
        listContainerEl.innerHTML = '<div class="no-alerts">No active alerts.</div>';
    }
}

// --- Start Everything ---
connect();