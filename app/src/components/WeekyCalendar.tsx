/** @jsxImportSource @emotion/react */
import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { css } from '@emotion/react';
import { ScheduleGranularity } from '@prisma/client';
import { Box, TypographyProps } from '@mui/material';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { DragContext, DragPosition } from '../contexts/DragContext';
import { Nullable } from '../../../common/types/nullable';
import { Availability } from '../../../common/types/availability-state';

function getNewAvailabilityValue(
  initialValue: Availability,
  mouseButton: number,
): Availability {
  if (mouseButton === 2) {
    return Availability.Yellow;
  }
  return initialValue === Availability.Red
    ? Availability.Green
    : Availability.Red;
}

function updateAvailabilityBox(
  week: Availability[][],
  start: DragPosition,
  end: DragPosition,
  newValue: Availability,
): Availability[][] {
  const beginPos = {
    day: Math.min(start.day, end.day),
    time: Math.min(start.time, end.time),
  };
  const endPos = {
    day: Math.max(start.day, end.day),
    time: Math.max(start.time, end.time),
  };

  return week.map((day, index) => {
    if (index < beginPos.day || index > endPos.day) {
      return day;
    }
    return day.map((availability, time) => {
      if (time < beginPos.time || time > endPos.time) {
        return availability;
      }
      return newValue;
    });
  });
}

export const WeeklyCalendar: React.FC<{
  availability: Availability[][];
  onAvailabilityUpdate: (
    availability: Availability[][],
    dragStart: DragPosition,
    dragEnd: DragPosition,
    dragNewState: Availability,
  ) => Promise<void>;
  labels?: string[];
  labelProps?: TypographyProps[];
  headerChildren?: React.ReactNode[];
  scheduleGranularity: ScheduleGranularity;
}> = ({
  availability,
  onAvailabilityUpdate,
  labels = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  labelProps = [],
  scheduleGranularity,
  headerChildren = [],
}) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragNewState, setDragNewState] =
    useState<Nullable<Availability>>(null);
  const [dragStart, setDragStart] = useState<Nullable<DragPosition>>(null);
  const [dragTempLocation, setDragTempLocation] =
    useState<Nullable<DragPosition>>(null);
  const [temporaryStates, setTemporaryStates] = useState(availability);

  useEffect(() => {
    setTemporaryStates(availability);
  }, [availability]);

  const onDragStart = (e: React.MouseEvent, pos: DragPosition) => {
    setDragging(true);
    setDragStart(pos);
    setDragTempLocation(pos);
    const initialValue: Availability = availability[pos.day][pos.time];
    const newState = getNewAvailabilityValue(initialValue, e.button);
    setDragNewState(newState);
    setTemporaryStates(updateAvailabilityBox(availability, pos, pos, newState));
  };
  const onDragEnd = async (e: React.MouseEvent, pos: DragPosition) => {
    if (dragging) {
      setDragging(false);
      setDragStart(null);
      // TODO: Update the availability state here
      const newStates = updateAvailabilityBox(
        availability,
        dragStart!,
        pos,
        dragNewState!,
      );
      await onAvailabilityUpdate(newStates, dragStart!, pos, dragNewState!);
      setTemporaryStates(newStates);
    }
    return false;
  };
  const onMouseOut = async (e: React.MouseEvent) => {
    if (dragTempLocation) {
      await onDragEnd(e, dragTempLocation);
    }
  };
  const onDrag = (e: React.MouseEvent, pos: DragPosition) => {
    if (dragging) {
      setDragTempLocation(pos);
      setTemporaryStates(
        updateAvailabilityBox(availability, dragStart!, pos, dragNewState!),
      );
    }
  };

  const dragContextValue = useMemo(
    () => ({
      onDragStart,
      onDragEnd,
      onDrag,
    }),
    [dragStart, dragging, availability, dragNewState],
  );
  const setDayTo = async (day: number, newAvailability: Availability) => {
    const newStates = updateAvailabilityBox(
      availability,
      { day, time: 0 },
      { day, time: 95 },
      newAvailability,
    );
    await onAvailabilityUpdate(
      newStates,
      { day, time: 0 },
      { day, time: 95 },
      newAvailability,
    );
    setTemporaryStates(newStates);
  };

  return (
    <DragContext.Provider value={dragContextValue}>
      <Box
        css={css`
          display: flex;
          flex-direction: row;
        `}
        onMouseLeave={onMouseOut}
      >
        <div
          css={css`
            display: grid;
            grid-auto-flow: column;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
            grid-template-rows: auto 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
            flex-direction: row;
            //border: 1px solid #000000;
          `}
        >
          <HoursGuide />
          {_.times(7, (index) => (
            <DayView
              day={index}
              editable
              availability={temporaryStates[index]}
              setDayTo={(newAvailability) => setDayTo(index, newAvailability)}
              label={labels[index]}
              labelProps={labelProps[index]}
              headerChild={headerChildren[index]}
              granularity={scheduleGranularity}
            />
          ))}
          <HoursGuide />
        </div>
      </Box>
    </DragContext.Provider>
  );
};
