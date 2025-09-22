import { forwardRef } from 'react';
import DeleteButton from './DeleteButton';
import styles from './TrashZone.module.css';

interface TrashZoneProps {
  isActive: boolean;
}

export const TrashZone = forwardRef<HTMLDivElement, TrashZoneProps>(
  ({ isActive }, ref) => {
    return (
      <div
        ref={ref}
         className={`${styles.trashZone} ${isActive ? styles.active : ''}`}
      >
       <DeleteButton isActive={isActive} size={36} />
      </div>
    );
  }
);
