/** @jsxImportSource @emotion/react */
import React, { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { DragContext, DragPosition } from './DragContext';
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
}) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragNewState, setDragNewState] =
    useState<Nullable<Availability>>(null);
  const [dragStart, setDragStart] = useState<Nullable<DragPosition>>(null);
  const [temporaryStates, setTemporaryStates] = useState(availability);

  useEffect(() => {
    console.log('resetting availability of weekly calendar due to update');
    setTemporaryStates(availability);
  }, [availability]);

  const onDragStart = (e: React.MouseEvent, pos: DragPosition) => {
    setDragging(true);
    setDragStart(pos);
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
  const onMouseOut = () => {
    setDragging(false);
  };
  const onDrag = (e: React.MouseEvent, pos: DragPosition) => {
    if (dragging) {
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
      <div
        css={css`
          display: flex;
          flex-direction: row;
        `}
        onMouseLeave={onMouseOut}
      >
        <HoursGuide editable />
        <div
          css={css`
            display: flex;
            flex-direction: row;
            //border: 1px solid #000000;
          `}
        >
          <DayView
            day={0}
            editable
            availability={temporaryStates[0]}
            setDayTo={(newAvailability) => setDayTo(0, newAvailability)}
            label={labels[0]}
          />
          <DayView
            day={1}
            editable
            availability={temporaryStates[1]}
            setDayTo={(newAvailability) => setDayTo(1, newAvailability)}
            label={labels[1]}
          />
          <DayView
            day={2}
            editable
            availability={temporaryStates[2]}
            setDayTo={(newAvailability) => setDayTo(2, newAvailability)}
            label={labels[2]}
          />
          <DayView
            day={3}
            editable
            availability={temporaryStates[3]}
            setDayTo={(newAvailability) => setDayTo(3, newAvailability)}
            label={labels[3]}
          />
          <DayView
            day={4}
            editable
            availability={temporaryStates[4]}
            setDayTo={(newAvailability) => setDayTo(4, newAvailability)}
            label={labels[4]}
          />
          <DayView
            day={5}
            editable
            availability={temporaryStates[5]}
            setDayTo={(newAvailability) => setDayTo(5, newAvailability)}
            label={labels[5]}
          />
          <DayView
            day={6}
            editable
            availability={temporaryStates[6]}
            setDayTo={(newAvailability) => setDayTo(6, newAvailability)}
            label={labels[6]}
          />
        </div>
        <HoursGuide editable />
      </div>
    </DragContext.Provider>
  );
};
