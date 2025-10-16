document.addEventListener('DOMContentLoaded', () => {
    const WEBSOCKET_URL = CONFIG.websocket_url;
    const featureBox = document.getElementById('feature-alert-box');
    let hideTimeout;

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

    function connect() {
        const socket = new WebSocket(WEBSOCKET_URL);
        socket.onopen = () => console.log("Feature Widget connected.");
        socket.onclose = () => setTimeout(connect, 5000);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'feature_alert' && data.alert_data) {
                displayFeaturedAlert(data.alert_data);
            }
        };
    }

    function displayFeaturedAlert(alert) {
        clearTimeout(hideTimeout);

        // Update Text Content
        const alertInfo = ALERT_TYPE_MAP[alert.phenomenon] || { name: alert.phenomenon, icon: 'fa-exclamation-triangle' };
        document.getElementById('feature-icon').className = `fas ${alertInfo.icon}`;
        document.getElementById('feature-title').textContent = alertInfo.name;
        document.getElementById('feature-locations').textContent = alert.display_locations;
        const expires = alert.expiration_time ? new Date(alert.expiration_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        document.getElementById('feature-expires').textContent = expires;

        // Build Impacts (Wind/Hail)
        let impactsHTML = '';
        if (alert.max_wind_gust) impactsHTML += `<span class="tag">${alert.max_wind_gust}</span>`;
        if (alert.max_hail_size) impactsHTML += `<span class="tag">${alert.max_hail_size}</span>`;
        document.getElementById('feature-impacts').innerHTML = impactsHTML;

        // Build Tags (Observed, Destructive, etc.)
        let tagsHTML = '';
        if (alert.is_emergency) tagsHTML += `<span class="tag emergency">EMERGENCY</span>`;
        if (alert.tornado_observed) tagsHTML += `<span class="tag emergency">OBSERVED</span>`;
        if (alert.tornado_detection) tagsHTML += `<span class="tag">${alert.tornado_detection}</span>`;
        if (alert.damage_threat === 'DESTRUCTIVE') tagsHTML += `<span class="tag emergency">DESTRUCTIVE</span>`;
        if (alert.damage_threat === 'CATASTROPHIC') tagsHTML += `<span class="tag emergency">CATASTROPHIC</span>`;
        if (alert.damage_threat === 'CONSIDERABLE') tagsHTML += `<span class="tag">CONSIDERABLE</span>`;
        document.getElementById('feature-tags').innerHTML = tagsHTML;

        

        // Update styling and show the box
        featureBox.className = `feature-container ${alert.phenomenon}`; // Resets classes
        featureBox.classList.remove('hidden');

        // Automatically hide after 60 seconds
        hideTimeout = setTimeout(() => {
            featureBox.classList.add('hidden');
        }, 20000);
    }

    connect();
});