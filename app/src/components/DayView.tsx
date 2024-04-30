/** @jsxImportSource @emotion/react */
import React, { useContext } from 'react';
import { css } from '@emotion/react';
import _ from 'lodash';
import { Box, IconButton, Typography, TypographyProps } from '@mui/material';
import { ScheduleGranularity } from '@prisma/client';
import { getColorFromAvailabilityState } from '../utils/availbility-states';
import { DragContext } from '../contexts/DragContext';
import { Availability } from '../../../common/types/availability-state';
import { getDayText } from '../utils/day';
import { HoverContext } from '../contexts/HoverContext';

function getBorderForTimeSegment(
  intervalNum: number,
  granularity: ScheduleGranularity,
): string {
  if (intervalNum === 0 && granularity === ScheduleGranularity.ONEHOUR) {
    return '2px 1px 2px 1px';
  }
  if (intervalNum === 0) {
    return '2px 1px 1px 1px';
  }
  if (
    (intervalNum === 3 && granularity === ScheduleGranularity.FIFTEENMINUTES) ||
    (intervalNum === 1 && granularity === ScheduleGranularity.THIRTYMINUTES)
  ) {
    return '1px 1px 2px 1px';
  }
  return '1px';
}

const granularityToDragStartMap: Record<ScheduleGranularity, number> = {
  ONEHOUR: 4, // This value won't ever matter
  THIRTYMINUTES: 2,
  FIFTEENMINUTES: 1,
};

function getDragStart(
  hourCount: number,
  segment: number,
  granularity: ScheduleGranularity,
): number {
  return hourCount * 4 + segment * granularityToDragStartMap[granularity];
}

function getDragEnd(
  hourCount: number,
  segment: number,
  granularity: ScheduleGranularity,
): number {
  return (
    getDragStart(hourCount, segment, granularity) +
    (granularityToDragStartMap[granularity] - 1)
  );
}

const ColorButton: React.FC<{
  onClick: () => void;
  color: string;
}> = ({ onClick, color }) => (
  <IconButton
    css={css`
      background-color: ${color};
    `}
    onClick={onClick}
  />
);

export type DayViewProps = {
  day: number;
  availability: (Availability | string)[];
  setDayTo: (availability: Availability) => Promise<void>;
  editable: boolean;
  label?: string;
  labelProps?: TypographyProps;
  headerChild?: React.ReactNode;
  granularity: ScheduleGranularity;
};

const granularityToCellsPerHourMap: Record<ScheduleGranularity, number> = {
  ONEHOUR: 1,
  THIRTYMINUTES: 2,
  FIFTEENMINUTES: 4,
};

const granularityToCellHeightMap: Record<ScheduleGranularity, number> = {
  ONEHOUR: 26,
  THIRTYMINUTES: 12,
  FIFTEENMINUTES: 5,
};

export const DayView: React.FC<DayViewProps> = ({
  day,
  availability,
  setDayTo,
  editable,
  label = getDayText(day),
  headerChild,
  granularity,
  labelProps,
}) => {
  const { onDragStart, onDragEnd, onDrag } = useContext(DragContext);
  const { onMouseEnter, onMouseLeave } = useContext(HoverContext);

  return (
    <>
      <Box>
        <Typography
          css={css`
            text-align: center;
            margin: 10px 0;
          `}
          {...labelProps}
        >
          {label}
        </Typography>
        {editable && (
          <div>
            Set day to:
            <div>
              {/* eslint-disable @typescript-eslint/no-misused-promises */}
              <ColorButton
                color="#FF0000"
                onClick={() => setDayTo(Availability.Red)}
              />
              <ColorButton
                color="#FFFF00"
                onClick={() => setDayTo(Availability.Yellow)}
              />
              <ColorButton
                color="#00FF00"
                onClick={() => setDayTo(Availability.Green)}
              />
              {/* eslint-enable @typescript-eslint/no-misused-promises */}
            </div>
          </div>
        )}
        {headerChild}
      </Box>
      {_.times(24, (hourCount) => (
        <div
          key={hourCount}
          css={css`
            //border: 1px solid #00000055;
            display: flex;
            flex-direction: column;
          `}
        >
          {_.times(granularityToCellsPerHourMap[granularity], (num) => (
            <div
              key={num}
              css={css`
                flex: 0 0 auto;
                width: 100px;
                height: ${granularityToCellHeightMap[granularity]}px;
                border-color: #444;
                border-style: solid;
                border-width: ${getBorderForTimeSegment(num, granularity)};
                background-color: ${getColorFromAvailabilityState(
                  availability[getDragStart(hourCount, num, granularity)],
                )};
                cursor: ${editable ? 'pointer' : 'default'};
              `}
              onMouseMove={(e) =>
                onDrag(e, {
                  day,
                  time: getDragEnd(hourCount, num, granularity),
                })
              }
              onMouseDown={(e) =>
                onDragStart(e, {
                  day,
                  time: getDragStart(hourCount, num, granularity),
                })
              }
              onMouseUp={(e) =>
                onDragEnd(e, {
                  day,
                  time: getDragEnd(hourCount, num, granularity),
                })
              }
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              onMouseEnter={(e) =>
                onMouseEnter(e, {
                  day,
                  time: getDragStart(hourCount, num, granularity),
                })
              }
              onMouseLeave={(e) =>
                onMouseLeave(e, {
                  day,
                  time: getDragStart(hourCount, num, granularity),
                })
              }
            />
          ))}
        </div>
      ))}
    </>
  );
};
