import { useState, useCallback, useRef } from 'react';
import type { Position, Size, DragState } from '../types';

interface UseDragAndDropProps {
  onMove: (id: string, position: Position) => void;
  onResize: (id: string, size: Size) => void;
  onDelete: (id: string) => void;
  onDragStart?: (id: string, dragType: 'move' | 'resize') => void;
  onDragEnd?: (id: string, dragType: 'move' | 'resize') => void;
}

/**
 * Custom hook for managing drag-and-drop operations for sticky notes
 * Handles both moving and resizing notes, plus trash zone deletion
 */
export const useDragAndDrop = ({ onMove, onResize, onDelete, onDragStart, onDragEnd }: UseDragAndDropProps) => {
  // Track current drag operation state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    startPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 }
  });

  // Store which note is being dragged and reference to trash zone
  const draggedNoteId = useRef<string | null>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize drag operation with mouse offset calculation
   * The offset ensures smooth dragging from any point on the note
   */
  const startDrag = useCallback((
    noteId: string,
    dragType: 'move' | 'resize',
    clientPosition: Position,
    notePosition: Position,
    noteSize?: Size
  ) => {
    draggedNoteId.current = noteId;
    setDragState({
      isDragging: true,
      dragType,
      startPosition: notePosition,
      startSize: noteSize,
      // Calculate offset to maintain relative mouse position during drag
      offset: {
        x: clientPosition.x - notePosition.x,
        y: clientPosition.y - notePosition.y
      }
    });
    
    // Call optional drag start callback
    onDragStart?.(noteId, dragType);
  }, [onDragStart]);

  /**
   * Handle continuous drag movement for both move and resize operations
   */
  const handleDrag = useCallback((clientPosition: Position) => {
    if (!dragState.isDragging || !draggedNoteId.current) return;

    // Calculate new position accounting for initial mouse offset
    const newPosition = {
      x: clientPosition.x - dragState.offset.x,
      y: clientPosition.y - dragState.offset.y
    };

    if (dragState.dragType === 'move') {
      onMove(draggedNoteId.current, newPosition);
    } else if (dragState.dragType === 'resize' && dragState.startSize) {
      // For resize, calculate size delta from start position
      const deltaX = newPosition.x - dragState.startPosition.x;
      const deltaY = newPosition.y - dragState.startPosition.y;
      
      // Enforce minimum size constraints
      const newSize = {
        width: Math.max(100, dragState.startSize.width + deltaX),
        height: Math.max(80, dragState.startSize.height + deltaY)
      };
      
      onResize(draggedNoteId.current, newSize);
    }
  }, [dragState, onMove, onResize]);

  /**
   * End drag operation and check for trash zone deletion
   * Only notes being moved (not resized) can be deleted
   */
  const endDrag = useCallback((clientPosition: Position) => {
    if (!dragState.isDragging || !draggedNoteId.current) return;

    const currentNoteId = draggedNoteId.current;
    const currentDragType = dragState.dragType;

    // Check if note was dropped over trash zone (only for move operations)
    if (trashZoneRef.current && dragState.dragType === 'move') {
      const trashRect = trashZoneRef.current.getBoundingClientRect();
      const isOverTrash = (
        clientPosition.x >= trashRect.left &&
        clientPosition.x <= trashRect.right &&
        clientPosition.y >= trashRect.top &&
        clientPosition.y <= trashRect.bottom
      );

      if (isOverTrash) {
        onDelete(currentNoteId);
      }
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      dragType: null,
      startPosition: { x: 0, y: 0 },
      offset: { x: 0, y: 0 }
    });
    
    draggedNoteId.current = null;
    
    // Call optional drag end callback
    if (currentDragType) {
      onDragEnd?.(currentNoteId, currentDragType);
    }
  }, [dragState, onDelete, onDragEnd]);

  return {
    dragState,
    startDrag,
    handleDrag,
    endDrag,
    trashZoneRef,
    isDraggingNote: dragState.isDragging && dragState.dragType === 'move',
    draggedNoteId: draggedNoteId.current
  };
};
