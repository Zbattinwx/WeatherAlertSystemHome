document.addEventListener('DOMContentLoaded', () => {
    // --- MAP INITIALIZATION ---
    const map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
    }).setView([40.4, -82.9], 7.5);

    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png').addTo(map);

    const fipsToLayerMap = {};
    let countyGeoJsonLayer;
    let legendControl; // --- NEW: Variable to hold our legend ---

    // --- REFERENCE POINTS ---
    const majorCities = [
        { name: 'Columbus', coords: [40.03, -82.99] },
        { name: 'Cleveland', coords: [41.55, -81.69] },
        { name: 'Cincinnati', coords: [39.10, -84.51] },
        { name: 'Toledo', coords: [41.7, -83.53] },
        { name: 'Akron', coords: [41.12, -81.51] },
        { name: 'Dayton', coords: [39.8, -84.19] }
    ];

    majorCities.forEach(city => {
        const labelIcon = L.divIcon({ className: 'city-label', html: `<span>${city.name}</span>`, iconAnchor: [city.name.length * 4.5, 8] });
        L.marker(city.coords, { icon: labelIcon, pane: 'shadowPane' }).addTo(map);
    });
    
    const defaultStyle = {
        color: '#414868', weight: 1, opacity: 0.8,
        fillColor: '#c0c5d5', fillOpacity: 0.05
    };

    const threatColors = {
        "TO": "#e53e3e", "FF": "#38a169", "SV": "#dd6b20", "SVR": "#dd6b20",
        "TOA": "#faf089", "SVA": "#d69e2e", "FFA": "#48bb78", "SPS": "#4299e1"
    };

    // --- NEW: Master list of all possible legend items ---
    const legendInfo = {
        "TO": { color: threatColors.TO, name: "Tornado Warning" },
        "FF": { color: threatColors.FF, name: "Flash Flood Warning" },
        "SV": { color: threatColors.SV, name: "Svr. T-Storm Warning" },
        "SVR": { color: threatColors.SVR, name: "Svr. T-Storm Warning" },
        "TOA": { color: threatColors.TOA, name: "Tornado Watch" },
        "SVA": { color: threatColors.SVA, name: "Svr. T-Storm Watch" },
        "FFA": { color: threatColors.FFA, name: "Flash Flood Watch" },
        "SPS": { color: threatColors.SPS, name: "Special Wx Statement" }
    };

    function updateMapColors(summary) {
        if (!countyGeoJsonLayer) return;

        for (const fips in fipsToLayerMap) {
            fipsToLayerMap[fips].setStyle(defaultStyle);
        }

        for (const fips in summary) {
            const layer = fipsToLayerMap[fips];
            if (layer) {
                const phenomenon = summary[fips];
                const color = threatColors[phenomenon] || '#718096';
                layer.setStyle({ fillColor: color, fillOpacity: 0.6, color: color, weight: 1.5 });
            }
        }
    }

    // --- NEW: Function to create and update the legend ---
    function setupLegend() {
        legendControl = L.control({ position: 'bottomright' });

        legendControl.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'legend');
            this.update({}); // Initialize with no active alerts
            return this._div;
        };

        // This method updates the legend's content
        legendControl.update = function (summary) {
            const activePhenomena = new Set(Object.values(summary));
            let legendHTML = '<h4>Active Threats</h4>';
            let itemsAdded = 0;

            for (const key in legendInfo) {
                if (activePhenomena.has(key)) {
                    const info = legendInfo[key];
                    legendHTML += `<i style="background:${info.color}"></i> ${info.name}<br>`;
                    itemsAdded++;
                }
            }

            // Hide legend if no items are active, otherwise show it
            this._div.style.display = itemsAdded > 0 ? 'block' : 'none';
            this._div.innerHTML = legendHTML;
        };

        legendControl.addTo(map);
    }


    // --- DATA HANDLING ---
    fetch('counties.geojson')
        .then(response => response.json())
        .then(data => {
            countyGeoJsonLayer = L.geoJSON(data, {
                style: defaultStyle,
                onEachFeature: (feature, layer) => {
                    const fips = feature.properties.GEOID;
                    if (fips) { fipsToLayerMap[fips] = layer; }
                }
            }).addTo(map);

            setupLegend(); // Create the legend after the base layer is ready
            return fetch('ohio_interstates.geojson');
        })
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, { style: { color: '#5a7da8', weight: 3, opacity: 0.8 }}).addTo(map);
            const highwayLabels = [
                { num: '70', coords: [39.926343564354646, -83.79443023336442] }, // West of Columbus
                { num: '70', coords: [40.03, -81.8] }, // East of Columbus
                { num: '71', coords: [40.94698972762654, -82.08265734473353] }, // South of Akron
                { num: '71', coords: [39.4, -84.25] }, // North of Cincinnati
                { num: '75', coords: [40.7, -84.1] },  // South of Lima
                { num: '75', coords: [39.55, -84.3] }, // North of Dayton
                { num: '90', coords: [41.75, -81.2] },  // West of Cleveland
                { num: '90', coords: [41.36859807204804, -82.95797270116199] }, // West of Akron (Turnpike)
                { num: '77', coords: [40.54982945637981, -81.50307368612263] }, // South of Canton
            ];
            highwayLabels.forEach(label => {
                const shieldIcon = L.divIcon({ className: 'interstate-shield-label', html: `<span>${label.num}</span>`, iconSize: [32, 28] });
                L.marker(label.coords, { icon: shieldIcon }).addTo(map);
            });
        });

    // --- WEBSOCKET CONNECTION ---
    function connect() {
        const socket = new WebSocket(CONFIG.websocket_url);
        socket.onopen = () => console.log("State Map connected to WebSocket.");
        socket.onclose = () => setTimeout(connect, 5000);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'update' && data.statewide_summary) {
                updateMapColors(data.statewide_summary);
                // --- NEW: Update the legend whenever we get new data ---
                if (legendControl) {
                    legendControl.update(data.statewide_summary);
                }
            }
        };
    }

    connect();
});