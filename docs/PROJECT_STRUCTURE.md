# Project Structure

This document describes the overall structure and organization of the Autodesk Fusion Data Client project.

## Directory Structure

```
Fusion-data-electron-app/
├── assets/                    # Application assets and icons
│   ├── autodesk-fusion-product-icon-*.png
│   └── icon.png
├── docs/                      # Documentation (this folder)
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── CAPABILITIES.md
│   ├── BUILD_AND_RUN.md
│   └── PROJECT_STRUCTURE.md
├── src/                       # Source code
│   ├── main.js               # Main process entry point
│   ├── preload.js            # Preload script (context bridge)
│   ├── renderer.js           # Renderer process logic
│   ├── index.html            # Main window HTML
│   ├── index.css             # Main window styles
│   ├── kanban.html           # Kanban board view
│   └── navicons/             # Navigation icons and fonts
│       ├── *.png             # Navigation icons
│       └── SymbolsNerdFont-*.ttf  # Nerd Font for icons
├── tests/                     # Test suite
│   ├── setup.js              # Jest setup and mocks
│   ├── build-verify.js       # Build verification script
│   ├── main.test.js          # Main process tests
│   ├── preload.test.js       # Preload script tests
│   ├── renderer.test.js      # Renderer process tests
│   ├── integration.test.js   # Integration tests
│   └── README.md             # Test documentation
├── out/                       # Build output directory
├── .webpack/                  # Webpack build artifacts
├── node_modules/              # Dependencies
├── package.json               # Project configuration
├── package-lock.json          # Dependency lock file
├── jest.config.js             # Jest configuration
├── forge.config.js            # Electron Forge configuration
├── webpack.main.config.js     # Webpack config for main process
├── webpack.renderer.config.js # Webpack config for renderer process
└── webpack.rules.js           # Shared webpack rules
```

## Source Code Organization

### Main Process (`src/main.js`)

The main process is responsible for:
- Application lifecycle management
- Window creation and management
- BrowserView management for web content
- IPC (Inter-Process Communication) handlers
- URL resolution and routing
- Sidebar state management

**Key Components:**
- `createWindow()`: Creates the main application window
- `getOrCreateView()`: Manages BrowserView instances
- `showView()`: Displays a specific URL in a BrowserView
- `resolveUrl()`: Converts custom URL schemes to file paths
- `updateAllViewBounds()`: Updates BrowserView positioning

### Preload Script (`src/preload.js`)

The preload script runs in a privileged context and provides a secure bridge between the renderer and main processes.

**Responsibilities:**
- Exposes `electronAPI` to the renderer process
- Provides `loadUrl()` function for navigation
- Provides `sidebarToggle()` function for sidebar state management
- Uses `contextBridge` for secure IPC communication

### Renderer Process (`src/renderer.js`)

The renderer process handles the UI and user interactions.

**Responsibilities:**
- Sidebar DOM manipulation
- Navigation link event handling
- Menu button toggle functionality
- Icon state management
- Communication with main process via `electronAPI`

### HTML and CSS

- **`src/index.html`**: Main window structure with sidebar navigation
- **`src/index.css`**: Styling for sidebar, navigation, and UI components
- **`src/kanban.html`**: Standalone Kanban board view (accessed via `taska://kanban`)

## Configuration Files

### `package.json`

Defines project metadata, dependencies, and scripts:
- **Scripts**: `start`, `package`, `make`, `test`, etc.
- **Dependencies**: React, Electron, etc.
- **DevDependencies**: Build tools, testing frameworks

### `forge.config.js`

Electron Forge configuration:
- Packager settings
- Maker configurations (ZIP, DMG, DEB, RPM, Squirrel)
- Webpack plugin configuration
- Fuses configuration for security

### Webpack Configurations

- **`webpack.main.config.js`**: Bundles main process code
- **`webpack.renderer.config.js`**: Bundles renderer process code with CSS support
- **`webpack.rules.js`**: Shared webpack rules

### `jest.config.js`

Jest testing configuration:
- Test environments (Node and jsdom)
- Coverage settings
- Module mappings

## Build Artifacts

### `.webpack/`

Contains webpack-compiled code:
- Main process bundle
- Renderer process bundle
- Preload script bundle

### `out/`

Contains packaged applications:
- Platform-specific builds (darwin, win32, linux)
- Installer packages
- Distribution archives

## Assets

### Icons (`assets/`)

Application icons in various formats and sizes for different platforms.

### Navigation Icons (`src/navicons/`)

- PNG icons for navigation items
- Nerd Font files for icon rendering in the sidebar

## Testing Structure

The `tests/` directory contains:
- Unit tests for each process
- Integration tests
- Build verification scripts
- Test setup and configuration

See [Test Documentation](../tests/README.md) for more details.

## Key Design Patterns

1. **Process Separation**: Clear separation between main, renderer, and preload processes
2. **Context Isolation**: Secure communication via contextBridge
3. **View Management**: BrowserView instances for each URL/service
4. **Session Persistence**: Shared partition for authentication
5. **Custom URL Schemes**: Support for local file-based views

## File Naming Conventions

- **JavaScript files**: camelCase (e.g., `main.js`, `renderer.js`)
- **Configuration files**: kebab-case (e.g., `webpack.main.config.js`)
- **Test files**: `*.test.js` or `*.spec.js`
- **Documentation**: UPPER_SNAKE_CASE.md

## Dependencies

### Production Dependencies

- `electron-squirrel-startup`: Windows installer support
- `react`: UI library (for future enhancements)
- `react-dom`: React DOM bindings

### Development Dependencies

- `electron`: Electron framework
- `@electron-forge/*`: Build and packaging tools
- `jest`: Testing framework
- `webpack` and loaders: Module bundling
- `babel`: JavaScript transpilation

## Build Process

1. **Development**: `npm start` - Runs webpack in watch mode and starts Electron
2. **Packaging**: `npm run package` - Creates platform-specific packages
3. **Distribution**: `npm run make` - Creates installers for target platforms

See [Build and Run Instructions](./BUILD_AND_RUN.md) for detailed steps.

