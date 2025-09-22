import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';
import { mockApi, ApiError } from '../services/mockApi';

interface ApiStorageState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
}

interface UseApiStorageReturn extends ApiStorageState {
  saveNote: (note: Note) => Promise<void>;
  saveNotes: (notes: Note[]) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  deleteNotes: (noteIds: string[]) => Promise<void>;
  clearError: () => void;
  retry: () => Promise<void>;
}

export const useApiStorage = (): UseApiStorageReturn => {
  const [state, setState] = useState<ApiStorageState>({
    notes: [],
    isLoading: false,
    error: null,
  });

  // Load notes from API on mount
  const loadNotes = useCallback(async () => {


    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const notes = await mockApi.getNotes();
      setState(prev => ({
        ...prev,
        notes,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to load notes from server';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      console.error('Failed to load notes:', error);
    }
  }, []);

  // Initialize by loading notes
  useEffect(() => {
    loadNotes();

  }, []);

  // Save a single note
  const saveNote = useCallback(async (note: Note) => {


    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mockApi.saveNote(note);

      // Update local state optimistically
      setState(prev => ({
        ...prev,
        notes: prev.notes.some(n => n.id === note.id)
          ? prev.notes.map(n => n.id === note.id ? note : n)
          : [...prev.notes, note],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to save note to server';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      console.error('Failed to save note:', error);
      throw error; // Re-throw so caller can handle
    }
  }, []);

  // Save multiple notes (bulk operation)
  const saveNotes = useCallback(async (notes: Note[]) => {
   

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mockApi.saveNotes(notes);

      setState(prev => ({
        ...prev,
        notes: [...notes],
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to save notes to server';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      console.error('Failed to save notes:', error);
      throw error;
    }
  }, []);

  // Delete a single note
  const deleteNote = useCallback(async (noteId: string) => {


    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mockApi.deleteNote(noteId);

      // Update local state optimistically
      setState(prev => ({
        ...prev,
        notes: prev.notes.filter(note => note.id !== noteId),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to delete note from server';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      console.error('Failed to delete note:', error);
      throw error;
    }
  }, []);

  // Delete multiple notes
  const deleteNotes = useCallback(async (noteIds: string[]) => {


    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await mockApi.deleteNotes(noteIds);

      setState(prev => ({
        ...prev,
        notes: prev.notes.filter(note => !noteIds.includes(note.id)),
        isLoading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to delete notes from server';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      console.error('Failed to delete notes:', error);
      throw error;
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Retry last operation (reload notes)
  const retry = useCallback(async () => {
    await loadNotes();
  }, [loadNotes]);


  return {
    ...state,
    saveNote,
    saveNotes,
    deleteNote,
    deleteNotes,
    clearError,
    retry,
  };
};
