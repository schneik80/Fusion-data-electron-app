const { app, BrowserWindow, BrowserView, session } = require('electron');
const path = require('path');

// Set app name for macOS menu bar - must be called before app.whenReady()
app.setName('Autodesk Fusion Data Client');

let mainWindow;
const viewsByUrl = new Map(); // Map of URL -> BrowserView
let currentView = null; // Currently visible BrowserView
let sidebarOpen = false; // Track sidebar state

// Initialize persistent session early to ensure credential caching works
// This ensures cookies and credentials are properly persisted in production builds
function initializePersistentSession() {
  const persistentSession = session.fromPartition('persist:web-view', { cache: true });
  
  console.log('Initializing persistent session:', persistentSession.partition);
  console.log('User data path:', app.getPath('userData'));
  
  // Ensure cookies are flushed to disk when changed
  persistentSession.cookies.on('changed', (event, cookie, cause, removed) => {
    if (!removed) {
      // Cookie was set or updated, flush to ensure persistence
      persistentSession.cookies.flushStore().catch(err => {
        console.error('Error flushing cookies:', err);
      });
    }
  });
  
  // Periodically flush cookies to ensure persistence (every 30 seconds)
  // This is especially important in production builds
  setInterval(() => {
    persistentSession.cookies.flushStore().catch(err => {
      console.error('Error flushing cookies (periodic):', err);
    });
  }, 30000);
  
  return persistentSession;
}

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
      partition: 'persist:web-view', // Use same session partition for credential sharing
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
function setupViewWebContents(webContents, initialUrl) {
  // Optimize web contents for faster loading
  webContents.on('did-start-loading', () => {
    webContents.setZoomFactor(1.0);
  });
  
  // Handle navigation to track URL changes (important for post-login redirects)
  webContents.on('did-navigate', (event, url) => {
    console.log('BrowserView navigated to:', url);
    // Update the view mapping if URL changed (e.g., after login redirect)
    if (viewsByUrl.has(initialUrl) && url !== initialUrl) {
      const view = viewsByUrl.get(initialUrl);
      viewsByUrl.delete(initialUrl);
      viewsByUrl.set(url, view);
      console.log('Updated view mapping from', initialUrl, 'to', url);
    }
  });
  
  // Handle navigation within the same page (hash changes, etc.)
  webContents.on('did-navigate-in-page', (event, url, isMainFrame) => {
    if (isMainFrame) {
      console.log('BrowserView navigated in-page to:', url);
      // Update mapping for in-page navigation too
      if (viewsByUrl.has(initialUrl) && url !== initialUrl) {
        const view = viewsByUrl.get(initialUrl);
        viewsByUrl.delete(initialUrl);
        viewsByUrl.set(url, view);
      }
    }
  });
  
  // Inject CSS to hide elements whenever a page finishes loading
  webContents.on('did-finish-load', () => {
    const currentUrl = webContents.getURL();
    console.log('BrowserView finished loading:', currentUrl);
    
    // Update mapping if URL changed during load (e.g., after login redirect)
    if (viewsByUrl.has(initialUrl) && currentUrl !== initialUrl) {
      const view = viewsByUrl.get(initialUrl);
      viewsByUrl.delete(initialUrl);
      viewsByUrl.set(currentUrl, view);
      console.log('Updated view mapping after load from', initialUrl, 'to', currentUrl);
      
      // If this is the current view, ensure it's still properly displayed
      if (currentView === view && mainWindow) {
        // Ensure the view is still attached and visible
        const attachedView = mainWindow.getBrowserView();
        if (attachedView !== view) {
          console.log('Re-attaching view after URL change');
          mainWindow.setBrowserView(view);
          updateAllViewBounds();
        }
      }
    }
    
    // Small delay to ensure page is fully rendered before injecting CSS
    setTimeout(() => {
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
      `).catch(err => {
        console.error('Error injecting CSS:', err);
      });
    }, 100);
  });
  
  // Handle page load failures
  webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('BrowserView failed to load:', validatedURL, errorCode, errorDescription);
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
  
  // Verify session is persistent and configure cookie persistence
  const viewSession = view.webContents.session;
  console.log('BrowserView session partition:', viewSession.partition);
  
  // Ensure cookies are persisted by flushing on changes
  viewSession.cookies.on('changed', () => {
    viewSession.cookies.flushStore().catch(err => {
      console.error('Error flushing cookies for view:', err);
    });
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
  
  // Check if we already have a view for this URL
  let targetView = viewsByUrl.get(resolvedUrl);
  
  // If no view found, check if any existing view has navigated to this URL
  if (!targetView) {
    // Search through all views to find one that has navigated to this URL
    for (const [storedUrl, view] of viewsByUrl.entries()) {
      const currentUrl = view.webContents.getURL();
      if (currentUrl === resolvedUrl || currentUrl.startsWith(resolvedUrl.split('?')[0])) {
        // Found a view that has navigated to this URL (e.g., after login redirect)
        targetView = view;
        // Update the mapping to use the current URL
        viewsByUrl.delete(storedUrl);
        viewsByUrl.set(resolvedUrl, view);
        console.log('Found redirected view, updated mapping from', storedUrl, 'to', resolvedUrl);
        break;
      }
    }
  }
  
  // If still no view found, create a new one
  if (!targetView) {
    targetView = getOrCreateView(resolvedUrl);
  } else {
    // View exists, ensure it's loaded and visible
    const currentUrl = targetView.webContents.getURL();
    if (currentUrl !== resolvedUrl && !currentUrl.startsWith(resolvedUrl.split('?')[0])) {
      // URL doesn't match, reload to the requested URL
      console.log('Reloading view to:', resolvedUrl);
      targetView.webContents.loadURL(resolvedUrl);
    }
  }
  
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
  
  // Ensure the view is visible and properly loaded
  const currentUrl = targetView.webContents.getURL();
  const isLoading = targetView.webContents.isLoading();
  
  console.log('Showing view for:', resolvedUrl);
  console.log('Current view URL:', currentUrl);
  console.log('Is loading:', isLoading);
  
  // If the page is still loading, wait for it to finish
  if (isLoading) {
    targetView.webContents.once('did-finish-load', () => {
      console.log('View finished loading, current URL:', targetView.webContents.getURL());
      // Ensure bounds are correct after load
      updateAllViewBounds();
    });
  }
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

app.whenReady().then(() => {
  // Initialize persistent session before creating windows
  initializePersistentSession();
  createWindow();
});

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
