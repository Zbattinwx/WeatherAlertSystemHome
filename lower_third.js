document.addEventListener('DOMContentLoaded', () => {
    const WEBSOCKET_URL = "ws://localhost:8765";
    const container = document.getElementById('lower-third-container');
    const nameEl = document.querySelector('#name span');
    const titleEl = document.querySelector('#title span');

    function connect() {
        const socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => console.log("Lower Third GFX connected.");
        
        socket.onclose = (e) => {
            console.log("Socket closed. Reconnecting in 5 seconds...", e.reason);
            setTimeout(connect, 5000);
        };

        socket.onerror = (err) => {
            console.error("Socket error. Closing socket.", err);
            socket.close();
        };

        socket.onmessage = (event) => {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                console.error("Failed to parse JSON data:", event.data);
                return;
            }

            if (data.type === 'show_lower_third') {
                // Step 1: Update the text content from the data payload
                nameEl.textContent = data.name || 'Default Name';
                titleEl.textContent = data.title || 'Default Title';

                // Step 2: Animate it in
                // Using requestAnimationFrame ensures the text is updated before the animation starts
                requestAnimationFrame(() => {
                    container.classList.add('active');
                });

            } else if (data.type === 'hide_lower_third') {
                // Simply remove the 'active' class to trigger the reverse transition
                container.classList.remove('active');
            }
        };
    }

    connect();
});