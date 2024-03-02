import React from 'react';
import { Day } from '../../../common/types/day';

export const DragContext = React.createContext<{
  onDragStart:(e: React.MouseEvent, pos: DragPosition) => void;
  onDragEnd: (e: React.MouseEvent, pos: DragPosition) => void;
  onDrag: (e: React.MouseEvent, pos: DragPosition) => void;
}>({
      onDragStart: () => null,
      onDragEnd: () => null,
      onDrag: () => null,
    });

export interface DragPosition {
  day: Day;
  time: number; // Time here represents an index of 15-minute blocks from 0 to 95
}
