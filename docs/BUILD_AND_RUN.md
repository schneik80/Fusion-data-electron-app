# Build and Run Instructions

This document provides step-by-step instructions for building, running, and packaging the Autodesk Fusion Data Client.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Running in Development](#running-in-development)
- [Building for Production](#building-for-production)
- [Packaging for Distribution](#packaging-for-distribution)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Node.js**: Version 16 or higher
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm**: Version 7 or higher (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git**: For cloning the repository
   - Download from [git-scm.com](https://git-scm.com/)

### Platform-Specific Requirements

#### macOS
- macOS 10.13 (High Sierra) or later
- Xcode Command Line Tools (for native modules)
  ```bash
  xcode-select --install
  ```

#### Windows
- Windows 10 or later
- Visual Studio Build Tools (for native modules)
  - Download from [Visual Studio](https://visualstudio.microsoft.com/downloads/)

#### Linux
- Ubuntu 18.04+ / Debian 10+ / Fedora 30+ / or equivalent
- Build essentials:
  ```bash
  # Ubuntu/Debian
  sudo apt-get install build-essential
  
  # Fedora
  sudo dnf install @development-tools
  ```

## Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Fusion-data-electron-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:
- Electron and Electron Forge
- Webpack and loaders
- Jest and testing utilities
- React (for future enhancements)

### 3. Verify Installation

Run the build verification script to ensure everything is set up correctly:

```bash
npm run test:build:verify
```

You should see all checks passing.

## Running in Development

### Start Development Server

```bash
npm start
```

This command:
1. Compiles the code using Webpack
2. Starts Electron in development mode
3. Opens the application window
4. Watches for file changes and hot-reloads

### Development Features

- **Hot Reload**: Code changes automatically reload the application
- **Source Maps**: Full debugging support with source maps
- **Console Logging**: Check console for debug information
- **DevTools**: Can be enabled in `main.js` if needed

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Building for Production

### Build the Application

```bash
npm run package
```

This command:
1. Compiles and bundles the code
2. Creates platform-specific packages
3. Outputs to the `out/` directory

### Build Output

The build output will be in:
```
out/
├── Autodesk Fusion Data Client-<platform>-<arch>/
│   └── Autodesk Fusion Data Client.app (or .exe)
```

## Packaging for Distribution

### Create Distribution Packages

#### All Platforms
```bash
npm run make
```

#### Platform-Specific

**macOS:**
```bash
npm run make:mac
```

**Windows:**
```bash
npm run make:win
```

**Linux:**
```bash
npm run make:linux
```

**Linux RPM (Red Hat/Fedora):**
```bash
npm run make:rpm
```

### Package Formats

#### macOS
- **ZIP**: `out/make/zip/darwin/<arch>/Autodesk Fusion Data Client-darwin-<arch>-<version>.zip`
- **DMG**: (Requires additional configuration)

#### Windows
- **Squirrel**: `out/make/squirrel.windows/<arch>/Autodesk Fusion Data Client Setup <version>.exe`
- **ZIP**: `out/make/zip/win32/<arch>/Autodesk Fusion Data Client-win32-<arch>-<version>.zip`

#### Linux
- **DEB**: `out/make/deb/<arch>/autodesk-fusion-data-client_<version>_<arch>.deb`
- **RPM**: `out/make/rpm/<arch>/autodesk-fusion-data-client-<version>.<arch>.rpm`
- **ZIP**: `out/make/zip/linux/<arch>/Autodesk Fusion Data Client-linux-<arch>-<version>.zip`

## Platform-Specific Instructions

### macOS

#### Code Signing (Optional)

To sign the application for distribution:

1. Obtain an Apple Developer certificate
2. Update `forge.config.js` with signing configuration:
   ```javascript
   packagerConfig: {
     osxSign: {
       identity: 'Developer ID Application: Your Name'
     }
   }
   ```

#### Notarization (Optional)

For distribution outside the App Store:
1. Configure notarization in `forge.config.js`
2. Requires Apple Developer account

### Windows

#### Code Signing (Optional)

To sign the installer:

1. Obtain a code signing certificate
2. Update `forge.config.js`:
   ```javascript
   makers: [{
     name: '@electron-forge/maker-squirrel',
     config: {
       certificateFile: './path/to/certificate.pfx',
       certificatePassword: 'password'
     }
   }]
   ```

### Linux

#### Dependencies

Ensure required libraries are available:
```bash
# Ubuntu/Debian
sudo apt-get install libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libxss1 libasound2
```

## Build Configuration

### Webpack Configuration

Webpack configurations are in:
- `webpack.main.config.js` - Main process bundling
- `webpack.renderer.config.js` - Renderer process bundling
- `webpack.rules.js` - Shared webpack rules

### Electron Forge Configuration

Configuration is in `forge.config.js`:
- Packager settings
- Maker configurations
- Webpack plugin settings
- Fuses configuration

### Environment Variables

You can set environment variables for build customization:

```bash
# Development
NODE_ENV=development npm start

# Production
NODE_ENV=production npm run package
```

## Advanced Build Options

### Custom Build Directory

Modify `forge.config.js` to change output directory:

```javascript
packagerConfig: {
  out: './custom-output'
}
```

### Build for Specific Architecture

```bash
# macOS ARM64
npm run make:mac -- --arch arm64

# macOS x64
npm run make:mac -- --arch x64

# Universal (macOS)
npm run make:mac -- --arch universal
```

### Skip Code Signing

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false npm run make
```

## Testing the Build

### Verify Build

After building, test the packaged application:

1. **macOS**: Open the `.app` bundle
2. **Windows**: Run the installer or `.exe`
3. **Linux**: Install the package or extract the ZIP

### Test Checklist

- [ ] Application launches successfully
- [ ] Sidebar navigation works
- [ ] All navigation links load correctly
- [ ] Sidebar toggle functions properly
- [ ] Window resizing works correctly
- [ ] Services maintain authentication
- [ ] Custom URL schemes work (taska://kanban)

## Troubleshooting

### Common Issues

#### Build Fails with Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Webpack Build Errors

```bash
# Clear webpack cache
rm -rf .webpack
npm start
```

#### Native Module Compilation Errors

**macOS:**
```bash
xcode-select --install
```

**Windows:**
- Install Visual Studio Build Tools
- Ensure Python 2.7 or 3.x is available

**Linux:**
```bash
sudo apt-get install build-essential
```

#### Permission Errors (Linux)

```bash
# Make scripts executable
chmod +x node_modules/.bin/*
```

#### Port Already in Use

If the development server port is in use:
- Kill the process using the port
- Or modify the port in `forge.config.js`

### Debugging

#### Enable DevTools

In `src/main.js`, change:
```javascript
devTools: false,  // Change to true
```

#### Verbose Logging

Add console.log statements or use a debugger:
```bash
# macOS/Linux
DEBUG=* npm start

# Windows
set DEBUG=* && npm start
```

#### Check Build Output

Inspect the `.webpack/` directory for build artifacts:
```bash
ls -la .webpack/
```

### Getting Help

1. Check the [Test Documentation](../tests/README.md)
2. Review [Architecture Documentation](./ARCHITECTURE.md)
3. Check Electron Forge documentation
4. Review error messages in console output

## Continuous Integration

### GitHub Actions Example

```yaml
name: Build
on: [push, pull_request]
jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
      - run: npm run package
      - run: npm run make
```

## Distribution

### Preparing for Distribution

1. **Version Number**: Update version in `package.json`
2. **Code Signing**: Configure code signing certificates
3. **Release Notes**: Prepare release notes
4. **Testing**: Thoroughly test the build
5. **Packaging**: Create distribution packages

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md (if exists)
- [ ] Run full test suite
- [ ] Build for all target platforms
- [ ] Test on clean systems
- [ ] Code sign applications
- [ ] Create release notes
- [ ] Upload to distribution platform

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Forge Documentation](https://www.electronforge.io/)
- [Webpack Documentation](https://webpack.js.org/)
- [Node.js Documentation](https://nodejs.org/docs/)

