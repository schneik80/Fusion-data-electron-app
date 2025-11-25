# Test Suite

This directory contains the test suite for the Autodesk Fusion Data Client Electron application.

## Test Structure

- **`setup.js`** - Jest setup file that mocks Electron APIs
- **`build-verify.js`** - Build verification script (can be run standalone)
- **`main.test.js`** - Tests for main process functionality
- **`preload.test.js`** - Tests for preload script
- **`renderer.test.js`** - Tests for renderer process (DOM manipulation)
- **`integration.test.js`** - Integration tests for file structure and configuration

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run build verification only
```bash
npm run test:build:verify
```

### Run build verification with full build test
```bash
node tests/build-verify.js --full-build
```

## Test Coverage

The test suite covers:

1. **Build Verification**
   - Project structure validation
   - Dependency checking
   - Webpack configuration validation
   - Electron Forge configuration validation
   - Source file syntax checking
   - Optional full build test

2. **Unit Tests**
   - Main process IPC handlers
   - Preload script API exposure
   - Renderer process DOM manipulation
   - Sidebar toggle functionality
   - Menu icon changes

3. **Integration Tests**
   - File dependencies
   - Package configuration
   - Webpack configuration
   - Forge configuration
   - Navigation icons

## Writing New Tests

When adding new functionality, add corresponding tests:

1. **Unit tests** go in `tests/[component].test.js`
2. **Integration tests** go in `tests/integration.test.js`
3. Update this README if adding new test categories

## Test Environment

Tests use Jest with:
- Node environment (for main process tests)
- Electron mocks (via `setup.js`)
- DOM mocks (for renderer tests)

## Continuous Integration

These tests are designed to run in CI/CD pipelines. The build verification script can be used to ensure the project builds successfully before deployment.

