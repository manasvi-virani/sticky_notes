import React from 'react';
import { NOTE_COLORS, type NoteColor } from '../../types';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  selectedColor: NoteColor;
  onColorChange: (color: NoteColor) => void;
  onCreateNote: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedColor,
  onColorChange,
  onCreateNote
}) => {
  return (
    <div className={styles.toolbar}>
      <button
        onClick={onCreateNote}
        className={styles.createBtn}
      >
        New Note
      </button>
      
      <div className={styles.divider} />
      
      <div className={styles.colorPicker}>
        <span className={styles.colorLabel}>
          Color:
        </span>
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            className={`${styles.colorButton} ${selectedColor === color ? styles.selected : ""}`}
            onClick={() => onColorChange(color)}
            style={{ backgroundColor: color }}
            title={`Select ${color} color`}
          >
            {selectedColor === color && (
              <div className={styles.checkMark}>
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};