# Autodesk Fusion Data Client - Documentation

Welcome to the Autodesk Fusion Data Client documentation. This Electron-based desktop application provides a unified interface for accessing various Autodesk Fusion 360 services and tools.

## Table of Contents

- [Autodesk Fusion Data Client - Documentation](#autodesk-fusion-data-client---documentation)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Features](#key-features)
  - [Project Structure](#project-structure)
  - [Architecture](#architecture)
  - [Capabilities](#capabilities)
  - [Building and Running](#building-and-running)
  - [Testing](#testing)
    - [Quick Test Commands](#quick-test-commands)
  - [Development](#development)
    - [Prerequisites](#prerequisites)
    - [Getting Started](#getting-started)
    - [Technology Stack](#technology-stack)
    - [Project Information](#project-information)
  - [Additional Resources](#additional-resources)

## Overview

The Autodesk Fusion Data Client is a cross-platform desktop application built with Electron that serves as a centralized hub for accessing Autodesk Fusion 360 services. It provides a sidebar navigation interface that allows users to quickly switch between different Fusion 360 tools and services without leaving the application.

### Key Features

- **Unified Interface**: Single application for accessing multiple Fusion 360 services
- **Persistent Sessions**: Maintains authentication across all services
- **Custom URL Schemes**: Support for local file-based views (e.g., Kanban board)
- **Responsive Sidebar**: Collapsible navigation sidebar with icon-based navigation
- **Cross-Platform**: Supports macOS, Windows, and Linux

## Project Structure

See [Project Structure Documentation](./PROJECT_STRUCTURE.md) for detailed information about the project organization.

## Architecture

See [Architecture Documentation](./ARCHITECTURE.md) for comprehensive architecture diagrams and system design details, including C4 model diagrams.

## Capabilities

See [Capabilities Documentation](./CAPABILITIES.md) for detailed information about application features and functionality.

## Building and Running

See [Build and Run Instructions](./BUILD_AND_RUN.md) for step-by-step instructions on building, running, and packaging the application.

## Testing

See [Test Documentation](../tests/README.md) for comprehensive information about the test suite, running tests, and test coverage.

The test suite includes:

- **Unit Tests**: Tests for main, renderer, and preload processes
- **Integration Tests**: End-to-end functionality tests
- **Build Verification**: Automated build and configuration checks
- **Coverage Reports**: Code coverage analysis

For detailed test documentation, see: [tests/README.md](../tests/README.md)

### Quick Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run build verification
npm run test:build:verify
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Git

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm start`
4. Run tests: `npm test`

### Technology Stack

- **Electron**: 39.0.0 - Desktop application framework
- **React**: 19.2.0 - UI library (for future enhancements)
- **Webpack**: Via Electron Forge - Module bundling
- **Jest**: Testing framework
- **Electron Forge**: Build and packaging tool

### Project Information

- **Product Name**: Autodesk Fusion Data Client
- **Version**: 1.0.0
- **License**: MIT
- **Author**: Kevin Schneider

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Forge Documentation](https://www.electronforge.io/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
