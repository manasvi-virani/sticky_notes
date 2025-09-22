import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Note, Position, Size, NoteColor } from "./types";
import { NOTE_COLORS } from "./types";
import { StickyNote } from "./components/stickyNotes/StickyNote";
import { Toolbar } from "./components/toolbar/Toolbar";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useApiStorage } from "./hooks/useApiStorage";
import styles from "./App.module.css";
import { TrashZone } from "./components/trashZone/TrashZone";
import DeleteButton from "./components/trashZone/DeleteButton";

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
    clearError,
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
    if (apiNotes.length > 0) {
      mergeServerNotes(apiNotes);
    }
  }, [apiNotes, mergeServerNotes]);

  const deleteAllNotes = useCallback(async () => {
    // Optimistically update UI immediately
    setNotes([]);
    try {
      await Promise.all(apiNotes.map(note => deleteNoteFromApi(note.id)));
    } catch (error) {
      console.error("Failed to delete all notes from API:", error)
    }

  }, [apiNotes, deleteNoteFromApi]);

  // Hydrate notes ONCE from API or local storage, don't keep overwriting
  useEffect(() => {
    if (hasHydratedRef.current) return;

    if (apiNotes.length > 0) {
      setNotes(apiNotes);
      const maxZ = Math.max(...apiNotes.map((note) => note.zIndex));
      setNextZIndex(maxZ + 1);
      hasHydratedRef.current = true;
      return;
    }

    if (savedNotes.length > 0) {
      setNotes(savedNotes);
      const maxZ = Math.max(...savedNotes.map((note) => note.zIndex));
      setNextZIndex(maxZ + 1);
      hasHydratedRef.current = true;
    }
  }, [apiNotes, savedNotes]);

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

    try {
      await saveNoteToApi(newNote);
    } catch (error) {
      console.error("Failed to save new note to API:", error);
      // Note: UI is already updated optimistically, so we don't revert
      // The error will be shown in the UI via apiError state
    }

  }, [selectedColor, nextZIndex, , saveNoteToApi]);

  const moveNote = useCallback(
    async (id: string, position: Position) => {
      // Update the note's position in the state
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, position } : note))
      );

      // Find the updated note
      const updatedNote = notes.find((note) => note.id === id);
      if (updatedNote) {
        const noteWithNewPosition = { ...updatedNote, position };

        // Save the updated note to the API if online

        try {
          await saveNoteToApi(noteWithNewPosition);
        } catch (error) {
          console.error("Failed to save moved note to API:", error);
        }


        // Always save to local storage as a fallback
        saveToLocal(notes.map((note) =>
          note.id === id ? noteWithNewPosition : note
        ));
      }
    },
    [, saveNoteToApi, saveToLocal, notes]
  );

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

      try {
        await deleteNoteFromApi(id);
      } catch (error) {
        console.error("Failed to delete note from API:", error);
      }

    },
    [deleteNoteFromApi]
  );

  const updateNoteText = useCallback(
    async (id: string, text: string) => {
      // Optimistically update UI immediately
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, text } : note))
      );

      const updatedNote = notes.find((note) => note.id === id);
      if (updatedNote) {
        try {
          await saveNoteToApi({ ...updatedNote, text });
        } catch (error) {
          console.error("Failed to save note text to API:", error);
        }
      }

    },
    [ saveNoteToApi, notes]
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
     
        try {
          await saveNoteToApi(newNote);
        } catch (error) {
          console.error("Failed to save new note to API:", error);
        }
      
    }
  };

  return (
    <div
      className={`${styles.canvas} ${isDraggingNote ? styles.grabbing : ""}`}
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
      <div className={styles.statusBar}>

        <button
          onClick={refreshFromServer}
          className={styles.refreshBtn}
          title="Refresh from server (preserves local positions)"
        >
          🔄
        </button>
        <button
          onClick={deleteAllNotes}
          className={styles.btnDeleteAll}
          title={"Delete All Notes"}
        >
          <DeleteButton size={18} color="#f44336" />
        </button>
        {apiError && (
          <>
            <span style={{ color: "#f44336" }}>❌</span>
            <button
              onClick={clearError}
              className={styles.clearBtn}
              title="Clear error"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {apiError && (
        <div className={styles.errorMsg}>
          {apiError}
        </div>
      )}

      <div className={styles.tips}>
        💡 <strong>Tips:</strong> Double-click canvas to create • Drag to move •
        Drag corner to resize • Drag to 🗑️ to delete
        <br />
      </div>
    </div>
  );
};

export default App;
