# Architecture Description

## Overview

The sticky notes application is built using React with TypeScript and Vite, following a component-based architecture that emphasizes separation of concerns, type safety, and performance. The application implements a drag-and-drop system for managing sticky notes on a canvas-like interface with modern development tooling.

## Core Architecture

The application follows a hierarchical component structure with the main `App` component serving as the state container and orchestrator. State management is handled through React hooks, with custom hooks encapsulating complex logic for drag-and-drop operations and local storage persistence. The drag system uses a combination of mouse event handlers and ref-based DOM manipulation to provide smooth interactions without relying on external libraries. Vite provides fast development experience with instant hot module replacement and optimized production builds.

## Key Design Decisions

The drag-and-drop functionality is implemented using a custom hook (`useDragAndDrop`) that manages drag state and coordinates between different interaction types (move, resize, delete). This approach provides fine-grained control over the user experience while maintaining clean separation between UI components and business logic. 

Data persistence is handled through a dual-layer approach: local storage (`useLocalStorage`) provides functionality and serves as a fallback, while the REST API integration (`useApiStorage`) enables server synchronization with optimistic updates. The mock API service simulates realistic network conditions with configurable delays and error rates, providing a comprehensive testing environment for async operations.

The component architecture ensures that each note is an independent entity with its own state for text editing, while global operations like z-index management and note creation are handled at the application level. The application supports API-enabled modes. TypeScript provides compile-time type safety with strict import/export patterns required by Vite's build system.

## Performance Considerations

The application uses React's built-in optimization patterns, including useCallback for event handlers to prevent unnecessary re-renders, and strategic state updates to minimize DOM manipulation during drag operations. The note rendering system uses absolute positioning for optimal performance during frequent position updates, and the trash zone detection uses efficient bounding box calculations rather than complex geometric operations. Vite's build system provides tree-shaking, code splitting, and modern JavaScript output for optimal bundle size and loading performance.