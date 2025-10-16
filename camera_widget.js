// camera_widget.js
document.addEventListener('DOMContentLoaded', () => {
    const WEBSOCKET_URL = CONFIG.websocket_url;
    const cameraContainer = document.getElementById('camera-container');
    const cameraImage = document.getElementById('camera-image');
    const cameraTitle = document.getElementById('camera-title');
    const closeButton = document.getElementById('close-widget-btn');

    // --- MODIFICATION: Variable to hold our refresh timer ---
    let refreshIntervalId = null;

    function connect() {
        const socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => console.log("Camera Widget connected.");
        socket.onclose = () => {
            // When disconnected, stop any active timer
            if (refreshIntervalId) clearInterval(refreshIntervalId);
            setTimeout(connect, 5000);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'feature_camera' && data.camera_data) {
                const { title, imageUrl } = data.camera_data;

                // --- START: Refresh Logic ---
                // 1. Clear any old timer that might be running
                if (refreshIntervalId) clearInterval(refreshIntervalId);

                // 2. Update the image and title immediately
                cameraTitle.textContent = title;
                cameraImage.src = `${imageUrl}?t=${new Date().getTime()}`;

                // 3. Start a new 5-second timer to keep the image fresh
                refreshIntervalId = setInterval(() => {
                    console.log("Refreshing camera image...");
                    cameraImage.src = `${imageUrl}?t=${new Date().getTime()}`;
                }, 5000); // 5000 milliseconds = 5 seconds
                // --- END: Refresh Logic ---

                cameraContainer.classList.remove('hidden');
            
            // --- START: Hide Logic ---
            } else if (data.type === 'hide_camera_widget') {
                hideWidget();
            }
            // --- END: Hide Logic ---
        };
    }

    /**
     * Hides the widget and clears the refresh timer.
     */
    function hideWidget() {
        console.log("Hiding camera widget and stopping refresh.");
        cameraContainer.classList.add('hidden');
        if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
            refreshIntervalId = null;
        }
    }

    // The close button on the widget should also use our new hide function
    closeButton.addEventListener('click', hideWidget);

    connect();
});