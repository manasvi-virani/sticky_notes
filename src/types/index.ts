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
  color: string;
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

export const NOTE_COLORS: NoteColor[] = [
  '#FFE066', // Yellow
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7'  // Light Yellow
];
