import React, { useState, useRef, useEffect } from 'react';
import type { Note, Position } from '../../types';
import styles from "./StickyNote.module.css";

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
      className={`${styles.note} ${styles.stickyNote} ${styles.noteAppear} ${note.zIndex > 99 ? styles.noteActive : ""}`}
      style={{
        left: note.position.x,
        top: note.position.y,
        width: note.size.width,
        height: note.size.height,
        background: note.color,
        zIndex: note.zIndex,
      }}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={styles.content}
      >
        {isEditing ? (
          <textarea

            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyDown}
            className={styles.textarea}
          />
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {note.text || 'Double-click to edit...'}
          </div>
        )}
      </div>

      <div
        className={styles.resizeHandle}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'resize');
        }}
      />
    </div>
  );
};
