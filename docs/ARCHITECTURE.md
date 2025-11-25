# Architecture Documentation

This document describes the architecture of the Autodesk Fusion Data Client using the C4 model and other architectural diagrams.

## Table of Contents

- [System Context](#system-context)
- [Container Diagram](#container-diagram)
- [Component Diagram](#component-diagram)
- [Process Communication](#process-communication)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)

## System Context

The System Context diagram shows the Autodesk Fusion Data Client and its relationships with external systems and users.

```mermaid
C4Context
    title System Context - Autodesk Fusion Data Client
    
    Person(user, "User", "Uses the application to access Fusion 360 services")
    
    System(fusionClient, "Autodesk Fusion Data Client", "Desktop application providing unified access to Fusion 360 services")
    
    System_Ext(fusion360, "Fusion 360 Services", "Various Autodesk Fusion 360 web services")
    System_Ext(autodesk360, "Autodesk 360", "Cloud-based collaboration platform")
    System_Ext(fusionNomad, "Fusion Nomad", "Mobile/web design interface")
    System_Ext(plm360, "PLM 360", "Product lifecycle management")
    System_Ext(machineConnect, "Machine Connect", "Manufacturing connectivity platform")
    System_Ext(rendering, "Rendering Service", "Cloud rendering service")
    
    Rel(user, fusionClient, "Uses", "Desktop UI")
    Rel(fusionClient, fusion360, "Accesses", "HTTPS")
    Rel(fusionClient, autodesk360, "Accesses", "HTTPS")
    Rel(fusionClient, fusionNomad, "Accesses", "HTTPS")
    Rel(fusionClient, plm360, "Accesses", "HTTPS")
    Rel(fusionClient, machineConnect, "Accesses", "HTTPS")
    Rel(fusionClient, rendering, "Accesses", "HTTPS")
```

## Container Diagram

The Container diagram shows the high-level technical building blocks of the application.

```mermaid
C4Container
    title Container Diagram - Autodesk Fusion Data Client
    
    Person(user, "User")
    
    Container_Boundary(electronApp, "Autodesk Fusion Data Client") {
        Container(mainProcess, "Main Process", "Node.js", "Manages application lifecycle, windows, and IPC")
        Container(rendererProcess, "Renderer Process", "Chromium", "Handles UI rendering and user interactions")
        Container(preloadScript, "Preload Script", "JavaScript", "Secure bridge between renderer and main process")
        Container(webpack, "Webpack", "Build Tool", "Bundles and transpiles code")
    }
    
    System_Ext(fusionServices, "Fusion 360 Services", "External web services")
    SystemDb(localStorage, "Local Storage", "File System", "Stores session data and preferences")
    
    Rel(user, rendererProcess, "Interacts with", "UI")
    Rel(rendererProcess, preloadScript, "Uses", "Context Bridge API")
    Rel(preloadScript, mainProcess, "Communicates via", "IPC")
    Rel(mainProcess, fusionServices, "Loads", "BrowserView")
    Rel(mainProcess, localStorage, "Reads/Writes", "Session data")
    Rel(webpack, mainProcess, "Bundles", "Code")
    Rel(webpack, rendererProcess, "Bundles", "Code")
```

## Component Diagram - Main Process

This diagram shows the components within the main process.

```mermaid
graph TB
    subgraph "Main Process Components"
        AppLifecycle[App Lifecycle Manager<br/>Handles app events]
        WindowManager[Window Manager<br/>Creates and manages windows]
        ViewManager[BrowserView Manager<br/>Manages BrowserView instances]
        IPCManager[IPC Manager<br/>Handles IPC communication]
        URLResolver[URL Resolver<br/>Resolves custom URL schemes]
        SidebarController[Sidebar Controller<br/>Manages sidebar state]
    end
    
    subgraph "Electron APIs"
        BrowserWindow[BrowserWindow API]
        BrowserView[BrowserView API]
        IPC[IPC Main API]
        App[App API]
    end
    
    AppLifecycle --> App
    WindowManager --> BrowserWindow
    ViewManager --> BrowserView
    IPCManager --> IPC
    ViewManager --> URLResolver
    IPCManager --> SidebarController
    SidebarController --> ViewManager
```

## Component Diagram - Renderer Process

This diagram shows the components within the renderer process.

```mermaid
graph TB
    subgraph "Renderer Process Components"
        SidebarUI[Sidebar UI<br/>Navigation sidebar]
        MenuButton[Menu Button<br/>Toggle sidebar]
        NavLinks[Navigation Links<br/>Service links]
        IconManager[Icon Manager<br/>Manages nerdfont icons]
        EventHandler[Event Handler<br/>User interactions]
    end
    
    subgraph "APIs"
        ElectronAPI[electronAPI<br/>via contextBridge]
        DOM[DOM API]
    end
    
    SidebarUI --> MenuButton
    SidebarUI --> NavLinks
    MenuButton --> IconManager
    NavLinks --> EventHandler
    EventHandler --> ElectronAPI
    SidebarUI --> DOM
```

## Process Communication

This diagram illustrates how the three Electron processes communicate.

```mermaid
sequenceDiagram
    participant User
    participant Renderer as Renderer Process
    participant Preload as Preload Script
    participant Main as Main Process
    participant BrowserView
    
    User->>Renderer: Clicks navigation link
    Renderer->>Preload: Calls electronAPI.loadUrl(url)
    Preload->>Main: Sends IPC 'load-url' message
    Main->>Main: Resolves URL (if custom scheme)
    Main->>BrowserView: Creates/Shows BrowserView
    BrowserView->>BrowserView: Loads URL
    BrowserView-->>User: Displays content
    
    User->>Renderer: Toggles sidebar
    Renderer->>Preload: Calls electronAPI.sidebarToggle(isOpen)
    Preload->>Main: Sends IPC 'sidebar-toggle' message
    Main->>Main: Updates sidebarOpen state
    Main->>BrowserView: Updates BrowserView bounds
    BrowserView-->>User: Content resizes
```

## Data Flow

This diagram shows the flow of data through the application.

```mermaid
flowchart LR
    subgraph "User Input"
        Click[User Click]
        Toggle[Sidebar Toggle]
    end
    
    subgraph "Renderer Process"
        Event[Event Handler]
        API[electronAPI]
    end
    
    subgraph "Preload Script"
        Bridge[Context Bridge]
        IPC_Send[IPC Send]
    end
    
    subgraph "Main Process"
        IPC_Handler[IPC Handler]
        ViewMgr[View Manager]
        State[State Manager]
    end
    
    subgraph "Output"
        BrowserView[BrowserView]
        UI[UI Update]
    end
    
    Click --> Event
    Toggle --> Event
    Event --> API
    API --> Bridge
    Bridge --> IPC_Send
    IPC_Send --> IPC_Handler
    IPC_Handler --> ViewMgr
    IPC_Handler --> State
    ViewMgr --> BrowserView
    State --> UI
    BrowserView --> UI
```

## Security Architecture

This diagram shows the security boundaries and isolation mechanisms.

```mermaid
graph TB
    subgraph "Security Boundaries"
        subgraph "Main Process - Privileged"
            Main[Main Process<br/>Full Node.js Access]
        end
        
        subgraph "Preload Script - Bridge"
            Preload[Preload Script<br/>Limited API Exposure]
        end
        
        subgraph "Renderer Process - Isolated"
            Renderer[Renderer Process<br/>No Node.js Access]
        end
        
        subgraph "BrowserView - Isolated"
            BrowserView[BrowserView<br/>Web Content]
        end
    end
    
    Main -->|Context Isolation| Preload
    Preload -->|Context Bridge API| Renderer
    Renderer -->|No Direct Access| Main
    Main -->|Isolated Web Content| BrowserView
    
    style Main fill:#ffcccc
    style Preload fill:#ffffcc
    style Renderer fill:#ccffcc
    style BrowserView fill:#ccccff
```

## Architecture Decisions

### 1. Process Separation

**Decision**: Use Electron's multi-process architecture with clear separation between main, renderer, and preload processes.

**Rationale**: 
- Security: Isolates privileged code from web content
- Performance: Separate processes prevent one from blocking others
- Maintainability: Clear boundaries make code easier to understand

### 2. Context Isolation

**Decision**: Enable context isolation and use contextBridge for secure IPC.

**Rationale**:
- Security: Prevents renderer from accessing Node.js APIs directly
- Best Practice: Recommended by Electron security guidelines
- Maintainability: Clear API surface between processes

### 3. BrowserView Management

**Decision**: Use BrowserView instances for each service URL instead of iframes or navigation.

**Rationale**:
- Performance: Better isolation and performance than iframes
- Session Management: Each view can have its own session partition
- User Experience: Seamless switching between services

### 4. Custom URL Schemes

**Decision**: Support custom URL schemes (e.g., `taska://kanban`) for local file access.

**Rationale**:
- Flexibility: Allows local HTML files to be integrated seamlessly
- User Experience: Consistent navigation experience
- Extensibility: Easy to add new local views

### 5. Session Persistence

**Decision**: Use persistent session partition for all BrowserViews.

**Rationale**:
- User Experience: Maintains authentication across all services
- Convenience: Users don't need to re-authenticate
- Security: Session data stored securely by Electron

## Technology Stack

- **Electron**: Desktop application framework
- **Node.js**: Runtime for main process
- **Chromium**: Rendering engine for UI
- **Webpack**: Module bundling and code splitting
- **Jest**: Testing framework
- **Electron Forge**: Build and packaging tool

## Scalability Considerations

- **Memory Management**: BrowserViews are created on-demand and can be destroyed when not in use
- **Performance**: Background throttling disabled for responsive UI
- **Extensibility**: Easy to add new navigation items and services
- **Cross-Platform**: Single codebase supports macOS, Windows, and Linux

## Future Enhancements

- Plugin system for custom integrations
- Offline mode support
- Enhanced caching strategies
- Multi-window support
- Custom themes and branding

