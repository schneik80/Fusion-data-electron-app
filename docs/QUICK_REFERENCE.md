# Quick Reference Guide

A quick reference for common tasks and information about the Autodesk Fusion Data Client.

## Quick Start

```bash
# Install dependencies
npm install

# Start development
npm start

# Run tests
npm test

# Build for production
npm run package

# Create distribution packages
npm run make
```

## Documentation Links

- **[Main Documentation](./README.md)** - Overview and table of contents
- **[Architecture](./ARCHITECTURE.md)** - System architecture and C4 diagrams
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Project organization
- **[Capabilities](./CAPABILITIES.md)** - Features and functionality
- **[Build and Run](./BUILD_AND_RUN.md)** - Build instructions
- **[Test Documentation](../tests/README.md)** - Testing guide

## Common Commands

### Development
```bash
npm start              # Start development server
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
```

### Building
```bash
npm run package        # Build application
npm run make           # Create distribution packages
npm run make:mac       # Build for macOS
npm run make:win       # Build for Windows
npm run make:linux     # Build for Linux
```

### Verification
```bash
npm run test:build:verify  # Verify build configuration
```

## Project Structure

```
docs/          # Documentation
src/           # Source code
  main.js      # Main process
  renderer.js  # Renderer process
  preload.js   # Preload script
tests/         # Test suite
```

## Key Files

- `package.json` - Project configuration
- `forge.config.js` - Electron Forge configuration
- `webpack.*.config.js` - Webpack configurations
- `jest.config.js` - Jest test configuration

## Architecture Overview

- **Main Process**: Manages windows, IPC, and BrowserViews
- **Renderer Process**: Handles UI and user interactions
- **Preload Script**: Secure bridge between processes
- **BrowserViews**: Isolated web content views

## Navigation Services

- Home - Fusion 360 Overview
- Design - Fusion Nomad
- Projects - Autodesk 360 Projects
- Process - PLM 360
- Machine Connect - Manufacturing
- Renderings - Cloud Rendering
- Tasks - Local Kanban (taska://kanban)
- Profile - User Profile

## Technology Stack

- Electron 39.0.0
- React 19.2.0
- Webpack (via Electron Forge)
- Jest (testing)

## Support

For issues or questions:
1. Check the relevant documentation
2. Review [Test Documentation](../tests/README.md)
3. Check console logs for errors
4. Review [Architecture Documentation](./ARCHITECTURE.md)

## Version

- **Version**: 1.0.0
- **License**: MIT
- **Author**: Kevin Schneider

