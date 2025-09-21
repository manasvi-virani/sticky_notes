import React from 'react';
import { NOTE_COLORS } from '../types';
import type { NoteColor } from '../types';

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
    <div
      className="toolbar"
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '12px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000
      }}
    >
      <button
        onClick={onCreateNote}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        New Note
      </button>
      
      <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd' }} />
      
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#666', marginRight: '4px' }}>
          Color:
        </span>
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            className="color-button"
            onClick={() => onColorChange(color)}
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: color,
              border: selectedColor === color ? '3px solid #333' : '2px solid rgba(255,255,255,0.8)',
              borderRadius: '6px',
              cursor: 'pointer',
              padding: 0,
              position: 'relative'
            }}
            title={`Select ${color} color`}
          >
            {selectedColor === color && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#333',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
