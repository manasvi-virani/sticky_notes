import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Note, Position, Size, NoteColor } from "./types";
import { NOTE_COLORS } from "./types";
import { StickyNote } from "./components/StickyNote";
import { Toolbar } from "./components/Toolbar";
import { TrashZone } from "./components/TrashZone";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useApiStorage } from "./hooks/useApiStorage";

const App: React.FC = () => {
  // Local storage integration for persistence (fallback)
  const { notes: savedNotes, saveNotes: saveToLocal } = useLocalStorage();

  // API storage integration for server persistence
  const {
    notes: apiNotes,
    saveNote: saveNoteToApi,
    deleteNote: deleteNoteFromApi,
    isLoading: apiLoading,
    error: apiError,
    isOnline,
    clearError,
    toggleOnlineMode,
  } = useApiStorage();

  // Application state
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedColor, setSelectedColor] = useState<NoteColor>(NOTE_COLORS[0]);
  const [nextZIndex, setNextZIndex] = useState(1); // Track highest z-index for layering

  // Track if we've already hydrated from storage to prevent constant overwrites
  const hasHydratedRef = useRef(false);

  // Merge server notes with local notes, preserving local position/size changes
  const mergeServerNotes = useCallback((serverNotes: Note[]) => {
    setNotes((prev) => {
      const byId = new Map(prev.map((n) => [n.id, n]));
      // For existing notes, preserve local position/size but take server text/color
      const merged = serverNotes.map((serverNote) => {
        const localNote = byId.get(serverNote.id);
        return localNote
          ? {
              ...serverNote,
              position: localNote.position,
              size: localNote.size,
              zIndex: localNote.zIndex,
            }
          : serverNote;
      });
      // Keep any local-only notes too
      const localOnly = prev.filter(
        (n) => !serverNotes.some((s) => s.id === n.id)
      );
      const result = [...merged, ...localOnly];
      const maxZ = result.length ? Math.max(...result.map((n) => n.zIndex)) : 0;
      setNextZIndex(maxZ + 1);
      return result;
    });
  }, []);

  // Manual refresh from server
  const refreshFromServer = useCallback(() => {
    if (isOnline && apiNotes.length > 0) {
      mergeServerNotes(apiNotes);
    }
  }, [isOnline, apiNotes, mergeServerNotes]);

  // Hydrate notes ONCE from API or local storage, don't keep overwriting
  useEffect(() => {
    if (hasHydratedRef.current) return;

    if (isOnline && apiNotes.length > 0) {
      setNotes(apiNotes);
      const maxZ = Math.max(...apiNotes.map((note) => note.zIndex));
      setNextZIndex(maxZ + 1);
      hasHydratedRef.current = true;
      return;
    }

    if (!isOnline && savedNotes.length > 0) {
      setNotes(savedNotes);
      const maxZ = Math.max(...savedNotes.map((note) => note.zIndex));
      setNextZIndex(maxZ + 1);
      hasHydratedRef.current = true;
    }
  }, [isOnline, apiNotes, savedNotes]);

  // Save to both local storage (always) and API (when online)
  useEffect(() => {
    // Always save to local storage as fallback
    saveToLocal(notes);
  }, [notes, saveToLocal]);

  /**
   * Create a new note with random positioning and selected color
   */
  const createNote = useCallback(async () => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        // Random position with padding from edges
        x: Math.random() * (window.innerWidth - 200) + 50,
        y: Math.random() * (window.innerHeight - 150) + 100,
      },
      size: { width: 200, height: 150 },
      text: "",
      color: selectedColor,
      zIndex: nextZIndex,
    };

    // Optimistically update UI immediately
    setNotes((prev) => [...prev, newNote]);
    setNextZIndex((prev) => prev + 1);

    // Try to save to API if online
    if (isOnline) {
      try {
        await saveNoteToApi(newNote);
      } catch (error) {
        console.error("Failed to save new note to API:", error);
        // Note: UI is already updated optimistically, so we don't revert
        // The error will be shown in the UI via apiError state
      }
    }
  }, [selectedColor, nextZIndex, isOnline, saveNoteToApi]);

  const moveNote = useCallback((id: string, position: Position) => {
    // Keep drag operations purely local - no API sync for position changes
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, position } : note))
    );
  }, []);

  const resizeNote = useCallback((id: string, size: Size) => {
    // Keep resize operations purely local - no API sync for size changes
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, size } : note))
    );
  }, []);

  const deleteNote = useCallback(
    async (id: string) => {
      // Optimistically update UI immediately
      setNotes((prev) => prev.filter((note) => note.id !== id));

      // Try to delete from API if online
      if (isOnline) {
        try {
          await deleteNoteFromApi(id);
        } catch (error) {
          console.error("Failed to delete note from API:", error);
          // Note: UI is already updated optimistically, so we don't revert
          // The error will be shown in the UI via apiError state
        }
      }
    },
    [isOnline, deleteNoteFromApi]
  );

  const updateNoteText = useCallback(
    async (id: string, text: string) => {
      // Optimistically update UI immediately
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, text } : note))
      );

      // Try to save to API if online
      if (isOnline) {
        const updatedNote = notes.find((note) => note.id === id);
        if (updatedNote) {
          try {
            await saveNoteToApi({ ...updatedNote, text });
          } catch (error) {
            console.error("Failed to save note text to API:", error);
            // Note: UI is already updated optimistically, so we don't revert
            // The error will be shown in the UI via apiError state
          }
        }
      }
    },
    [isOnline, saveNoteToApi, notes]
  );

  const bringToFront = useCallback(
    (id: string) => {
      // Keep z-index changes purely local - no API sync for layering
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, zIndex: nextZIndex } : note
        )
      );
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex]
  );

  const { startDrag, handleDrag, endDrag, trashZoneRef, isDraggingNote } =
    useDragAndDrop({
      onMove: moveNote,
      onResize: resizeNote,
      onDelete: deleteNote,
    });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      endDrag({ x: e.clientX, y: e.clientY });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle API test panel with Ctrl+T (or Cmd+T on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDrag, endDrag]);

  const handleCanvasClick = async (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && e.detail === 2) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: e.clientX - rect.left - 100,
          y: e.clientY - rect.top - 75,
        },
        size: { width: 200, height: 150 },
        text: "",
        color: selectedColor,
        zIndex: nextZIndex,
      };

      // Optimistically update UI immediately
      setNotes((prev) => [...prev, newNote]);
      setNextZIndex((prev) => prev + 1);

      // Try to save to API if online
      if (isOnline) {
        try {
          await saveNoteToApi(newNote);
        } catch (error) {
          console.error("Failed to save new note to API:", error);
          // Note: UI is already updated optimistically, so we don't revert
          // The error will be shown in the UI via apiError state
        }
      }
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        cursor: isDraggingNote ? "grabbing" : "default",
      }}
      onClick={handleCanvasClick}
    >
      <Toolbar
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        onCreateNote={createNote}
      />

      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onTextChange={updateNoteText}
          onBringToFront={bringToFront}
          onStartDrag={startDrag}
        />
      ))}

      <TrashZone ref={trashZoneRef} isActive={isDraggingNote} />

      {/* API Status Bar */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          fontSize: "12px",
          backgroundColor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          maxWidth: "300px",
        }}
      >
        <button
          onClick={toggleOnlineMode}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            padding: "2px",
          }}
          title={`Click to switch to ${isOnline ? "offline" : "online"} mode`}
        >
          {isOnline ? "🌐" : "📴"}
        </button>

        <span style={{ color: isOnline ? "#4CAF50" : "#FF9800" }}>
          {isOnline ? "Online" : "Offline"}
        </span>

        {apiLoading && <span>⏳</span>}

        {isOnline && (
          <button
            onClick={refreshFromServer}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              padding: "2px",
              color: "#4CAF50",
            }}
            title="Refresh from server (preserves local positions)"
          >
            🔄
          </button>
        )}

        {apiError && (
          <>
            <span style={{ color: "#f44336" }}>❌</span>
            <button
              onClick={clearError}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "10px",
                color: "#666",
                textDecoration: "underline",
              }}
              title="Clear error"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {apiError && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            right: "20px",
            fontSize: "11px",
            color: "#f44336",
            backgroundColor: "rgba(255,235,238,0.95)",
            backdropFilter: "blur(10px)",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid rgba(244,67,54,0.3)",
            boxShadow: "0 2px 8px rgba(244,67,54,0.1)",
            maxWidth: "300px",
            lineHeight: "1.3",
          }}
        >
          {apiError}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          fontSize: "12px",
          color: "#555",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          lineHeight: "1.4",
        }}
      >
        💡 <strong>Tips:</strong> Double-click canvas to create • Drag to move •
        Drag corner to resize • Drag to 🗑️ to delete
        <br />
      </div>
    </div>
  );
};

export default App;
