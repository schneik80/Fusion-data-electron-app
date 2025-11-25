// Jest setup file
// This file runs before each test file

// Mock Electron for testing
jest.mock('electron', () => ({
  app: {
    getName: jest.fn(() => 'Autodesk Fusion Data Client'),
    setName: jest.fn(),
    whenReady: jest.fn(() => Promise.resolve()),
    getAppPath: jest.fn(() => '/mock/app/path'),
    on: jest.fn(),
    quit: jest.fn(),
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    webContents: {
      on: jest.fn(),
      once: jest.fn(),
      insertCSS: jest.fn(),
      setZoomFactor: jest.fn(),
    },
    on: jest.fn(),
    getContentSize: jest.fn(() => [1600, 900]),
    setBrowserView: jest.fn(),
  })),
  BrowserView: jest.fn().mockImplementation(() => ({
    webContents: {
      on: jest.fn(),
      once: jest.fn(),
      insertCSS: jest.fn(),
      setZoomFactor: jest.fn(),
      loadURL: jest.fn(),
    },
    setBounds: jest.fn(),
  })),
  ipcMain: {
    on: jest.fn(),
  },
  ipcRenderer: {
    send: jest.fn(),
  },
  contextBridge: {
    exposeInMainWorld: jest.fn(),
  },
}));

// Increase timeout for async operations
jest.setTimeout(10000);

