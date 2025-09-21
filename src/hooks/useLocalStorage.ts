import { useState, useEffect } from 'react';
import type { Note } from '../types';

const STORAGE_KEY = 'sticky-notes';

export const useLocalStorage = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(STORAGE_KEY);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
    }
  }, []);

  const saveNotes = (notesToSave: Note[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notesToSave));
      setNotes(notesToSave);
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  };

  return { notes, saveNotes };
};
