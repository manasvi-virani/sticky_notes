import React, { useState, useRef, useEffect } from 'react';
import type { Note, Position } from '../types';

interface StickyNoteProps {
  note: Note;
  onTextChange: (id: string, text: string) => void;
  onBringToFront: (id: string) => void;
  onStartDrag: (
    noteId: string,
    dragType: 'move' | 'resize',
    clientPosition: Position,
    notePosition: Position,
    noteSize?: { width: number; height: number }
  ) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  note,
  onTextChange,
  onBringToFront,
  onStartDrag
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(note.text);
  }, [note.text]);

  const handleMouseDown = (e: React.MouseEvent, dragType: 'move' | 'resize') => {
    e.preventDefault();
    onBringToFront(note.id);
    
    const clientPosition = { x: e.clientX, y: e.clientY };
    const notePosition = note.position;
    const noteSize = dragType === 'resize' ? note.size : undefined;
    
    onStartDrag(note.id, dragType, clientPosition, notePosition, noteSize);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  };

  const handleTextSubmit = () => {
    setIsEditing(false);
    onTextChange(note.id, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setText(note.text);
    }
  };

  return (
    <div
      ref={noteRef}
      className="sticky-note note-appear"
      style={{
        position: 'absolute',
        left: note.position.x,
        top: note.position.y,
        width: note.size.width,
        height: note.size.height,
        backgroundColor: note.color,
        border: '2px solid rgba(255,255,255,0.3)',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        cursor: 'move',
        zIndex: note.zIndex,
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          flex: 1,
          padding: '8px',
          overflow: 'hidden',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.4'
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              resize: 'none',
              fontSize: '14px',
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.4'
            }}
          />
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {note.text || 'Double-click to edit...'}
          </div>
        )}
      </div>
      
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          width: '16px',
          height: '16px',
          cursor: 'se-resize',
          background: 'linear-gradient(-45deg, transparent 30%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.3) 40%, transparent 40%)',
          borderRadius: '0 0 6px 0',
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'resize');
        }}
      />
    </div>
  );
};
