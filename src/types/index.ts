export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Note {
  id: string;
  position: Position;
  size: Size;
  text: string;
  color: NoteColor;
  zIndex: number;
}

export interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize' | null;
  startPosition: Position;
  startSize?: Size;
  offset: Position;
}

export type NoteColor = '#FFE066' | '#FF6B6B' | '#4ECDC4' | '#45B7D1' | '#96CEB4' | '#FFEAA7';

// Freeze the array to prevent mutation and improve performance
export const NOTE_COLORS: readonly NoteColor[] = Object.freeze([
  '#FFE066',
  '#FF6B6B', 
  '#4ECDC4',
  '#45B7D1', 
  '#96CEB4', 
  '#FFEAA7'  
]);
