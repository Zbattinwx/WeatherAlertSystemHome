document.addEventListener('DOMContentLoaded', () => {
    const WEBSOCKET_URL = CONFIG.websocket_url;
    const ROTATION_SPEED_MS = 10000; // Rotate camera every 10 seconds

    // DOM Elements
    const rotatorContainer = document.getElementById('rotator-container');
    const cameraImage = document.getElementById('camera-image');
    const cameraLocation = document.getElementById('camera-location');
    const warningType = document.getElementById('warning-type');

    // State
    let odotCameraCache = [];
    let camerasInWarnings = [];
    let currentRotationIndex = 0;
    let rotationInterval;

    const HIGH_PRIORITY_WARNINGS = new Set(["TO", "SV", "SVR"]);

    // Fetch all ODOT cameras once on startup
    async function fetchOdotCameras() {
        if (!CONFIG.odot_api_key || CONFIG.odot_api_key === "YOUR_API_KEY_HERE") {
            console.error("ODOT API key is not configured.");
            return;
        }
        try {
            const response = await fetch("https://publicapi.ohgo.com/api/v1/cameras?page-all=true", { headers: { Authorization: `APIKEY ${CONFIG.odot_api_key}` } });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
            
            data.results.forEach((camera) => {
                if (camera.cameraViews && camera.cameraViews.length > 0) {
                    odotCameraCache.push({
                        id: camera.id,
                        location: camera.location,
                        latitude: camera.latitude,
                        longitude: camera.longitude,
                        imageUrl: camera.cameraViews[0].largeUrl
                    });
                }
            });
            console.log(`Cached ${odotCameraCache.length} ODOT cameras.`);
        } catch (error) {
            console.error("Failed to fetch ODOT camera data:", error);
        }
    }

    // Connect to the WebSocket to get live alert data
    function connect() {
        const socket = new WebSocket(WEBSOCKET_URL);
        socket.onopen = () => console.log("Camera Rotator connected.");
        socket.onclose = () => setTimeout(connect, 5000);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'update') {
                updateCamerasInWarnings(data.alerts);
            }
        };
    }

    // Find which cameras are inside relevant warnings
    function updateCamerasInWarnings(alerts) {
        const relevantAlerts = alerts.filter(alert => HIGH_PRIORITY_WARNINGS.has(alert.phenomenon));
        let foundCameras = [];

        relevantAlerts.forEach((alert) => {
            if (alert.polygon && alert.polygon.length >= 4) {
                const polygonCoords = alert.polygon.map((p) => [p[1], p[0]]);
                try {
                    const turfPolygon = turf.polygon([polygonCoords]);
                    odotCameraCache.forEach((camera) => {
                        const cameraPoint = turf.point([camera.longitude, camera.latitude]);
                        if (turf.booleanPointInPolygon(cameraPoint, turfPolygon) && !foundCameras.some(c => c.id === camera.id)) {
                            foundCameras.push({
                                ...camera,
                                warningType: alert.phenomenon === "TO" ? "Tornado Warning" : "Svr. T-Storm Warning"
                            });
                        }
                    });
                } catch (e) {
                    console.error("Error processing polygon for camera check:", e);
                }
            }
        });

        camerasInWarnings = foundCameras;
        handleRotation();
    }
    
    // Manage the display and rotation of cameras
    function handleRotation() {
        clearInterval(rotationInterval); // Stop any existing timer

        if (camerasInWarnings.length === 0) {
            rotatorContainer.classList.remove('visible');
            return;
        }

        rotatorContainer.classList.add('visible');
        displayNextCamera(); // Display the first camera immediately

        if (camerasInWarnings.length > 1) {
            rotationInterval = setInterval(displayNextCamera, ROTATION_SPEED_MS);
        }
    }

    // Update the UI with the next camera in the list
    function displayNextCamera() {
        if (camerasInWarnings.length === 0) return;

        currentRotationIndex %= camerasInWarnings.length;
        const camera = camerasInWarnings[currentRotationIndex];

        cameraLocation.textContent = camera.location;
        warningType.textContent = `In ${camera.warningType}`;
        // Add timestamp to break browser cache and get a live image
        cameraImage.src = `${camera.imageUrl}?t=${new Date().getTime()}`;

        currentRotationIndex++;
    }

    // Start the process
    async function initialize() {
        await fetchOdotCameras();
        connect();
    }

    initialize();
});