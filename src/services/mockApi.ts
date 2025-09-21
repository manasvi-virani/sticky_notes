import type { Note } from '../types';

// Mock API configuration
const API_CONFIG = {
  baseUrl: 'http://localhost:3001/api',
  delay: 300, // Simulate network delay (reduced for better UX)
  errorRate: 0, // 0% chance of error (disabled for smooth testing)
};

// In-memory storage for the mock API
let mockDatabase: Note[] = [];

// Utility function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to simulate random errors
const shouldSimulateError = () => Math.random() < API_CONFIG.errorRate;

// Mock API error class
export class ApiError extends Error {
  public status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Mock API service
export const mockApi = {
  // Get all notes
  async getNotes(): Promise<Note[]> {
    await delay(API_CONFIG.delay);
    
    if (shouldSimulateError()) {
      throw new ApiError(500, 'Failed to fetch notes from server');
    }
    
    console.log('📡 Mock API: Fetching notes', mockDatabase.length);
    return [...mockDatabase];
  },

  // Save a single note (create or update)
  async saveNote(note: Note): Promise<Note> {
    await delay(API_CONFIG.delay);
    
    if (shouldSimulateError()) {
      throw new ApiError(500, 'Failed to save note to server');
    }
    
    const existingIndex = mockDatabase.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      // Update existing note
      mockDatabase[existingIndex] = { ...note };
      console.log('📡 Mock API: Updated note', note.id);
    } else {
      // Create new note
      mockDatabase.push({ ...note });
      console.log('📡 Mock API: Created note', note.id);
    }
    
    return { ...note };
  },

  // Save multiple notes (bulk operation)
  async saveNotes(notes: Note[]): Promise<Note[]> {
    await delay(API_CONFIG.delay);
    
    if (shouldSimulateError()) {
      throw new ApiError(500, 'Failed to save notes to server');
    }
    
    // Replace entire database with new notes
    mockDatabase = notes.map(note => ({ ...note }));
    console.log('📡 Mock API: Bulk saved notes', notes.length);
    
    return [...mockDatabase];
  },

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    await delay(API_CONFIG.delay);
    
    if (shouldSimulateError()) {
      throw new ApiError(404, 'Note not found or failed to delete');
    }
    
    const initialLength = mockDatabase.length;
    mockDatabase = mockDatabase.filter(note => note.id !== noteId);
    
    if (mockDatabase.length === initialLength) {
      throw new ApiError(404, 'Note not found');
    }
    
    console.log('📡 Mock API: Deleted note', noteId);
  },

  // Delete multiple notes
  async deleteNotes(noteIds: string[]): Promise<void> {
    await delay(API_CONFIG.delay);
    
    if (shouldSimulateError()) {
      throw new ApiError(500, 'Failed to delete notes from server');
    }
    
    mockDatabase = mockDatabase.filter(note => !noteIds.includes(note.id));
    console.log('📡 Mock API: Bulk deleted notes', noteIds.length);
  },

  // Utility methods for testing
  async clearAll(): Promise<void> {
    await delay(200);
    mockDatabase = [];
    console.log('📡 Mock API: Cleared all notes');
  },

  // Get current database state (for debugging)
  getDbState(): Note[] {
    return [...mockDatabase];
  },

  // Configure API behavior
  configure(config: Partial<typeof API_CONFIG>) {
    Object.assign(API_CONFIG, config);
    console.log('📡 Mock API: Configuration updated', API_CONFIG);
  }
};

// Export configuration for external access
export { API_CONFIG };
