// dashboard.js

// --- START: Added from radar.js ---
const stationData = [
  {
    id: "88742",
    name: "Tempest Columbus",
    tempestURL: "https://tempestwx.com/station/88742/",
    apiKey: "5a4900f7-cd33-4fcd-ad0d-9e0d564ab5c9",
  },
  {
    id: "51474",
    name: "Tempest Clyde",
    tempestURL: "https://tempestwx.com/station/51474/",
    apiKey: "766765cd-5536-4eb3-846e-089d9d9a8254",
  },
  {
    id: "44046",
    name: "Tempest Chillicothe",
    tempestURL: "https://tempestwx.com/station/44046/",
    apiKey: "892718b9-e988-4a49-a6fd-af62b39f72bf",
  },
  {
    id: "101482",
    name: "Tempest North Ridgeville",
    tempestURL: "https://tempestwx.com/station/101482/",
    apiKey: "6b3ea56b-ac24-495b-bd5b-f6d437622576",
  },
  {
    id: "142287",
    name: "Phillipsburg Tempest",
    tempestURL: "https://tempestwx.com/station/118819/",
    apiKey: "b4d2fbe0-8f85-4cd7-b962-b871b1cb9dce",
  },
  {
    id: "118819",
    name: "Tempest Seneca Sheriff",
    tempestURL: "https://tempestwx.com/station/118819/",
    apiKey: "766765cd-5536-4eb3-846e-089d9d9a8254",
  },
  {
    id: "39978",
    name: "Tempest South Charleston",
    tempestURL: "https://tempestwx.com/station/39978/",
    apiKey: "215d4cf5-a742-44c1-b2d9-7704935646f8",
  },
  {
    id: "94306",
    name: "Tempest Lawrenceville",
    tempestURL: "https://tempestwx.com/station/94306/",
    apiKey: "38b82851-46eb-481c-9ea0-e60ceb3f89f0",
  },
  {
    id: "95741",
    name: "Tempest Mechanicsburg",
    tempestURL: "https://tempestwx.com/station/95741/",
    apiKey: "32c14295-761a-40b8-85f1-c264833f2dcd",
  },
  {
    id: "63443",
    name: "Tempest Circleville",
    tempestURL: "https://tempestwx.com/station/63443/",
    apiKey: "6478fcba-135f-4c7b-a4c4-e446fd09361c",
  },
  {
    id: "96261",
    name: "Tempest Shelby",
    tempestURL: "https://tempestwx.com/station/96261/",
    apiKey: "1131c038-8d51-45f1-9681-b70f3773bfa8",
  },
  {
    id: "152016",
    name: "Shauck Tempest ",
    tempestURL: "https://tempestwx.com/station/152016/",
    apiKey: "888bdfe2-a455-434f-a469-f04de72b01eb",
  },
  {
    id: "43923",
    name: "Tempest ColumbusN",
    tempestURL: "https://tempestwx.com/station/43923/",
    apiKey: "5480dd76-d390-4193-8f54-0f62692c92a9",
  },
  /* {
    id: "73528",
    name: "Tempest Enon",
    tempestURL: "https://tempestwx.com/station/73528/",
    apiKey: "5480dd76-d390-4193-8f54-0f62692c92a9",
  }, */
  {
    id: "122869",
    name: "Amplex Tempest",
    tempestURL: "https://tempestwx.com/station/122869/",
    apiKey: "17ab8876-bd1f-4f86-8915-4537c4e8f4eb",
  },
  {
    id: "99857",
    name: "Tempest Centerville",
    tempestURL: "https://tempestwx.com/station/99857/",
    apiKey: "94a07d56-935f-45bc-baf0-67982cf45067",
  },
  {
    id: "135123",
    name: "Tempest Waynesfield",
    tempestURL: "https://tempestwx.com/station/135123/",
    apiKey: "d35f12a6-e2f8-4a22-9034-c7cd58ef8914",
  },
  {
    id: "168192",
    name: "Flatwoods Tempest",
    tempestURL: "https://tempestwx.com/station/168192/",
    apiKey: "a57b93ac-b43c-4a97-9497-ade5bd084ce4",
  },
  {
    id: "105764",
    name: "Xenia Tempest",
    tempestURL: "https://tempestwx.com/station/105764/",
    apiKey: "623a544d-9a6c-4d7e-8d65-5231c4376d17",
  },
  {
    id: "89146",
    name: "Sugar Grove Tempest",
    tempestURL: "https://tempestwx.com/station/89146/",
    apiKey: "989d8a4c-a687-4287-b6fc-c14da42e3ef4",
  },
  {
    id: "160984",
    name: "Delaware Tempest",
    tempestURL: "https://tempestwx.com/station/160984/",
    apiKey: "d58750ca-40f7-4d80-a6be-1753feb72d6e",
  },
  {
    id: "169433",
    name: "Weirton Tempest",
    tempestURL: "https://tempestwx.com/station/169433",
    apiKey: "313dafea-80bd-4382-b0bf-76feec12f29d",
  },
];
// --- END: Added from radar.js ---

document.addEventListener("DOMContentLoaded", () => {
  if (CONFIG.enable_obs_integration === false) {
    document.body.classList.add("obs-disabled");
  }
  if (CONFIG.enable_storm_threat === false) {
    document.body.classList.add("storm-threat-disabled");
  }
  // Check the config file to see if winter mode should be activated.
  if (CONFIG.winter_mode_enabled === true) {
    // If it is, add a class to the body. CSS will use this class to show winter elements.
    document.body.classList.add("winter-mode-active");
  } else {
    // Otherwise, ensure the class is not present.
    document.body.classList.remove("winter-mode-active");
  }

  // --- UI Elements ---
  const loginOverlay = document.getElementById("login-overlay");
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password-input");
  const loginError = document.getElementById("login-error");
  const dashboardContainer = document.getElementById("dashboard-container");
  const chatToggleBtn = document.getElementById("chat-toggle-btn");
  const chatWindow = document.getElementById("chat-window");
  const chatCloseBtn = document.querySelector(".chat-close-btn");
  const chatBadge = document.getElementById("chat-badge");
  let unreadMessages = 0;

  // --- WebSocket and Global State ---
  const WEBSOCKET_URL = CONFIG.websocket_url;
  const OBS_WEBSOCKET_URL = "ws://localhost:4455";
  let socket;
  let obsSocket;
  let correctPassword = null;
  let activeAlertsCache = [];
  let recentProductsCache = [];
  const activeCameraIntervals = new Map();
  const activeFilters = new Set();
  let activeStateFilters = new Set();
  let activeMDStateFilters = new Set();
  let map;
  let odotMap;
  let snowEmergencyMap;
  let cameraRefreshInterval = null;
  let polygonLayer;
  let stationMarkers;
  let dashboardIsInitialized = false;
  let countyDataLoaded = false;
  let afdCache = {};
  let currentAfdSite = "ILN";
  let odotCameraCache = [];
  let lsrMap;
  let lsrTypeLayers = {};
  let reportLocation = null;
  let manualLsrLayer;
  let stormThreatLayer = null; // To hold our storm icons
  const stormThreatMarkers = new Map(); // To keep track of markers by ID

  // --- Dashboard DOM Element References ---
  const torCountEl = document.getElementById("tor-count");
  const svrCountEl = document.getElementById("svr-count");
  const ffwCountEl = document.getElementById("ffw-count");
  const spsCountEl = document.getElementById("sps-count");
  const toaCountEl = document.getElementById("toa-count");
  const svaCountEl = document.getElementById("sva-count");
  const ffaCountEl = document.getElementById("ffa-count");
  const menuItems = document.querySelectorAll(".side-menu .menu-item");
  const sections = document.querySelectorAll(".dashboard-section");
  const lastCheckedEl = document.getElementById("lastChecked");
  const alertSourceEl = document.getElementById("alertSource");
  const filterControls = document.getElementById("filterControls");
  const countyFipsMap = new Map();

  // --- MODIFICATION START: Sound Toggle Logic ---
  const soundToggle = document.getElementById("sound-toggle-checkbox");

  // Set initial state from localStorage (or default to true)
  const isSoundEnabled = localStorage.getItem("soundEnabled") !== "false";
  soundToggle.checked = isSoundEnabled;

  soundToggle.addEventListener("change", () => {
    localStorage.setItem("soundEnabled", soundToggle.checked);
  });
  // --- MODIFICATION END ---

  async function startObsPreview() {
    const videoElement = document.getElementById("obs-preview-video");
    if (!videoElement) return;

    try {
      console.log("Searching for OBS Virtual Camera...");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const obsVirtualCam = devices.find(
        (device) =>
          device.kind === "videoinput" &&
          device.label.includes("OBS Virtual Camera")
      );

      if (obsVirtualCam) {
        console.log("Found OBS Virtual Camera. Requesting stream.");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: obsVirtualCam.deviceId },
          },
        });
        videoElement.srcObject = stream;
      } else {
        console.warn(
          "Could not find 'OBS Virtual Camera' by name. Falling back to default camera."
        );
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoElement.srcObject = stream;
      }
    } catch (err) {
      console.error("Failed to get OBS Virtual Camera stream.", err);
      alert(
        "Could not access the OBS Virtual Camera. Make sure it is started in OBS and you have granted camera permissions to the browser."
      );
    }
  }

  let obs;
  const obsStatusLight = document.getElementById("obs-connection-status");

  async function connectToOBS() {
    obs = new OBSWebSocket();
    try {
      console.log("Attempting to connect to OBS...");
      const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
        "ws://localhost:4455",
        "zkgvzKW7qvf9NFVA",
        { rpcVersion: 1 }
      );
      console.log(
        `✅ Connected to OBS! Server version: ${obsWebSocketVersion}, RPC version: ${negotiatedRpcVersion}`
      );

      document.getElementById("obs-connection-status").textContent =
        "OBS Connected";
      document.getElementById("obs-connection-status").className =
        "obs-status-light connected";
      document.getElementById("obs-connection-status-main").textContent =
        "OBS Connected";
      document.getElementById("obs-connection-status-main").className =
        "obs-status-light connected";

      await populateObsControls();

      console.log("Attaching global OBS click listener.");
      document.body.addEventListener("click", async (event) => {
        const sceneGoButton = event.target.closest(".scene-btn-go");
        const accordionHeader = event.target.closest(".scene-group-header");
        const toggleButton = event.target.closest(".source-toggle-btn");
        const lowerThirdButton = event.target.closest(".lower-third-main-btn");
        const refreshButton = event.target.closest("#refresh-obs-scenes-btn");

        if (refreshButton) {
          console.log("OBS: Refreshing scenes list...");
          await populateObsControls();
          return; // Stop further processing
        }

        if (sceneGoButton) {
          event.stopPropagation();
          if (!obs || !obs.socket) return;
          const sceneName = sceneGoButton.dataset.sceneName;
          await obs
            .call("SetCurrentProgramScene", { sceneName })
            .catch((e) => console.error(e));
        } else if (accordionHeader) {
          accordionHeader.parentElement.classList.toggle("active");
        }

        if (toggleButton) {
          if (!obs || !obs.socket) return;
          const sceneName = toggleButton.dataset.sceneName;
          const sourceName = toggleButton.dataset.sourceName;
          try {
            const { sceneItemId } = await obs.call("GetSceneItemId", {
              sceneName,
              sourceName,
            });
            const { sceneItemEnabled } = await obs.call("GetSceneItemEnabled", {
              sceneName,
              sceneItemId,
            });
            const newState = !sceneItemEnabled;
            await obs.call("SetSceneItemEnabled", {
              sceneName,
              sceneItemId,
              sceneItemEnabled: newState,
            });

            document
              .querySelectorAll(
                `.source-toggle-btn[data-source-name='${sourceName}']`
              )
              .forEach((btn) => {
                btn.classList.toggle("on-air", newState);
              });
          } catch (error) {
            console.error(`Failed to toggle source '${sourceName}'.`, error);
          }
        }

        if (lowerThirdButton) {
          if (socket && socket.readyState === WebSocket.OPEN) {
            const isSidebar =
              lowerThirdButton.id === "show-lower-third-btn-sidebar";
            const nameInputId = isSidebar
              ? "lower-third-name-sidebar"
              : "lower-third-name-main";
            const titleInputId = isSidebar
              ? "lower-third-title-sidebar"
              : "lower-third-title-main";

            const nameInput = document.getElementById(nameInputId);
            const titleInput = document.getElementById(titleInputId);

            const nameText = nameInput ? nameInput.value : "Default Name";
            const titleText = titleInput ? titleInput.value : "Default Title";

            const showMessage = {
              type: "show_lower_third",
              name: nameText,
              title: titleText,
            };
            socket.send(JSON.stringify(showMessage));

            setTimeout(() => {
              socket.send(JSON.stringify({ type: "hide_lower_third" }));
            }, 15000);
          }
        }
      });
    } catch (error) {
      console.error("❌ OBS connection failed:", error.message);
    }
    obs.on("ConnectionClosed", () => {
      document.getElementById("obs-connection-status").textContent =
        "OBS Disconnected";
      document.getElementById("obs-connection-status").className =
        "obs-status-light disconnected";
      document.getElementById("obs-connection-status-main").textContent =
        "OBS Disconnected";
      document.getElementById("obs-connection-status-main").className =
        "obs-status-light disconnected";
    });
  }

  async function syncObsUI() {
    console.log("Syncing OBS UI state...");
    const toggleButtons = document.querySelectorAll(".source-toggle-btn");

    for (const button of toggleButtons) {
      const sceneName = button.dataset.sceneName;
      const sourceName = button.dataset.sourceName;

      try {
        const { sceneItemId } = await obs.call("GetSceneItemId", {
          sceneName,
          sourceName,
        });
        const { sceneItemEnabled } = await obs.call("GetSceneItemEnabled", {
          sceneName,
          sceneItemId,
        });
        button.classList.toggle("on-air", sceneItemEnabled);
      } catch (error) {
        // Ignored
      }
    }
  }

  async function populateObsControls() {
    console.log("Populating OBS controls dynamically with accordion...");

    const sidebarPanel = document.querySelector("#side-menu .director-panel");
    const mainPanel = document.querySelector(
        "#director-panel-section .director-panel .source-toggles"
    );
    const mainRefreshContainer = document.querySelector("#director-panel-section .director-panel");

    if (!sidebarPanel || !mainPanel) return;

    // --- Helper function to generate Lower Third HTML with unique IDs ---
    const createLowerThirdHTML = (suffix) => `
        <div class="director-control-group">
            <h4 class="control-group-title"><i class="fas fa-id-card"></i> Lower Third</h4>
            <input type="text" id="lower-third-name${suffix}" class="director-input" placeholder="Name / Main Line">
            <input type="text" id="lower-third-title${suffix}" class="director-input" placeholder="Title / Sub-line">
            <button id="show-lower-third-btn${suffix}" class="lower-third-main-btn">
                <i class="fas fa-play-circle"></i> Show Lower Third (15s)
            </button>
        </div>
    `;

    const refreshBtnHTML = `
        <button id="refresh-obs-scenes-btn" class="filter-btn" style="width:100%; margin-bottom: 15px;">
            <i class="fas fa-sync-alt"></i> Refresh Scenes
        </button>
    `;

    const { scenes } = await obs.call("GetSceneList");
    
    // --- Create a fragment for the scene controls ---
    const scenesFragment = document.createDocumentFragment();
    for (const scene of scenes) {
        const sceneGroup = document.createElement("div");
        sceneGroup.className = "scene-group";
        const header = document.createElement("div");
        header.className = "scene-group-header";
        header.innerHTML = `
            <span><i class="fas fa-desktop"></i> ${scene.sceneName}</span>
            <button class="scene-btn-go" data-scene-name="${scene.sceneName}" title="Switch to this scene">GO LIVE</button>
        `;
        sceneGroup.appendChild(header);
        const sourceList = document.createElement("div");
        sourceList.className = "source-list";
        const { sceneItems } = await obs.call("GetSceneItemList", {
            sceneName: scene.sceneName,
        });
        for (const item of sceneItems) {
            if (item.sourceName && !item.isGroup) {
                const toggleBtn = document.createElement("button");
                toggleBtn.className = "source-toggle-btn";
                toggleBtn.dataset.sceneName = scene.sceneName;
                toggleBtn.dataset.sourceName = item.sourceName;
                toggleBtn.innerHTML = `<i class="fas fa-photo-video"></i> ${item.sourceName}`;
                sourceList.appendChild(toggleBtn);
            }
        }
        sceneGroup.appendChild(sourceList);
        scenesFragment.appendChild(sceneGroup);
    }

    // --- Clear previous dynamic content and rebuild ---
    sidebarPanel.innerHTML = refreshBtnHTML;
    mainPanel.innerHTML = ""; // Clear only the inner container
    
    // Add scenes to both panels
    sidebarPanel.appendChild(scenesFragment.cloneNode(true));
    mainPanel.appendChild(scenesFragment);

    // Add unique lower third controls to each panel
    sidebarPanel.insertAdjacentHTML('beforeend', createLowerThirdHTML('-sidebar'));
    mainPanel.insertAdjacentHTML('beforeend', createLowerThirdHTML('-main'));

    // Ensure refresh button exists in the main panel
    if (!mainRefreshContainer.querySelector('#refresh-obs-scenes-btn')) {
        mainRefreshContainer.insertAdjacentHTML('afterbegin', refreshBtnHTML);
    }

    await syncObsUI();
}

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
    WWY: { name: "Winter Weather Advisory", icon: "fas fa-snowflake" },
  };

  const TICKER_FILTERABLE_ALERTS = {
    "TO": "Tornado Warning",
    "SV": "Severe T-Storm Warning",
    "FF": "Flash Flood Warning",
    "SPS": "Special Weather Statement",
    "TOA": "Tornado Watch",
    "SVA": "Severe T-Storm Watch",
    "FFA": "Flash Flood Watch",
    "WSW": "Winter Storm Warning",
    "WSA": "Winter Storm Watch",
    "SQW": "Snow Squall Warning",
    "WW": "Winter Weather Advisory"
};

  const stationNames = {
    DAY: "Dayton",
    BJJ: "Wooster",
    SGH: "Springfield",
    I69: "Batavia",
    S24: "Fremont",
    I67: "Harrison",
    GDK: "Dayton",
    "10G": "Millersburg",
    CDI: "Cambridge",
    OWX: "Ottawa",
    I23: "Washington Court House",
    FFO: "Wright Patterson",
    I68: "Lebanon",
    OXD: "Oxford",
    I74: "Urbana",
    POV: "Ravenna",
    LNN: "Willoughby",
    RZT: "Chillicothe",
    I95: "Kenton",
    JRO: "Jackson",
    UYF: "London",
    LCK: "Rickenbacker ANG",
    VNW: "Van Wert County",
    AXV: "Wapakoneta",
    MWO: "Middletown",
    UNI: "Albany",
    ILN: "Wilmington",
    AKR: "Akron",
    VTA: "Newark",
    FDY: "Findlay",
    BKL: "Cleveland Burke",
    OSU: "Columbus OSU",
    MNN: "Marion",
    MGY: "Dayton",
    ZZV: "Zanesville",
    TDZ: "Toledo",
    AOH: "Lima",
    PHD: "New Philadelphia",
    HZY: "Ashtabula",
    DFI: "Defiance",
    LPR: "Lorain/Elyria",
    HAO: "Hamilton",
    LUK: "Cincinnati Lunken",
    LHQ: "Lancaster",
    MFD: "Mansfield",
    TOL: "Toledo",
    CAK: "Akron/Canton",
    CMH: "Columbus",
    YNG: "Youngstown",
    CLE: "Cleveland",
    TZR: "Bolton Field",
    CGF: "Cuyahoga County",
    "4I3": "Mount Vernon",
    MRT: "Marysville",
    I40: "Coshocton",
    USE: "Wauseon",
    PCW: "Port Clinton",
    "2G2": "Steubenville",
    VES: "Versailles",
    DLZ: "Delaware",
    PMH: "Portsmouth",
    EDJ: "Bellefontaine",
  };

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const enteredPassword = passwordInput.value;
    if (correctPassword && enteredPassword === correctPassword) {
      loginOverlay.classList.add("hidden");
      dashboardContainer.classList.remove("hidden");
      initializeDashboard();
    } else {
      loginError.textContent = "Incorrect Password.";
      passwordInput.value = "";
    }
  });

  function connect() {
    socket = new WebSocket(WEBSOCKET_URL);

    // ✅ THIS IS THE CORRECTED BLOCK
    socket.onopen = () => {
        console.log("Connected to WebSocket backend.");
        document.body.classList.add("connected");
        // Reset the alert cache and update the UI to show a clean state.
        activeAlertsCache = []; 
        updateAllData([], recentProductsCache); 
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update") {
        if (data.source && alertSourceEl) {
          alertSourceEl.textContent = data.source
            .replace("_", " ")
            .toUpperCase();
        }

        activeAlertsCache = data.alerts || [];
        recentProductsCache = data.recent_products || [];

        if (correctPassword === null) {
          correctPassword = data.dashboard_password;
          if (!correctPassword) {
            loginOverlay.classList.add("hidden");
            dashboardContainer.classList.remove("hidden");
            initializeDashboard();
          }
        }

        const newAfdData = data.afds || {};
        if (JSON.stringify(newAfdData) !== JSON.stringify(afdCache)) {
          afdCache = newAfdData;
          if (
            document.getElementById("afd-section").style.display === "block"
          ) {
            loadAFD(currentAfdSite);
          }
        }

        if (dashboardIsInitialized && countyDataLoaded) {
          updateAllData(activeAlertsCache, recentProductsCache);
          updateManualLsrMarkers(data.manual_lsrs || []);
        }
        if (data.storm_threat_data) {
            updateStormThreatIcons(data.storm_threat_data);
        }
      } else if (data.type === "chat_message") {
        const chatBox = document.getElementById("chat-feed-box-floating");

        if (chatBox.querySelector(".chat-message-system")) {
          chatBox.innerHTML = "";
        }

        const messageDiv = document.createElement("div");
        messageDiv.className = "chat-message";

        const authorSpan = document.createElement("span");
        authorSpan.className = "chat-message-author";
        authorSpan.textContent = data.author + ":";

        const textSpan = document.createElement("span");
        textSpan.className = "chat-message-text";
        textSpan.textContent = data.text;

        messageDiv.appendChild(authorSpan);
        messageDiv.appendChild(textSpan);

        chatBox.prepend(messageDiv);

        // If the chat window is hidden, increment the unread count and flash the button
        if (chatWindow.classList.contains("hidden")) {
          unreadMessages++;
          chatBadge.textContent = unreadMessages;
          chatBadge.style.display = "flex";
          chatToggleBtn.classList.add("flash-chat-button");
        }
      }
    };
    socket.onclose = () => {
      console.log("Disconnected. Retrying in 5 seconds...");
      document.body.classList.remove("connected");
      setTimeout(connect, 5000);
    };
  }

  function makeModalDraggable(modalOverlay, modalContent, dragHandle) {
    let initialX = 0, initialY = 0;
    let currentX = 0, currentY = 0;
    let isDragging = false;

    dragHandle.addEventListener("mousedown", (e) => {
        // Prevent default behavior like text selection
        e.preventDefault();
        
        // Get the initial mouse position
        initialX = e.clientX - modalContent.offsetLeft;
        initialY = e.clientY - modalContent.offsetTop;
        
        isDragging = true;
        
        // Change the overlay from a centering flexbox to a simple block
        // This allows us to manually set the top/left positions
        modalOverlay.style.display = "block";
        modalContent.style.position = "absolute";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            e.preventDefault();

            // Calculate the new position
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Set the modal's new position
            modalContent.style.left = `${currentX}px`;
            modalContent.style.top = `${currentY}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        // Stop dragging when the mouse button is released
        isDragging = false;
    });
}

function updateManualLsrMarkers(reports) {
    if (!lsrMap || !manualLsrLayer) return;

    manualLsrLayer.clearLayers(); // Clear old manual reports

    const viewerIcon = L.divIcon({
        className: 'lsr-marker other', // We can reuse an existing style
        html: `<i class="fas fa-eye" style="color: #bb9af7;"></i>`, // A purple eye icon
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    reports.forEach(report => {
        const marker = L.marker([report.lat, report.lng], { icon: viewerIcon });
        const formattedTime = new Date(report.timestamp).toLocaleTimeString("en-US", {
            hour: 'numeric', minute: '2-digit', hour12: true
        });

        const popupContent = `
            <b>Viewer Report: ${report.typeText}</b><br>
            <b>Time:</b> ${formattedTime}<br>
            <b>Magnitude:</b> ${report.magnitude || "N/A"}<br>
            <hr style="margin: 5px 0;">
            <p style="white-space: pre-wrap; margin: 0;">${report.remarks || "No remarks."}</p>
        `;
        marker.bindPopup(popupContent);
        marker.addTo(manualLsrLayer);
    });

    checkLsrMapMessage();
}

function updateStormThreatIcons(stormData) {
    if (!map) return; // Make sure the map is initialized
    
    if (!stormThreatLayer) {
        stormThreatLayer = L.layerGroup().addTo(map);
    }

    // --- THE FIX: Combine storms from all stations into a single array ---
    const allStorms = stormData;

    const seenStormIds = new Set();

    // The rest of your original logic now runs on the combined 'allStorms' array
    allStorms.forEach(storm => {
        // Only display storms with a threat level of 1 or higher
        if (!storm.threat_level || storm.threat_level < 1) {
            return;
        }

        const stormId = storm.cell_id;
        seenStormIds.add(stormId);
        const latLng = [storm.latitude, storm.longitude];
        
        let scoreClass = 'threat-low';
        if (storm.threat_level >= 7) { // Levels 7-10
            scoreClass = 'threat-high';
        } else if (storm.threat_level >= 4) { // Levels 4-6
            scoreClass = 'threat-medium';
        }

        // Display the 1-10 threat_level inside the icon
        const iconHtml = `<div class="storm-threat-icon ${scoreClass}"><span>${storm.threat_level}</span></div>`;
        const threatIcon = L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: [50, 50],
            iconAnchor: [25, 25]
        });
        
        // Update the popup to show the new Threat Level first
        let popupContent = `<b>Threat Level: ${storm.threat_level}/10</b> (Score: ${storm.threat_score})<hr style="margin: 5px 0;">`;
        if (storm.score_breakdown && storm.score_breakdown.length > 0) {
            storm.score_breakdown.forEach(line => {
                popupContent += `&bull; ${line}<br>`;
            });
        }

        if (stormThreatMarkers.has(stormId)) {
            const marker = stormThreatMarkers.get(stormId);
            marker.setLatLng(latLng);
            marker.setIcon(threatIcon);
            marker.getPopup().setContent(popupContent);
        } else {
            const marker = L.marker(latLng, { icon: threatIcon });
            marker.bindPopup(popupContent, {minWidth: 300});
            marker.addTo(stormThreatLayer);
            stormThreatMarkers.set(stormId, marker);
        }
    });

    // Clean up old markers
    for (const [stormId, marker] of stormThreatMarkers.entries()) {
        if (!seenStormIds.has(stormId)) {
            stormThreatLayer.removeLayer(marker);
            stormThreatMarkers.delete(stormId);
        }
    }
}

  function updateAllData(alerts, products) {
    updateAlerts(alerts);
    updateMapPolygons(alerts);
    updateNwwsFeed(products);
    updateCamerasInWarnings(alerts, odotCameraCache);
    lastCheckedEl.textContent = new Date().toLocaleTimeString();
  }

  async function initializeDashboard() {
    if (dashboardIsInitialized) return;
    console.log("Initializing dashboard UI...");
    dashboardIsInitialized = true;

    initializeMap();
    initializeOdotMap();
    initializeStateFilters();
    initializeMDStateFilter();
    initializeTickerSettings();
    setupEventListeners();

    if (CONFIG.enable_obs_integration) {
      connectToOBS();
    }

    await loadCountyData();
    countyDataLoaded = true;
    console.log("County data loaded. Performing initial render.");

    updateAllData(activeAlertsCache, recentProductsCache);

    fetchLSRs();
    fetchGusts();
    fetchMDs();
    loadAFD("ILN");
  }

  const loadCountyData = async () => {
    try {
      const response = await fetch("counties.geojson");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const countyData = await response.json();
      countyData.features.forEach((feature) => {
        const fips = feature.properties.GEOID;
        if (fips) {
          countyFipsMap.set(fips, feature);
        }
      });
      console.log(
        `✅ Loaded ${countyFipsMap.size} county geometries into the map.`
      );
    } catch (error) {
      console.error("❌ CRITICAL: Error loading county data.", error);
    }
  };

  function initializeTickerSettings() {
    const alertTypeContainer = document.getElementById('ticker-alert-type-filters');
    if (!alertTypeContainer) return;

    // Populate Alert Type Checkboxes
    let alertTypeHTML = '';
    for (const [code, name] of Object.entries(TICKER_FILTERABLE_ALERTS)) {
        alertTypeHTML += `
            <label class="settings-label">
                <input type="checkbox" class="ticker-phenomenon-filter" value="${code}">
                ${name}
            </label>
        `;
    }
    alertTypeContainer.innerHTML = alertTypeHTML;

    // Populate State Filter Dropdown (reusing existing logic)
    const dropdown = document.getElementById("tickerStateFilterDropdown");
    const button = dropdown.querySelector(".state-filter-button");
    const panel = dropdown.querySelector(".state-filter-panel");
    const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

    let stateHTML = "";
    states.forEach(state => {
        stateHTML += `<label class="state-filter-label"><input type="checkbox" class="ticker-state-filter-checkbox" value="${state}">${state}</label>`;
    });
    panel.innerHTML = stateHTML;

    button.addEventListener("click", e => {
        e.stopPropagation();
        panel.style.display = panel.style.display === "grid" ? "none" : "grid";
    });

    // This makes the dropdown close when clicking elsewhere
    document.addEventListener("click", e => {
        if (!dropdown.contains(e.target)) {
            panel.style.display = "none";
        }
    });

    // Update button text on selection change
    panel.addEventListener('change', () => {
         const selectedStates = Array.from(panel.querySelectorAll('.ticker-state-filter-checkbox:checked')).map(cb => cb.value);
         if (selectedStates.length === 0) {
             button.textContent = "Filter by State";
         } else if (selectedStates.length === 1) {
             button.textContent = `${selectedStates[0]} Selected`;
         } else {
             button.textContent = `${selectedStates.length} States Selected`;
         }
    });
}

  function initializeLsrMap() {
    const mapContainer = document.getElementById("lsr-map");
    // Exit if the map container doesn't exist or if the map is already initialized and visible.
    if (!mapContainer || (lsrMap && lsrMap._container.isConnected)) {
        return;
    }

    // --- Create Map and Layers ---
    mapContainer.innerHTML = ""; // Clear out any old map instances
    lsrMap = L.map("lsr-map").setView([40.4173, -82.9071], 7);
    
    const baseLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(lsrMap);

    // Initialize the layer for our manual reports
    manualLsrLayer = L.layerGroup().addTo(lsrMap);

    // ---FIX START: Create and attach the layer control to the map---
    const baseLayers = { "Dark": baseLayer };
    const initialOverlays = { "Viewer Reports": manualLsrLayer };
    // We create the layer control and attach it as a property to the map object.
    // This makes `lsrMap.layerControl` available for the `fetchLSRs` function.
    lsrMap.layerControl = L.control.layers(baseLayers, initialOverlays).addTo(lsrMap);
    // ---FIX END---


    // --- Attach Event Listeners for the Modal ---
    const addReportBtn = document.getElementById("add-report-btn");
    const clearReportsBtn = document.getElementById("clear-reports-btn");
    const reportModal = document.getElementById("report-modal-overlay");
    const closeReportModalBtn = document.getElementById("close-report-modal");
    const reportForm = document.getElementById("report-form");
    const locationInput = document.getElementById("report-location");
    const instructionEl = document.getElementById("modal-instruction");

    // We add a 'data-' attribute to the button to prevent attaching listeners more than once.
    if (!addReportBtn.dataset.listenerAttached) {
        addReportBtn.addEventListener("click", () => {
            reportModal.style.display = "flex";
            instructionEl.textContent = "Click on the map to set the report's location.";
            instructionEl.style.color = "var(--header-color)";
            reportLocation = null; // Reset location on open
            locationInput.value = ""; // Reset input field

            lsrMap.once("click", (e) => {
                reportLocation = e.latlng;
                locationInput.value = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
                instructionEl.textContent = "Location set! Fill out the details below.";
                instructionEl.style.color = "var(--ffw-color)";
            });
        });

        clearReportsBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to clear all viewer reports from the map?")) {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "clear_manual_lsrs" }));
                    console.log("Sent request to clear manual reports.");
                }
            }
        });

        closeReportModalBtn.addEventListener("click", () => {
            reportModal.style.display = "none";
            lsrMap.off("click"); // Important: remove the map click listener
            reportForm.reset();
        });

        reportForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!reportLocation) {
                alert("Please select a location on the map first.");
                return;
            }

            const reportData = {
                type: "manual_lsr",
                payload: {
                    lat: reportLocation.lat,
                    lng: reportLocation.lng,
                    typeText: document.getElementById("report-type").value,
                    magnitude: document.getElementById("report-magnitude").value,
                    remarks: document.getElementById("report-remarks").value,
                }
            };

            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(reportData));
            }
            closeReportModalBtn.click(); // Close and reset the modal
        });
        
        addReportBtn.dataset.listenerAttached = 'true'; // Mark listeners as attached
    }
}

  function initializeStateFilters() {
    const dropdown = document.getElementById("stateFilterDropdown");
    if (!dropdown) return;
    const button = dropdown.querySelector(".state-filter-button");
    const panel = dropdown.querySelector(".state-filter-panel");

    const states = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ];

    let html = "";
    states.forEach((state) => {
      html += `
            <label class="state-filter-label">
                <input type="checkbox" class="state-filter-checkbox" value="${state}">
                ${state}
            </label>
        `;
    });
    panel.innerHTML = html;

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.style.display = panel.style.display === "grid" ? "none" : "grid";
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        panel.style.display = "none";
      }
    });

    panel.addEventListener("change", (e) => {
      if (e.target.classList.contains("state-filter-checkbox")) {
        const state = e.target.value;
        if (e.target.checked) {
          activeStateFilters.add(state);
        } else {
          activeStateFilters.delete(state);
        }
        updateAlerts(activeAlertsCache);

        if (activeStateFilters.size === 0) {
          button.textContent = "Filter by State";
        } else if (activeStateFilters.size === 1) {
          button.textContent = `${
            activeStateFilters.values().next().value
          } Selected`;
        } else {
          button.textContent = `${activeStateFilters.size} States Selected`;
        }
      }
    });
  }

  function initializeMDStateFilter() {
    const dropdown = document.getElementById("md-state-filter-dropdown");
    if (!dropdown) return;

    const button = dropdown.querySelector(".state-filter-button");
    const panel = dropdown.querySelector(".state-filter-panel");
    const states = [
      "AL",
      "AK",
      "AZ",
      "AR",
      "CA",
      "CO",
      "CT",
      "DE",
      "FL",
      "GA",
      "HI",
      "ID",
      "IL",
      "IN",
      "IA",
      "KS",
      "KY",
      "LA",
      "ME",
      "MD",
      "MA",
      "MI",
      "MN",
      "MS",
      "MO",
      "MT",
      "NE",
      "NV",
      "NH",
      "NJ",
      "NM",
      "NY",
      "NC",
      "ND",
      "OH",
      "OK",
      "OR",
      "PA",
      "RI",
      "SC",
      "SD",
      "TN",
      "TX",
      "UT",
      "VT",
      "VA",
      "WA",
      "WV",
      "WI",
      "WY",
    ];

    panel.innerHTML = states
      .map(
        (state) => `
        <label class="state-filter-label">
            <input type="checkbox" class="state-filter-checkbox" value="${state}">
            ${state}
        </label>
    `
      )
      .join("");

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      panel.style.display = panel.style.display === "grid" ? "none" : "grid";
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        panel.style.display = "none";
      }
    });

    panel.addEventListener("change", (e) => {
      if (e.target.classList.contains("state-filter-checkbox")) {
        const state = e.target.value;
        if (e.target.checked) {
          activeMDStateFilters.add(state);
        } else {
          activeMDStateFilters.delete(state);
        }
        fetchMDs();

        if (activeMDStateFilters.size === 0) {
          button.textContent = "Filter by State (All)";
        } else if (activeMDStateFilters.size === 1) {
          button.textContent = `${
            activeMDStateFilters.values().next().value
          } Selected`;
        } else {
          button.textContent = `${activeMDStateFilters.size} States Selected`;
        }
      }
    });
  }

  function initializeMap() {
    if (map || !document.getElementById("alert-map")) return;

    map = L.map("alert-map").setView([41.65, -83.53], 7);

    const baseLayers = {
      Dark: L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ).addTo(map),
      Satellite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        }
      ),
      RoadMap: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }),
    };

    polygonLayer = L.layerGroup().addTo(map);
    stationMarkers = L.layerGroup().addTo(map);

    const radarLayer = L.tileLayer.wms(
      "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi",
      {
        layers: "nexrad-n0q-900913",
        format: "image/png",
        transparent: true,
        attribution: "Radar data &copy; IEM NEXRAD",
      }
    );

    const overlays = {
      Alerts: polygonLayer,
      Radar: radarLayer,
      Stations: stationMarkers,
    };

    L.control.layers(baseLayers, overlays).addTo(map);
    addTemperatureMarkers();
  }

  function addTemperatureMarkers() {
    stationData.forEach((stationInfo) => {
      const apiURL = `https://swd.weatherflow.com/swd/rest/observations/station/${stationInfo.id}?token=${stationInfo.apiKey}`;

      fetch(apiURL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch data for ${stationInfo.name}`);
          }
          return response.json();
        })
        .then((data) => {
          const station = data.obs[0];
          const stationLocation = [data.latitude, data.longitude];
          const tempF = (station.air_temperature * 1.8 + 32).toFixed();

          let temperatureClass = "temperature-warm";
          if (tempF <= 32) {
            temperatureClass = "temperature-belowfreezing";
          } else if (tempF < 40) {
            temperatureClass = "temperature-toocold";
          } else if (tempF < 50) {
            temperatureClass = "temperature-cold";
          } else if (tempF < 60) {
            temperatureClass = "temperature-cool";
          } else if (tempF < 70) {
            temperatureClass = "temperature-warm";
          } else if (tempF < 80) {
            temperatureClass = "temperature-warmer";
          } else if (tempF < 90) {
            temperatureClass = "temperature-hot";
          } else if (tempF < 100) {
            temperatureClass = "temperature-burning";
          } else {
            temperatureClass = "temperature-melting";
          }

          const temperatureMarker = L.divIcon({
            className: `temperature-marker ${temperatureClass}`,
            html: `${tempF}&deg;F`,
          });

          const marker = L.marker(stationLocation, {
            icon: temperatureMarker,
            title: stationInfo.name,
          });

          marker.addTo(stationMarkers);

          marker.on("click", function () {
            const feelsLike = (station.feels_like * (9 / 5) + 32).toFixed(2);
            const lightningCount = station.lightning_strike_count;
            const totalRainfall = (
              station.precip_accum_local_day_final / 25.4
            ).toFixed(2);
            const yesterdayRain = (
              station.precip_accum_local_yesterday_final / 25.4
            ).toFixed(2);

            const infoContent = `
              <strong>${stationInfo.name}</strong><br>
              Feels Like: ${feelsLike}&deg;F<br>
              Lightning Count (Today): ${lightningCount}<br>
              Total Rainfall (Today): ${totalRainfall} inches<br>
              Total Rainfall (Yesterday): ${yesterdayRain} inches
            `;

            L.popup()
              .setLatLng(stationLocation)
              .setContent(infoContent)
              .openOn(map);
          });
        })
        .catch((error) =>
          console.error(
            `Error fetching Tempest data for station ${stationInfo.id}:`,
            error
          )
        );
    });
  }

  function setupEventListeners() {
    console.log("Setting up event listeners...");

    menuItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        menuItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");
        const targetSectionId = item.getAttribute("data-section");
        sections.forEach((section) => {
          section.style.display =
            section.id === targetSectionId ? "block" : "none";
        });
        if (targetSectionId === "snow-emergency-section") {
          initializeSnowEmergencyMap();
        }
        if (targetSectionId === "map-section" && map) {
          setTimeout(() => { map.invalidateSize(); }, 10);
        }
        if (targetSectionId === "odot-section" && odotMap) {
          setTimeout(() => { odotMap.invalidateSize(); }, 10);
        }
        if (targetSectionId === "lsr-section" && lsrMap) {
          setTimeout(() => { lsrMap.invalidateSize(); }, 10);
        }
        if (targetSectionId === "director-panel-section") {
          document.body.classList.add("director-view-active");
          startObsPreview();
        } else {
          document.body.classList.remove("director-view-active");
        }
      });
    });

     const saveTickerBtn = document.getElementById('save-ticker-settings-btn');
    if (saveTickerBtn) {
        saveTickerBtn.addEventListener('click', () => {
            // Read selected phenomena
            const selectedPhenomena = Array.from(document.querySelectorAll('.ticker-phenomenon-filter:checked'))
                .map(checkbox => checkbox.value);

            // Read selected states
            const selectedStates = Array.from(document.querySelectorAll('.ticker-state-filter-checkbox:checked'))
                .map(checkbox => checkbox.value);

            // Construct the message for the backend
            const settingsMessage = {
                type: 'update_ticker_settings',
                settings: {
                    phenomena: selectedPhenomena,
                    states: selectedStates
                }
            };

            // Send settings via WebSocket
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(settingsMessage));
                console.log('Sent ticker settings:', settingsMessage);

                // Show a confirmation message to the user
                const confirmation = document.getElementById('save-confirmation');
                confirmation.style.opacity = '1';
                setTimeout(() => {
                    confirmation.style.opacity = '0';
                }, 2500);
            }
        });
    }

    if (filterControls) {
      filterControls
        .querySelector('[data-filter="ALL"]')
        .classList.add("active");
      filterControls.addEventListener("click", (e) => {
        if (!e.target.matches(".filter-btn")) return;
        const clickedFilter = e.target.dataset.filter;
        const allButton = filterControls.querySelector('[data-filter="ALL"]');
        if (clickedFilter === "ALL") {
          activeFilters.clear();
          filterControls
            .querySelectorAll(".filter-btn")
            .forEach((btn) => btn.classList.remove("active"));
          allButton.classList.add("active");
        } else {
          allButton.classList.remove("active");
          if (activeFilters.has(clickedFilter)) {
            activeFilters.delete(clickedFilter);
            e.target.classList.remove("active");
          } else {
            activeFilters.add(clickedFilter);
            e.target.classList.add("active");
          }
          if (activeFilters.size === 0) {
            allButton.classList.add("active");
          }
        }
        updateAlerts(activeAlertsCache);
      });
    }

    const afdTabs = document.querySelector(".afd-tabs");
    if (afdTabs) {
      afdTabs.addEventListener("click", (e) => {
        if (e.target.matches(".afd-tab")) {
          loadAFD(e.target.dataset.site);
        }
      });
    }
    const powerOutageTabsContainer =
      document.querySelector(".power-outage-tabs");
    if (powerOutageTabsContainer) {
      powerOutageTabsContainer.addEventListener("click", (e) => {
        if (e.target.matches(".outage-tab")) {
          const utility = e.target.dataset.utility;
          powerOutageTabsContainer
            .querySelectorAll(".outage-tab")
            .forEach((tab) => tab.classList.remove("active"));
          e.target.classList.add("active");
          document
            .querySelectorAll(".outage-map-container")
            .forEach((container) => {
              container.style.display = "none";
            });
          const activeContainer = document.getElementById(`outage-${utility}`);
          activeContainer.style.display = "flex";
        }
      });
    }

    // --- THIS IS THE COMBINED AND CORRECTED LISTENER ---
    document
      .getElementById("main-content")
      .addEventListener("click", (event) => {
        const featureButton = event.target.closest(".feature-camera-btn");
        const hideButton = event.target.closest(".hide-camera-warn-btn");

        if (featureButton) {
          const cameraTitle = featureButton.dataset.title;
          const cameraUrl = featureButton.dataset.url;
          if (
            cameraTitle &&
            cameraUrl &&
            socket &&
            socket.readyState === WebSocket.OPEN
          ) {
            const message = {
              type: "feature_camera",
              camera_data: { title: cameraTitle, imageUrl: cameraUrl },
            };
            socket.send(JSON.stringify(message));
          }
        } else if (hideButton) {
          console.log("Hiding featured camera from warning card.");
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "hide_camera_widget" }));
          }
        }
      });

    const hideCameraButton = document.getElementById("hide-camera-btn");
    if (hideCameraButton) {
      hideCameraButton.addEventListener("click", () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "hide_camera_widget" }));
        }
      });
    }

    // New chat button listeners
    chatToggleBtn.addEventListener("click", () => {
      chatWindow.classList.toggle("hidden");
      if (!chatWindow.classList.contains("hidden")) {
        unreadMessages = 0;
        chatBadge.style.display = "none";
        chatToggleBtn.classList.remove("flash-chat-button");
        document.getElementById("chat-feed-box-floating").scrollTop = 0;
      }
    });

    chatCloseBtn.addEventListener("click", () => {
      chatWindow.classList.add("hidden");
    });
    const reportModalOverlay = document.getElementById("report-modal-overlay");
    const reportModalContent = reportModalOverlay.querySelector(".modal-content");
    const reportModalHeader = reportModalOverlay.querySelector("h3");
    makeModalDraggable(reportModalOverlay, reportModalContent, reportModalHeader);
}

  function updateMapPolygons(alerts) {
    if (!polygonLayer) return;
    polygonLayer.clearLayers();

    const styleMapping = {
      TO: { color: "#f7768e", weight: 3 },
      SV: { color: "#e0af68", weight: 2 },
      SVR: { color: "#e0af68", weight: 2 },
      FF: { color: "#9ece6a", weight: 2 },
      FFW: { color: "#9ece6a", weight: 2 },
      SPS: { color: "#7dcfff", weight: 1, dashArray: "5, 5" },
      TOA: { color: "#FFFF00", weight: 3 },
      SVA: { color: "#DB7093", weight: 2 },
      FFA: { color: "#2E8B57", weight: 2 },
      WSA: { color: "#4682B4", weight: 2 }, // DarkSlateBlue
      WSW: { color: "#FF69B4", weight: 3 }, // DeepSkyBlue
      SQW: { color: "#C71585", weight: 3 }, // White for high urgency
      WW: { color: "#7B68EE", weight: 2 },  // MediumPurple
      WWY: { color: "#7B68EE", weight: 2 },
    };

    alerts.forEach((alert) => {      
      const style = styleMapping[alert.phenomenon] || {
        color: "#7aa2f7",
        weight: 1,
      };

      if (alert.phenomenon === 'WWY') {
      console.log("WWY Alert FIPS codes received by map:", alert.fips_codes);
    }

      if (alert.polygon && alert.polygon.length > 0) {
        L.polygon(alert.polygon, style).addTo(polygonLayer);
      } else if (alert.fips_codes && alert.fips_codes.length > 0) {
        if (!countyDataLoaded) {
          console.warn(
            `Attempted to draw FIPS for ${alert.product_id} but county data is not ready.`
          );
          return;
        }
        alert.fips_codes.forEach((fips) => {
          const correctedFips = fips.length > 5 ? fips.substring(1) : fips;
          const countyFeature = countyFipsMap.get(correctedFips);
          if (countyFeature) {
            L.geoJSON(countyFeature, { style }).addTo(polygonLayer);
          }
        });
      }
    });
  }

  async function fetchWithRetryAndTimeout(
    url,
    options = {},
    retries = 3,
    delay = 2000,
    timeout = 8000
  ) {
    for (let i = 0; i < retries; i++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
      } catch (err) {
        clearTimeout(timer);
        if (i === retries - 1) throw err;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  function updateAlerts(alerts) {
    let filteredAlerts = alerts;
    if (activeFilters.size > 0) {
      const phenomenaToDisplay = new Set();
      activeFilters.forEach((filter) => {
        if (filter === "SV") {
          phenomenaToDisplay.add("SV").add("SVR").add("SVA");
        } else if (filter === "FF") {
          phenomenaToDisplay.add("FF").add("FFW").add("FFA");
        } else if (filter === "TO") {
          phenomenaToDisplay.add("TO").add("TOA");
        } else {
          phenomenaToDisplay.add(filter);
        }
      });
      filteredAlerts = alerts.filter((alert) =>
        phenomenaToDisplay.has(alert.phenomenon)
      );
    }
    if (activeStateFilters.size > 0) {
      filteredAlerts = filteredAlerts.filter((alert) => {
        if (!alert.affected_areas || alert.affected_areas.length === 0) {
          return false;
        }
        return alert.affected_areas.some((ugc) =>
          activeStateFilters.has(ugc.substring(0, 2))
        );
      });
    }

    const container = document.getElementById("activeAlerts");
    if (!container) return;
    container.innerHTML = "";
    let counters = {
      TO: 0,
      SV: 0,
      SVR: 0,
      FF: 0,
      FFW: 0,
      SPS: 0,
      TOA: 0,
      SVA: 0,
      FFA: 0,
      WSA: 0,
      WSW: 0,
      SQW: 0,
      WW: 0,
      WWY: 0,
    };
    alerts.forEach((alert) => {
      if (counters.hasOwnProperty(alert.phenomenon))
        counters[alert.phenomenon]++;
    });

    torCountEl.textContent = counters.TO;
    svrCountEl.textContent = counters.SV + counters.SVR;
    ffwCountEl.textContent = counters.FF + counters.FFW;
    spsCountEl.textContent = counters.SPS;
    toaCountEl.textContent = counters.TOA;
    svaCountEl.textContent = counters.SVA;
    ffaCountEl.textContent = counters.FFA;
    document.getElementById("wsa-count").textContent = counters.WSA;
    document.getElementById("wsw-count").textContent = counters.WSW;
    document.getElementById("sqw-count").textContent = counters.SQW;
    document.getElementById("ww-count").textContent = counters.WW;

    if (filteredAlerts.length === 0) {
      container.innerHTML =
        '<p class="no-alerts">No active alerts match this filter.</p>';
      return;
    }

    const alertPriority = {
      TO: 1,
      TOA: 2,
      SQW: 2,
      SV: 3,
      SVR: 3,
      WSW: 3,
      SVA: 4,
      FF: 5,
      WSA: 5,
      FFW: 5,
      FFA: 6,
      SPS: 7,
      WW: 7,
      WWY: 7,
    };
    filteredAlerts.sort((a, b) => {
      const priorityA = alertPriority[a.phenomenon] || 99;
      const priorityB = alertPriority[b.phenomenon] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(b.issue_time) - new Date(a.issue_time);
    });

    filteredAlerts.forEach((alert) => {
      let alertInfo = {
        ...(ALERT_TYPE_MAP[alert.phenomenon] || {
          name: alert.phenomenon,
          icon: "fas fa-question-circle",
        }),
      };
      if (alert.is_emergency) {
        if (alert.phenomenon === "TO") alertInfo.name = "Tornado Emergency";
        else if (alert.phenomenon === "FF" || alert.phenomenon === "FFW")
          alertInfo.name = "Flash Flood Emergency";
      }
      const card = document.createElement("div");
      let threatClasses = "";
      if (alert.is_emergency) threatClasses += " emergency";
      if (alert.tornado_observed) threatClasses += " tornado-observed";
      if (alert.damage_threat === "CATASTROPHIC")
        threatClasses += " catastrophic";
      if (alert.damage_threat === "DESTRUCTIVE")
        threatClasses += " destructive";
      if (alert.damage_threat === "CONSIDERABLE")
        threatClasses += " considerable";
      let threatDetailsHTML = "";
      if (alert.max_wind_gust) {
        threatDetailsHTML += `<span class="threat-detail"><i class="fas fa-wind"></i> ${alert.max_wind_gust}</span>`;
      }
      if (alert.max_hail_size) {
        threatDetailsHTML += `<span class="threat-detail"><i class="far fa-circle"></i> ${alert.max_hail_size}</span>`;
      }
      if (alert.storm_motion) {
        threatDetailsHTML += `<span class="threat-detail"><i class="far fa-compass"></i> ${alert.storm_motion}</span>`;
      }
      let tagsHTML = "";
      if (alert.is_emergency)
        tagsHTML += `<span class="tag emergency">EMERGENCY</span>`;
      if (alert.tornado_observed) {
        tagsHTML += `<span class="tag emergency">OBSERVED</span>`;
      } else if (alert.tornado_detection) {
        tagsHTML += `<span class="tag">${alert.tornado_detection}</span>`;
      }
      if (alert.damage_threat === "DESTRUCTIVE")
        tagsHTML += `<span class="tag emergency">DESTRUCTIVE</span>`;
      if (alert.damage_threat === "CATASTROPHIC")
        tagsHTML += `<span class="tag emergency">CATASTROPHIC</span>`;
      if (alert.damage_threat === "CONSIDERABLE")
        tagsHTML += `<span class="tag">CONSIDERABLE</span>`;
      if (alert.tornado_possible) 
        tagsHTML += `<span class="tag">TORNADO POSSIBLE</span>`;

      let expirationTimeHTML = '';
      if (alert.expiration_time) {
        const expirationDate = new Date(alert.expiration_time);
        const formattedTime = expirationDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        expirationTimeHTML = `
            <span class="alert-expiration-time">
                <i class="far fa-clock"></i> Until ${formattedTime}
            </span>`;
      }

      card.className = `alert-card ${alert.phenomenon.toLowerCase()}${threatClasses}`;
      card.innerHTML = `
        <div class="alert-header">
            <div class="alert-header-left">
                <i class="${alertInfo.icon}"></i>
                <h3>${alertInfo.name}</h3>
            </div>
            <div class="alert-header-right">
                ${expirationTimeHTML}
                <div class="alert-actions">
                    <i class="fas fa-star alert-info-icon" onclick="featureAlert('${alert.id}')" title="Feature this alert"></i>
                    <i class="fas fa-map-marker-alt alert-info-icon" onclick="zoomToLocation('${alert.display_locations}')" title="Zoom to location"></i>
                    <i class="fas fa-info-circle alert-info-icon" onclick="showFullText(true, '${alert.id}')" title="View full alert text"></i>
                </div>
            </div>
        </div>
        <div class="alert-body">
            <p>${alert.display_locations}</p>
            <div class="alert-threats-container">
                <div class="alert-threat-details">${threatDetailsHTML}</div>
                <div class="alert-tags">${tagsHTML}</div>
            </div>
        </div>`;
      container.appendChild(card);
    });
}

  function updateNwwsFeed(products) {
    const container = document.getElementById("nwwsFeedContainer");
    if (!container) return;
    container.innerHTML = "";
    if (!products || products.length === 0) {
      container.innerHTML = '<p class="no-alerts">No recent products.</p>';
      return;
    }
    products.forEach((product) => {
      const item = document.createElement("div");
      item.className = "feed-item";
      item.onclick = () => showFullText(false, product.id);
      const header = product.text.split("\n")[0] || "Unknown Product";
      item.innerHTML = `
                <div class="feed-item-header">${header}</div>
                <div class="feed-item-content">${product.text}</div>`;
      container.appendChild(item);
    });
  }

  window.showFullText = function (isAlert, id) {
    const item = isAlert
      ? activeAlertsCache.find((a) => a.id === id)
      : recentProductsCache.find((p) => p.id === id);
    if (!item) return;
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.style.display = "flex";
    modalOverlay.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h3>Full Alert Text</h3>
                <pre class="alert-raw-text">${item.text || item.raw_text}</pre>
            </div>`;
    document.body.appendChild(modalOverlay);
    modalOverlay.querySelector(".modal-close").onclick = () =>
      document.body.removeChild(modalOverlay);
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) document.body.removeChild(modalOverlay);
    };
  };

  window.zoomToLocation = function (locations) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const match = locations.match(/([^,]+, [A-Z]{2})/);
    const firstCounty = match ? match[0] : null;
    if (firstCounty)
      socket.send(JSON.stringify({ type: "zoom", location: firstCounty }));
  };

  window.featureAlert = function (alertId) {
    const alertData = activeAlertsCache.find((a) => a.id === alertId);
    if (alertData && socket && socket.readyState === WebSocket.OPEN) {
      console.log(`Featuring alert ${alertData.product_id}`);
      socket.send(
        JSON.stringify({
          type: "feature_alert",
          alert_data: alertData,
        })
      );
    }
  };

  function checkLsrMapMessage() {
    const mapContainer = document.getElementById("lsr-map");
    if (!mapContainer || !lsrMap) return;

    // Check if there are any official reports on the map
    const hasOfficialReports = Object.values(lsrTypeLayers).some(layer => layer.getLayers().length > 0);
    
    // Check if there are any of our manual viewer reports on the map
    const hasManualReports = manualLsrLayer && manualLsrLayer.getLayers().length > 0;

    const messageEl = mapContainer.querySelector(".no-data-overlay");

    // If there are NO reports of any kind...
    if (!hasOfficialReports && !hasManualReports) {
        // ...and the message isn't already there, add it.
        if (!messageEl) {
            const messageOverlay = document.createElement("div");
            messageOverlay.className = "no-alerts no-data-overlay";
            messageOverlay.textContent = "No storm reports in the last 24 hours.";
            mapContainer.appendChild(messageOverlay);
        }
    } else {
        // If there ARE reports, find and remove the message.
        if (messageEl) {
            messageEl.remove();
        }
    }
}

  async function fetchLSRs() {
    initializeLsrMap();
    const mapContainer = document.getElementById("lsr-map");
    
    // Clear old official reports to prepare for new ones
    Object.values(lsrTypeLayers).forEach((layer) => layer.clearLayers());

    try {
        const res = await fetchWithRetryAndTimeout(
            "https://mesonet.agron.iastate.edu/geojson/lsr.geojson?states=OH&hours=24"
        );
        const data = await res.json();
        
        data.features.forEach((report) => {
            const { valid, typetext, city, magnitude, unit, county, remark } =
              report.properties;
            const [lon, lat] = report.geometry.coordinates;
    
            const reportType = typetext.toUpperCase();
    
            let lsrIcon; 
    
            // --- MODIFICATION START: Replaced PNG icons with styled Font Awesome icons ---
            switch (reportType) {
              case "TORNADO":
                lsrIcon = L.divIcon({
                  className: 'lsr-icon-background lsr-tornado',
                  html: '<i class="fas fa-wind"></i>'
                });
                break;
              case "HAIL":
                lsrIcon = L.divIcon({
                  className: 'lsr-icon-background lsr-hail',
                  html: '<i class="fas fa-cloud-meatball"></i>'
                });
                break;
              case "TSTM WND DMG":
              case "TSTM WND GST":
              case "NON-TSTM WND GST":
              case "WIND":
                lsrIcon = L.divIcon({
                  className: 'lsr-icon-background lsr-wind',
                  html: '<i class="fas fa-wind"></i>'
                });
                break;
              case "FLOOD":
              case "FLASH FLOOD":
                lsrIcon = L.divIcon({
                  className: 'lsr-icon-background lsr-flood',
                  html: '<i class="fas fa-house-flood-water"></i>'
                });
                break;
              case "RAIN":
                lsrIcon = L.divIcon({
                  className: 'lsr-icon-background lsr-rain',
                  html: '<i class="fas fa-cloud-showers-heavy"></i>'
                });
                break;
              default:
                lsrIcon = L.divIcon({
                  className: 'lsr-icon-background lsr-other',
                  html: '<i class="fas fa-bullhorn"></i>'
                });
                break;
            }
            // --- MODIFICATION END ---
    
            const marker = L.marker([lat, lon], { icon: lsrIcon });
            const formattedTime = new Date(valid).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
    
            const popupContent = `
                  <b>${typetext} Report</b><br>
                  <b>Time:</b> ${formattedTime}<br>
                  <b>Location:</b> ${city}, ${county} County<br>
                  <b>Magnitude:</b> ${magnitude || "N/A"} ${unit || ""}<br>
                  <hr style="margin: 5px 0;">
                  <p style="white-space: pre-wrap; margin: 0;">${
                    remark || "No remarks."
                  }</p>
              `;
            marker.bindPopup(popupContent);
    
            if (!lsrTypeLayers[typetext]) {
              lsrTypeLayers[typetext] = L.layerGroup().addTo(lsrMap);
              lsrMap.layerControl.addOverlay(lsrTypeLayers[typetext], typetext);
            }
    
            lsrTypeLayers[typetext].addLayer(marker);
        });

        lsrMap.invalidateSize();
    } catch (err) {
        console.error("Error loading storm reports:", err);
    } finally {
        // ✅ Always call our new smart function after the fetch attempt is complete.
        checkLsrMapMessage();
    }
}

  async function fetchGusts() {
    const wrapper = document.getElementById("gustsTableWrapper");
    if (!wrapper) return;
    wrapper.innerHTML = "<p>Loading...</p>";
    try {
      const now = new Date();
      const start = new Date(now.getTime() - 60 * 60 * 1000);
      const url = `https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?network=OH_ASOS&data=gust&format=comma&tz=Etc/UTC&year1=${start.getUTCFullYear()}&month1=${
        start.getUTCMonth() + 1
      }&day1=${start.getUTCDate()}&hour1=${start.getUTCHours()}&minute1=${start.getUTCMinutes()}&year2=${now.getUTCFullYear()}&month2=${
        now.getUTCMonth() + 1
      }&day2=${now.getUTCDate()}&hour2=${now.getUTCHours()}&minute2=${now.getUTCMinutes()}`;
      const res = await fetchWithRetryAndTimeout(url);
      const text = await res.text();
      const lines = text
        .trim()
        .split("\n")
        .filter((l) => l && !l.startsWith("#"));
      if (lines.length < 2) {
        wrapper.innerHTML =
          '<p class="no-alerts">No gusts reported in the last hour.</p>';
        return;
      }
      const headers = lines[0].split(",");
      const rows = lines.slice(1).map((line) => line.split(","));
      const gusts = rows
        .map((row) => ({
          station: row[headers.indexOf("station")],
          gust: parseFloat(row[headers.indexOf("gust")]),
          time: row[headers.indexOf("valid")],
        }))
        .filter((r) => !isNaN(r.gust))
        .sort((a, b) => b.gust - a.gust)
        .slice(0, 10);
      if (gusts.length === 0) {
        wrapper.innerHTML =
          '<p class="no-alerts">No gusts reported in the last hour.</p>';
        return;
      }
      const table = document.createElement("table");
      table.className = "data-table";
      table.innerHTML = `<thead><tr><th>City</th><th>Station</th><th>Gust</th><th>Time</th></tr></thead><tbody></tbody>`;
      const tbody = table.querySelector("tbody");
      gusts.forEach(({ station, gust, time }) => {
        const formattedTime = new Date(time + "Z").toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        const city = stationNames[station] || station;
        const gustClass =
          gust >= 70
            ? "gust-significant"
            : gust >= 58
            ? "gust-severe"
            : gust >= 46
            ? "gust-advisory"
            : "";
        const row = tbody.insertRow();
        row.innerHTML = `<td>${city}</td><td>${station}</td><td class="${gustClass}">${gust} mph</td><td>${formattedTime}</td>`;
      });
      wrapper.innerHTML = "";
      wrapper.appendChild(table);
    } catch (err) {
      wrapper.innerHTML = '<p class="no-alerts">Error loading wind gusts.</p>';
    }
  }

  let mesoDiscussionsCache = [];

  async function fetchMDs() {
    const list = document.getElementById("mdList");
    if (!list) return;

    list.innerHTML = "<p>Loading...</p>";

    if (mesoDiscussionsCache.length === 0) {
      try {
        const res = await fetchWithRetryAndTimeout(
          "https://www.spc.noaa.gov/products/spcmdrss.xml"
        );
        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        mesoDiscussionsCache = Array.from(xml.querySelectorAll("item"));
      } catch (err) {
        list.innerHTML =
          '<p class="no-alerts">Error loading mesoscale discussions.</p>';
        return;
      }
    }

    let itemsToDisplay = mesoDiscussionsCache;
    if (activeMDStateFilters.size > 0) {
      itemsToDisplay = mesoDiscussionsCache.filter((item) => {
        const title = (
          item.querySelector("title")?.textContent || ""
        ).toUpperCase();
        const description = (
          item.querySelector("description")?.textContent || ""
        ).toUpperCase();
        const fullContent = title + description;

        return Array.from(activeMDStateFilters).some((state) =>
          fullContent.includes(state)
        );
      });
    }

    if (itemsToDisplay.length === 0) {
      list.innerHTML =
        '<p class="no-alerts">No active mesoscale discussions for the selected states.</p>';
      return;
    }

    list.innerHTML = "";
    itemsToDisplay.forEach((item) => {
      const title = item.querySelector("title")?.textContent || "SPC MD";
      const link = item.querySelector("link")?.textContent || "#";
      const mdMatch = link.match(/(\d{4})\.html$/);
      const mdNumber = mdMatch ? mdMatch[1] : null;
      const li = document.createElement("div");
      li.className = "feed-item";
      li.innerHTML = `<a href="${link}" target="_blank">${title}</a>`;
      if (mdNumber) {
        const img = document.createElement("img");
        img.className = "md-image";
        img.style.display = "block";
        img.src = `https://www.spc.noaa.gov/products/md/mcd${mdNumber}_full.png`;
        li.appendChild(img);
      }
      list.appendChild(li);
    });
  }

  async function loadAFD(site) {
    currentAfdSite = site;

    const afdTabs = document.querySelector(".afd-tabs");
    if (afdTabs) {
      afdTabs
        .querySelectorAll(".afd-tab")
        .forEach((tab) => tab.classList.remove("active"));
      const activeTab = afdTabs.querySelector(`.afd-tab[data-site="${site}"]`);
      if (activeTab) activeTab.classList.add("active");
    }

    const contentDiv = document.getElementById("afd-content");
    if (!contentDiv) return;

    const afdText = afdCache[site];
    if (!afdText) {
      contentDiv.innerHTML = `<p class="no-alerts">Waiting for the next Area Forecast Discussion for ${site}...</p>`;
      return;
    }

    contentDiv.innerHTML = "";
    const rawText = afdText;
    const sections = rawText.split("&&");
    sections.forEach((sectionText) => {
      const trimmedText = sectionText.trim();
      if (!trimmedText) return;

      const headerMatch = trimmedText.match(/^\.([A-Z\s/]+)\.\.\./);
      if (headerMatch) {
        const headerTitle = headerMatch[1].trim();
        const bodyText = trimmedText.substring(headerMatch[0].length).trim();

        const headerEl = document.createElement("h4");
        headerEl.className = "afd-section-header";
        headerEl.textContent = headerTitle;

        const bodyEl = document.createElement("p");
        bodyEl.className = "afd-section-body";
        bodyEl.textContent = bodyText;

        contentDiv.appendChild(headerEl);
        contentDiv.appendChild(bodyEl);
      }
    });
  }

  function initializeOdotMap() {
    if (odotMap || !document.getElementById("odot-map")) return;

    odotMap = L.map("odot-map").setView([40.4173, -82.9071], 7);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    ).addTo(odotMap);

    const markers = L.markerClusterGroup();
    fetchOdotCameras(markers);
    fetchOdotSensors(markers);
    fetchOdotIncidents(markers);
    odotMap.addLayer(markers);
  }

  async function fetchOdotCameras(markers) {
    if (!CONFIG.odot_api_key || CONFIG.odot_api_key === "YOUR_API_KEY_HERE") {
      console.error("ODOT API key is not configured in frontend_config.js");
      return;
    }

    const cameraIcon = L.divIcon({
      html: '<i class="fas fa-camera" style="color: #7dcfff; font-size: 16px;"></i>',
      className: "map-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    try {
      const response = await fetch(
        "https://publicapi.ohgo.com/api/v1/cameras?page-all=true",
        {
          headers: {
            Authorization: `APIKEY ${CONFIG.odot_api_key}`,
          },
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      console.log(`Found ${data.totalResultCount} ODOT cameras.`);

      odotCameraCache = [];
      data.results.forEach((camera) => {
        if (camera.cameraViews && camera.cameraViews.length > 0) {
          odotCameraCache.push({
            id: camera.id,
            location: camera.location,
            latitude: camera.latitude,
            longitude: camera.longitude,
            imageUrl: camera.cameraViews[0].largeUrl,
          });
        }
      });

      odotCameraCache.forEach((camera) => {
        const marker = L.marker([camera.latitude, camera.longitude], {
          icon: cameraIcon,
        });
        const imageUrl = camera.imageUrl;

        const popupContent = `
              <b>${camera.location}</b><br>
              <img src="${imageUrl}" alt="${camera.location}" style="width:100%; max-width: 500px; height:auto; border-radius: 4px; margin-top: 5px; margin-bottom: 10px;">
              <button class="feature-camera-btn" 
                      data-title="${camera.location}" 
                      data-url="${imageUrl}">
                  Feature in OBS
              </button>
            `;
        marker.bindPopup(popupContent, {
          minWidth: 550,
          maxWidth: 550,
        });

        marker.on("popupopen", () => {
          cameraRefreshInterval = setInterval(() => {
            const imgElement = document.querySelector(
              `.leaflet-popup-content img[src^="${imageUrl}"]`
            );
            if (imgElement) {
              imgElement.src = `${imageUrl}?t=${new Date().getTime()}`;
            }
          }, 5000);
        });

        marker.on("popupclose", () => {
          clearInterval(cameraRefreshInterval);
        });

        markers.addLayer(marker);
      });
    } catch (error) {
      console.error("Failed to fetch ODOT camera data:", error);
    }
  }

  function updateCamerasInWarnings(alerts, cameras) {
    const container = document.getElementById("camerasInWarningList");
    if (!container) return;

    // This is in dashboard.js only, but safe to run in both
    if (typeof activeCameraIntervals !== "undefined") {
      for (const intervalId of activeCameraIntervals.values()) {
        clearInterval(intervalId);
      }
      activeCameraIntervals.clear();
    }

    container.innerHTML = "";
    const camerasFound = [];

    alerts.forEach((alert) => {
      // --- MODIFICATION START: Add a more robust check for a valid polygon ---
      // A valid polygon needs at least 4 points (first and last are the same)
      if (alert.polygon && alert.polygon.length >= 4) {
        // --- MODIFICATION END ---

        // This logic is safe because we've already validated the length
        const firstPoint = alert.polygon[0];
        const lastPoint = alert.polygon[alert.polygon.length - 1];
        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
          alert.polygon.push(firstPoint);
        }
        const polygonCoords = alert.polygon.map((p) => [p[1], p[0]]);

        try {
          // Add a try...catch block as an extra layer of safety
          const turfPolygon = turf.polygon([polygonCoords]);
          cameras.forEach((camera) => {
            const cameraPoint = turf.point([camera.longitude, camera.latitude]);
            if (
              turf.booleanPointInPolygon(cameraPoint, turfPolygon) &&
              !camerasFound.some((c) => c.id === camera.id)
            ) {
              camerasFound.push({
                ...camera,
                alertName:
                  ALERT_TYPE_MAP[alert.phenomenon]?.name || alert.phenomenon,
              });
            }
          });
        } catch (e) {
          console.error(
            "Turf.js failed to process a polygon for alert:",
            alert.product_id,
            e
          );
        }
      }
    });

    if (camerasFound.length === 0) {
      container.innerHTML =
        '<p class="no-alerts">No cameras are currently within an active warning polygon.</p>';
      return;
    }

    // This logic for IntersectionObserver is in dashboard.js only, but safe to run in both
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const imageId = entry.target.dataset.imageId;
            const imageUrl = entry.target.dataset.imageUrl;

            if (entry.isIntersecting) {
              const newIntervalId = setInterval(() => {
                const visibleImgElement = document.getElementById(imageId);
                if (visibleImgElement) {
                  const tempImg = new Image();
                  tempImg.onload = () => {
                    visibleImgElement.src = tempImg.src;
                  };
                  tempImg.src = `${imageUrl}?t=${new Date().getTime()}`;
                }
              }, 5000);
              activeCameraIntervals.set(imageId, newIntervalId);
            } else {
              if (activeCameraIntervals.has(imageId)) {
                clearInterval(activeCameraIntervals.get(imageId));
                activeCameraIntervals.delete(imageId);
              }
            }
          });
        },
        { root: document.getElementById("main-content"), threshold: 0.1 }
      );

      camerasFound.forEach((camera) => {
        const card = document.createElement("div");
        card.className = "alert-card camera-in-warning";
        const imageId = `warn-cam-img-${camera.id}`;

        card.dataset.imageId = imageId;
        card.dataset.imageUrl = camera.imageUrl;

        card.innerHTML = `
      <div class="alert-header">
          <i class="fas fa-video"></i><h3>${camera.location}</h3>
      </div>
      <div class="alert-body">
          <p>Inside <b>${camera.alertName}</b></p>
          <img id="${imageId}" src="${camera.imageUrl}" alt="${camera.location}">
          <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button class="feature-camera-btn" data-title="${camera.location}" data-url="${camera.imageUrl}">
                  <i class="fas fa-star"></i> Feature
              </button>
              <button class="hide-camera-warn-btn" title="Hide Featured Camera">
                  <i class="fas fa-eye-slash"></i> Hide
              </button>
          </div>
      </div>
  `;
        container.appendChild(card);
        observer.observe(card);
      });
    } else {
      // Fallback for alerts_embed.js which doesn't have the observer
      camerasFound.forEach((camera) => {
        const card = document.createElement("div");
        card.className = "alert-card camera-in-warning";
        const imageId = `warn-cam-img-${camera.id}`;
        card.innerHTML = `<div class="alert-header"><i class="fas fa-video"></i><h3>${camera.location}</h3></div><div class="alert-body"><p>Inside <b>${camera.alertName}</b></p><img id="${imageId}" src="${camera.imageUrl}" alt="${camera.location}"></div>`;
        container.appendChild(card);
      });
    }
  }

  async function fetchOdotIncidents(markers) {
    if (!CONFIG.odot_api_key || CONFIG.odot_api_key === "YOUR_API_KEY_HERE") {
      console.error("ODOT API key is not configured for incidents.");
      return;
    }

    // Larger icon with adjusted size and anchor to keep it centered
    const incidentIcon = L.divIcon({
      html: '<i class="fas fa-exclamation-triangle" style="color: #ff9e64; font-size: 20px;"></i>',
      className: "map-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const listContainer = document.getElementById("odot-incident-list");

    try {
      const response = await fetch(
        "https://publicapi.ohgo.com/api/v1/incidents?page-all=true",
        {
          headers: {
            Authorization: `APIKEY ${CONFIG.odot_api_key}`,
          },
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      console.log(`Found ${data.totalResultCount} ODOT incidents.`);

      // Clear previous list content before adding new items
      listContainer.innerHTML = "";

      if (data.results.length === 0) {
        listContainer.innerHTML =
          '<p class="no-alerts">No active incidents reported.</p>';
      } else {
        data.results.forEach((incident) => {
          // Create and append the item for the text list
          const incidentItem = document.createElement("div");
          incidentItem.className = "incident-item";
          incidentItem.innerHTML = `
                    <b>${incident.category}: ${incident.location}</b>
                    <p>${incident.description}</p>
                `;
          listContainer.appendChild(incidentItem);

          // --- Logic for map markers (unchanged except for the icon size) ---
          const marker = L.marker([incident.latitude, incident.longitude], {
            icon: incidentIcon,
          });

          let popupContent = `
                    <b>${incident.location}</b><br>
                    <small>${incident.category}</small>
                    <hr style="margin: 5px 0;">
                    <b>Description:</b> ${incident.description}<br>
                    <b>Direction:</b> ${incident.direction || "N/A"}<br>
                    <b>Status:</b> ${incident.roadStatus}
                `;

          marker.bindPopup(popupContent, {
            className: "camera-popup",
          });
          markers.addLayer(marker);

          if (
            incident.roadClosureDetails &&
            incident.roadClosureDetails.polyline &&
            incident.roadClosureDetails.polyline.length > 0
          ) {
            const leafletPolyline = incident.roadClosureDetails.polyline.map(
              (p) => [p[1], p[0]]
            );
            const closurePolyline = L.polyline(leafletPolyline, {
              color: "#f7768e",
              weight: 4,
              opacity: 0.8,
            });
            closurePolyline.addTo(odotMap);
            closurePolyline.bindTooltip(`Closure: ${incident.location}`, {
              sticky: true,
            });
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch ODOT incident data:", error);
      listContainer.innerHTML =
        '<p class="no-alerts">Error loading incident data.</p>';
    }
  }

  function initializeSnowEmergencyMap() {
    const mapContainer = document.getElementById("snow-emergency-map");
    if (!mapContainer || snowEmergencyMap) {
        if (snowEmergencyMap) snowEmergencyMap.invalidateSize();
        return; // Exit if the container isn't there or map is already initialized
    }
    
    snowEmergencyMap = L.map('snow-emergency-map').setView([39.9612, -82.9988], 7);
    
    // Use the same dark theme tile layer as the other maps
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(snowEmergencyMap);

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
            <strong>Snow Emergency Levels</strong><br>
            <span style="background: #ffff00"></span> Level 1<br>
            <span style="background: #ffa500"></span> Level 2<br>
            <span style="background: #ff0000"></span> Level 3<br>
            <span style="background: #da70d6"></span> Road Hazards<br>
            <span style="background: #222222"></span> Does Not Issue<br>
        `;
        return div;
    };
    legend.addTo(snowEmergencyMap);

    const lastUpdatedControl = L.control({ position: 'topright' });
    lastUpdatedControl.onAdd = function () {
        const div = L.DomUtil.create('div', 'last-updated');
        div.innerHTML = 'Last Updated: Loading...';
        return div;
    };
    lastUpdatedControl.addTo(snowEmergencyMap);

    const getColor = (level) => {
        return level === 5 ? '#222222' :   // Does not issue (darker gray)
               level === 4 ? '#da70d6' :   // Road Hazards (Orchid purple)
               level === 3 ? '#ff0000' :   // Level 3 (Red)
               level === 2 ? '#ffa500' :   // Level 2 (Orange)
               level === 1 ? '#ffff00' :   // Level 1 (Yellow)
               'transparent';             // Default (no data)
    };
    
    let geoLayer;

    async function addCounties() {
        try {
            const geoResponse = await fetch('https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json');
            if (!geoResponse.ok) throw new Error(`GeoJSON fetch error: ${geoResponse.status}`);
            const geojson = await geoResponse.json();

            const sheetUrl = 'https://script.google.com/macros/s/AKfycbyyy6Pp5cKJqelzOLugwvYPA29aDaYg3S0-EE9aSRP1aSveLeWZZ4CC0vGlq1Gh38ia/exec';
            const sheetResponse = await fetch(sheetUrl);
            if (!sheetResponse.ok) throw new Error(`Google Sheets fetch error: ${sheetResponse.status}`);
            const sheetData = await sheetResponse.json();

            const snowLevels = {};
            sheetData.forEach(item => {
                const fips = String(item.stateFIPS).padStart(2, '0') + String(item.countyFIPS).padStart(3, '0');
                snowLevels[fips] = item.level;
            });
            
            if (geoLayer) {
                snowEmergencyMap.removeLayer(geoLayer);
            }

            geoLayer = L.geoJSON(geojson, {
                style: (feature) => ({
                    color: 'rgba(216, 222, 233, 0.5)', // Use a light border from the theme
                    weight: 1,
                    fillColor: getColor(snowLevels[feature.id] || 0),
                    fillOpacity: 0.8,
                }),
                filter: (feature) => feature.properties.STATE === "39", // Ohio FIPS is "39"
                onEachFeature: (feature, layer) => {
                    const level = snowLevels[feature.id] || 0;
                    const countyName = feature.properties.NAME || "Unknown County";
                    let levelText = `Level ${level}`;
                    if (level === 4) levelText = "Travel Advisory";
                    if (level === 5) levelText = "Does Not Issue";
                    layer.bindTooltip(`${countyName}: ${levelText}`, { sticky: true });
                }
            }).addTo(snowEmergencyMap);
            
            // Update timestamp
            document.querySelector('.last-updated').innerHTML = `Last Updated: ${new Date().toLocaleString()}`;

        } catch (error) {
            console.error("Error loading snow emergency data:", error);
        }
    }
    addCounties();
    setInterval(addCounties, 0.5 * 60 * 1000); // Refresh every 5 minutes
  }

  function updateWindGusts() {
    console.log("Auto-refreshing Top Wind Gusts...");
    fetchGusts();
  }

  function updateMDs() {
    mesoDiscussionsCache = [];
    console.log("Auto-refreshing Mesoscale Discussions...");
    fetchMDs();
  }

async function fetchOdotSensors(markers) {
    if (!CONFIG.odot_api_key || CONFIG.odot_api_key === "YOUR_API_KEY_HERE") {
      return;
    }

    const sensorIcon = L.divIcon({
      html: '<i class="fas fa-thermometer-half" style="color: #9ece6a; font-size: 16px;"></i>',
      className: "map-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    try {
      const response = await fetch(
        "https://publicapi.ohgo.com/api/v1/weather-sensor-sites?page-all=true",
        {
          headers: { Authorization: `APIKEY ${CONFIG.odot_api_key}` },
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      
      data.results.forEach((sensor) => {
        const marker = L.marker([sensor.latitude, sensor.longitude], {
          icon: sensorIcon,
        });

        let popupContent = `<b>${sensor.location}</b><br><small>${
          sensor.description || ""
        }</small>`;

        const atmospheric =
          sensor.atmosphericSensors && sensor.atmosphericSensors.length > 0
            ? sensor.atmosphericSensors[0]
            : null;
        const surface =
          sensor.surfaceSensors && sensor.surfaceSensors.length > 0
            ? sensor.surfaceSensors[0]
            : null;

        if (atmospheric || surface) {
          popupContent += `<hr style="margin: 5px 0;">`;

          if (atmospheric) {
            // FINAL FIX: Use camelCase property names based on the actual API response
            const windDir = atmospheric.windDirection || "N/A";
            const windSpeed = atmospheric.averageWindSpeed || 0;
            popupContent += `
              <b>Air Temp:</b> ${atmospheric.airTemperature}°F<br>
              <b>Wind:</b> ${windDir} at ${windSpeed} MPH<br>
              <b>Precipitation:</b> ${atmospheric.precipitationRate} in/hr<br>
            `;
          }
          if (surface) {
            popupContent += `<b>Pavement Temp:</b> ${surface.surfaceTemperature}°F<br>`;
          }
        } else {
          popupContent += `<br><br><i>No recent reading available.</i>`;
        }

        marker.bindPopup(popupContent, { className: "camera-popup" });
        markers.addLayer(marker);
      });
    } catch (error) {
      console.error("Failed to fetch ODOT sensor data:", error);
    }
  }

  setInterval(function () {
    fetchLSRs();
    updateWindGusts();
    updateMDs();
  }, 60000);

  connect();
});
