import React from 'react';

export const HoverContext = React.createContext<{
  onMouseEnter: (e: React.MouseEvent, pos: DragPosition) => void;
  onMouseLeave: (e: React.MouseEvent, pos: DragPosition) => void;
}>({
  onMouseEnter: () => null,
  onMouseLeave: () => null,
});

export interface DragPosition {
  day: number;
  time: number; // Time here represents an index of 15-minute blocks from 0 to 95
}
