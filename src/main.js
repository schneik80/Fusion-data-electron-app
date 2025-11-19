const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path');

// Set app name for macOS menu bar - must be called before app.whenReady()
app.setName('Autodesk Fusion Data Client');

let mainWindow;
const viewsByUrl = new Map(); // Map of URL -> BrowserView
let currentView = null; // Currently visible BrowserView
let sidebarOpen = false; // Track sidebar state

function createWindow() {
  // Electron Forge webpack plugin injects MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY as a string constant
  // Use the injected constant directly (webpack replaces it at build time)
  const preloadPath = typeof process.env.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY !== 'undefined'
    ? process.env.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    : path.join(__dirname, 'preload.js');
  
  console.log('Creating window with preload:', preloadPath);
  console.log('Main entry:', process.env.MAIN_WINDOW_WEBPACK_ENTRY);
  
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    title: 'Autodesk Fusion Data Client',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
      backgroundThrottling: false, // Better performance
    },
  });
  
  // Log when preload script loads
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
    console.log('electronAPI available in renderer?', 'Check DevTools console');
  });

  mainWindow.loadURL(process.env.MAIN_WINDOW_WEBPACK_ENTRY);

  // Wait for main window to load, then set up BrowserViews
  mainWindow.webContents.once('did-finish-load', () => {
    setupRightPane();
  });
}

// Update bounds for all views when window resizes or sidebar toggles
function updateAllViewBounds() {
  const [width, height] = mainWindow.getContentSize();
  // Sidebar is 78px when collapsed, 250px when open
  const sidebarWidth = sidebarOpen ? 250 : 78;
  const bounds = {
    x: sidebarWidth,
    y: 0,
    width: width - sidebarWidth,
    height: height,
  };
  
  // Update bounds for all views
  viewsByUrl.forEach((view) => {
    view.setBounds(bounds);
  });
}

// Setup CSS injection and event handlers for a BrowserView's webContents
function setupViewWebContents(webContents, url) {
  // Optimize web contents for faster loading
  webContents.on('did-start-loading', () => {
    webContents.setZoomFactor(1.0);
  });
  
  // Inject CSS to hide elements whenever a page finishes loading
  webContents.on('did-finish-load', () => {
    webContents.insertCSS(`
      .shopfloor-link {
        display: none !important;
      }
      .flc-link {
        display: none !important;
      }
      #fusion-header-fuison-link {
        display: none !important;
      }
    `);
  });
}

// Convert custom URL schemes to actual URLs
function resolveUrl(url) {
  if (url.startsWith('taska://')) {
    // Handle taska:// URLs - convert to local file paths
    if (url === 'taska://kanban') {
      // Get the path to kanban.html
      // In development: __dirname points to .webpack/main
      // In production: __dirname points to app.asar
      // We need to go up to the app root and then into src
      let kanbanPath;
      const fs = require('fs');
      
      // Try multiple path strategies
      const possiblePaths = [
        path.join(__dirname, '..', 'src', 'kanban.html'), // Development
        path.join(app.getAppPath(), 'src', 'kanban.html'), // Production
        path.join(process.resourcesPath, 'app', 'src', 'kanban.html'), // Alternative production path
      ];
      
      // Find the first path that exists
      for (const testPath of possiblePaths) {
        try {
          if (fs.existsSync(testPath)) {
            kanbanPath = testPath;
            console.log('Found kanban.html at:', kanbanPath);
            break;
          }
        } catch (e) {
          // Continue to next path
        }
      }
      
      // Fallback to first path if none found
      if (!kanbanPath) {
        kanbanPath = possiblePaths[0];
        console.warn('Kanban.html not found, using fallback path:', kanbanPath);
      }
      
      // Normalize path separators for file:// URL
      // On Windows, we need to replace backslashes with forward slashes
      const normalizedPath = path.resolve(kanbanPath).replace(/\\/g, '/');
      return `file://${normalizedPath}`;
    }
  }
  return url;
}

// Get or create a BrowserView for a specific URL
function getOrCreateView(url) {
  // Resolve custom URL schemes
  const resolvedUrl = resolveUrl(url);
  
  if (viewsByUrl.has(resolvedUrl)) {
    return viewsByUrl.get(resolvedUrl);
  }
  
  // Create new BrowserView with persistent session
  // Each view uses the same partition so they share cookies/auth
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      partition: 'persist:web-view', // Persistent session - saves cookies/auth to disk
      backgroundThrottling: false, // Don't throttle when window is in background
    },
  });
  
  // Set up webContents handlers
  setupViewWebContents(view.webContents, resolvedUrl);
  
  // Set initial bounds (will be updated when shown)
  // Use updateAllViewBounds to ensure consistent sizing
  updateAllViewBounds();
  
  // Store the view
  viewsByUrl.set(resolvedUrl, view);
  
  // Load the URL
  view.webContents.loadURL(resolvedUrl);
  
  console.log('Created new BrowserView for:', resolvedUrl);
  return view;
}

// Show a specific view by URL, hiding the current one
function showView(url) {
  if (!url) {
    console.error('showView: No URL provided');
    return;
  }
  
  // Resolve custom URL schemes
  const resolvedUrl = resolveUrl(url);
  
  // Get or create the view for this URL
  const targetView = getOrCreateView(resolvedUrl);
  
  // Hide current view if different
  if (currentView && currentView !== targetView) {
    // Detach current view from window
    mainWindow.setBrowserView(null);
    console.log('Hid current view');
  }
  
  // Show target view
  mainWindow.setBrowserView(targetView);
  currentView = targetView;
  
  // Update bounds to ensure it's positioned correctly
  updateAllViewBounds();
  
  console.log('Showing view for:', resolvedUrl);
}

function setupRightPane() {
  // Set up resize handler to update all view bounds
  mainWindow.on('resize', updateAllViewBounds);
  
  // Load the default URL (first button)
  showView('https://imallc.autodesk360.com/g/all_projects/active');
}

// IPC handler for loading URLs
const { ipcMain } = require('electron');

ipcMain.on('load-url', (event, url) => {
  console.log('IPC: load-url received:', url);
  
  if (!url) {
    console.error('IPC: No URL provided');
    return;
  }
  
  if (!mainWindow) {
    console.error('IPC: Main window not initialized yet');
    return;
  }
  
  // Show the view for this URL (will create if needed, or show existing)
  showView(url);
});

// IPC handler for sidebar toggle
ipcMain.on('sidebar-toggle', (event, isOpen) => {
  console.log('IPC: sidebar-toggle received:', isOpen);
  
  if (!mainWindow) {
    console.error('IPC: Main window not initialized yet');
    return;
  }
  
  // Update sidebar state and BrowserView bounds
  sidebarOpen = isOpen;
  updateAllViewBounds();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
