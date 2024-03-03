/** @jsxImportSource @emotion/react */
import React, { useContext } from 'react';
import { css } from '@emotion/react';
import _ from 'lodash';
import { IconButton } from '@mui/material';
import { getColorFromAvailabilityState } from '../utils/availbility-states';
import { DragContext } from './DragContext';
import { Availability } from '../../../common/types/availability-state';
import { getDayText } from '../utils/day';

function getBorderForTimeSegment(intervalNum: number): string {
  if (intervalNum === 0) {
    return '2px 1px 1px 1px';
  }
  if (intervalNum === 3) {
    return '1px 1px 2px 1px';
  }
  return '1px';
}

const ColorButton: React.FC<{
  onClick: () => void;
  color: string;
}> = ({
  onClick,
  color,
}) => (
  <IconButton
    css={css`
            background-color: ${color}
        `}
    onClick={onClick}
  />
);

export type DayViewProps = {
  day: number;
  availability: (Availability | string)[];
  setDayTo: (availability: Availability) => void;
  editable: boolean;
};

export const DayView: React.FC<DayViewProps> = ({
  day,
  availability,
  setDayTo,
  editable,
}) => {
  const {
    onDragStart,
    onDragEnd,
    onDrag,
  } = useContext(DragContext);
  return (
    <div css={css`
            //border: 1px solid #000000;
        `}
    >
      <div css={css`
                text-align: center;
                margin: 10px 0;
            `}
      >
        {getDayText(day)}
      </div>
      { editable && (
      <div>
        Set day to:
        <div>
          <ColorButton color="#FF0000" onClick={() => setDayTo(Availability.Red)} />
          <ColorButton color="#FFFF00" onClick={() => setDayTo(Availability.Yellow)} />
          <ColorButton color="#00FF00" onClick={() => setDayTo(Availability.Green)} />
        </div>
      </div>
      )}
      <div css={css`
                flex: 0 0 auto;
                display: flex;
                flex-direction: column;
            `}
      >
        {_.times(24, (hourCount) => (
          <div
            key={hourCount}
            css={css`
                            //border: 1px solid #00000055;
                            display: flex;
                            flex-direction: column;
                        `}
          >
            {_.times(
              4,
              (num) => (
                <div
                  key={num}
                  css={css`
                                        flex: 1 1 auto;
                                        width: 100px;
                                        height: 5px;
                                        border-color: #000000FF;
                                        border-style: solid;
                                        border-width: ${getBorderForTimeSegment(num)};
                                        background-color: ${getColorFromAvailabilityState(availability[hourCount * 4 + num])};
                                        cursor: ${editable ? 'pointer' : 'default'};
                                    `}
                  onMouseMove={(e) => onDrag(e, { day, time: hourCount * 4 + num })}
                  onMouseDown={(e) => onDragStart(e, { day, time: hourCount * 4 + num })}
                  onMouseUp={(e) => onDragEnd(e, { day, time: hourCount * 4 + num })}
                  onContextMenu={(e) => {
                    e.preventDefault();
                  }}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
