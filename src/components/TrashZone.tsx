import { forwardRef } from 'react';

interface TrashZoneProps {
  isActive: boolean;
}

export const TrashZone = forwardRef<HTMLDivElement, TrashZoneProps>(
  ({ isActive }, ref) => {
    return (
      <div
        ref={ref}
        className={isActive ? 'trash-zone-active' : ''}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          backgroundColor: isActive ? '#ff4757' : 'rgba(241, 242, 246, 0.9)',
          backdropFilter: 'blur(10px)',
          border: `3px dashed ${isActive ? '#ff3742' : '#a4b0be'}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          color: isActive ? 'white' : '#a4b0be',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
          transform: isActive ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
          boxShadow: isActive ? '0 8px 32px rgba(255, 71, 87, 0.4)' : '0 4px 16px rgba(0,0,0,0.1)'
        }}
      >
        🗑️
      </div>
    );
  }
);
