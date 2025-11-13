const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadUrl: (url) => {
    console.log('Preload: loadUrl called with:', url);
    ipcRenderer.send('load-url', url);
  },
  sidebarToggle: (isOpen) => {
    console.log('Preload: sidebarToggle called with:', isOpen);
    ipcRenderer.send('sidebar-toggle', isOpen);
  }
});
