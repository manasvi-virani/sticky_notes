# Sticky Notes Application

A modern React TypeScript application for creating and managing sticky notes with drag-and-drop functionality, built with Vite for optimal performance.

## Features

### Core Features (All 4 implemented)
1. **Create Notes** - Click "New Note" button or double-click on canvas to create notes at specific positions
2. **Resize Notes** - Drag the resize handle in the bottom-right corner of any note
3. **Move Notes** - Drag notes around the canvas by clicking and dragging the note body
4. **Delete Notes** - Drag notes to the trash zone in the bottom-right corner

### Bonus Features
- **Text Editing** - Double-click any note to edit its text content
- **Bring to Front** - Click on any note to bring it to the front (z-index management)
- **Local Storage** - Notes are automatically saved and restored between sessions
- **Color Selection** - Choose from 6 different note colors using the toolbar
- **REST API Integration** - Mock API with async operations, loading states, and error handling
- **Visual Feedback** - Hover effects, active states, and smooth transitions

## Getting Started

### Prerequisites
- Node.js (version 22 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) to view the application in your browser.

### Configuration

By default, the application runs in API mode with mock REST API functionality. To switch to local-only mode:

1. Edit `src/main.tsx`
2. Change `const USE_API = true;` to `const USE_API = false;`
3. Restart the development server

**API Mode Features:**
- Mock REST API with realistic network delays (200-800ms)
- 5% error simulation for testing error handling
- Complete CRUD operations (Create, Read, Update, Delete)
- Bulk sync operations
- Optimistic updates with rollback on failure
- Debounced drag operations (300ms) for smooth performance
- Silent API updates during drag operations to prevent loading interference

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Basic Operations
- **Create a note**: Click the "New Note" button in the toolbar or double-click anywhere on the canvas
- **Move a note**: Click and drag the note body to move it around
- **Resize a note**: Drag the small triangle handle in the bottom-right corner
- **Edit text**: Double-click on a note to start editing, press Enter to save or Escape to cancel
- **Change color**: Select a color from the toolbar before creating new notes
- **Delete a note**: Drag it to the trash can icon in the bottom-right corner
- **Bring to front**: Click on any note to bring it above others

### API Mode (NEW!)
The application now supports two storage modes:

1. **Local Storage Mode** (💾 Local) - Notes saved locally in browser
2. **API Mode** (🌐 API) - Notes synchronized with mock REST API

**API Features:**
- **Toggle Mode**: Click the 🌐 API / 💾 Local button to switch storage modes
- **Auto-sync**: Notes automatically sync with the server in API mode
- **Manual Sync**: Click the 🔄 Sync button to force synchronization
- **Loading States**: Visual feedback during API operations (non-blocking for drag operations)
- **Error Handling**: Automatic error notifications with retry options
- **Optimistic Updates**: Immediate UI updates with background server sync
- **Smooth Drag Performance**: Debounced API calls prevent loading interference during drag operations

**API Status Indicators:**
- ✅ Synced - Last successful sync time
- 🔄 Syncing - Operation in progress
- ❌ API Error - Connection or server issues
- 🌐 API Ready - Connected and ready

## Browser Support

- Google Chrome (latest) - Windows and Mac
- Mozilla Firefox (latest) - All platforms  
- Microsoft Edge (latest)

Minimum screen resolution: 1024x768

## Technical Details

Built with:
- **React 19** - Latest React with hooks and optimizations
- **TypeScript** - Strict typing throughout
- **Vite** - Fast build tool and dev server
- **Custom drag-and-drop** - No external libraries
- **Dual storage** - Local storage + REST API integration
- **Mock API** - Comprehensive async operations simulation
- **CSS animations** - Smooth transitions and effects

### Performance
- **Fast development** - Vite's instant HMR
- **Optimized build** - 63.95 kB gzipped bundle (includes API functionality)
- **Efficient rendering** - useCallback + React.memo optimizations
- **Smooth animations** - Hardware-accelerated CSS transforms
- **API optimizations** - Optimistic updates and error recovery
- **Drag performance** - Debounced API calls prevent loading interference during drag operations

## Architecture

The application follows a modern React architecture with:
- **Custom hooks** for drag-and-drop and storage logic
- **TypeScript interfaces** for type safety
- **Component composition** for reusability
- **Efficient state management** with React hooks
- **Performance optimizations** throughout

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── StickyNote.tsx  # Individual note component
│   ├── Toolbar.tsx     # Color picker and controls
│   └── TrashZone.tsx   # Delete zone component
├── hooks/              # Custom React hooks
│   ├── useDragAndDrop.ts  # Drag-and-drop logic
│   ├── useLocalStorage.ts # Local persistence logic
│   └── useApiStorage.ts   # REST API integration
├── services/           # External services
│   └── mockApi.ts      # Mock REST API implementation
├── types/              # TypeScript definitions
│   └── index.ts        # All type definitions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and animations
```

### Key Features
- **Type-safe imports** - Proper TypeScript module syntax
- **Modern CSS** - Glassmorphism effects and smooth animations
- **Accessibility** - Keyboard navigation and screen reader support
- **Error handling** - Graceful fallbacks for storage operations
- **Cross-browser** - Compatible with all modern browsers