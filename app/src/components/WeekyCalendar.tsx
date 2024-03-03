/** @jsxImportSource @emotion/react */
import React, { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { DragContext, DragPosition } from './DragContext';
import { Nullable } from '../../../common/types/nullable';
import { Availability } from '../../../common/types/availability-state';

function getNewAvailabilityValue(initialValue: Availability, mouseButton: number): Availability {
  if (mouseButton === 2) {
    console.log('test');
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

  // return _.times(7, (day.ts) => _.times(96, (time) => {
  //     if (day.ts >= beginPos.day.ts && day.ts <= endPos.day.ts && time >= beginPos.time && time <= endPos.time) {
  //         return newValue;
  //     }
  //     return week.days[day.ts].availability[time];
  // }));
  console.log(week);
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
  availability: Availability[][],
  onAvailabilityUpdate: (availability: Availability[][]) => void;
}> = ({ availability, onAvailabilityUpdate }) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragNewState, setDragNewState] = useState<Nullable<Availability>>(null);
  const [dragStart, setDragStart] = useState<Nullable<DragPosition>>(null);
  const [temporaryStates, setTemporaryStates] = useState(availability);

  const onDragStart = (e: React.MouseEvent, pos: DragPosition) => {
    setDragging(true);
    setDragStart(pos);
    const initialValue: Availability = availability[pos!.day][pos!.time];
    const newState = getNewAvailabilityValue(initialValue, e.button);
    setDragNewState(newState);
    setTemporaryStates(updateAvailabilityBox(availability, pos!, pos!, newState));
  };
  const onDragEnd = (e: React.MouseEvent, pos: DragPosition) => {
    if (dragging) {
      setDragging(false);
      setDragStart(null);
      // TODO: Update the availability state here
      const newStates = updateAvailabilityBox(availability, dragStart!, pos!, dragNewState!);
      onAvailabilityUpdate(newStates);
      setTemporaryStates(newStates);
    }
    return false;
  };
  const onMouseOut = () => {
    console.log('Stopping drag due to mouse leaving area');
    setDragging(false);
  };
  const onDrag = (e: React.MouseEvent, pos: DragPosition) => {
    if (dragging) {
      setTemporaryStates(updateAvailabilityBox(availability, dragStart!, pos!, dragNewState!));
    }
  };

  const dragContextValue = useMemo(() => ({
    onDragStart,
    onDragEnd,
    onDrag,
  }), [dragStart, dragging, availability, dragNewState]);

  return (
    <DragContext.Provider value={dragContextValue}>
      <div
        css={css`
                    display: flex;
                    flex-direction: row;
                `}
        onMouseLeave={onMouseOut}
      >
        <HoursGuide />
        <div
          css={css`
                        display: flex;
                        flex-direction: row;
                        //border: 1px solid #000000;
                    `}
        >
          <DayView day={0} availability={temporaryStates[0]} />
          <DayView day={1} availability={temporaryStates[1]} />
          <DayView day={2} availability={temporaryStates[2]} />
          <DayView day={3} availability={temporaryStates[3]} />
          <DayView day={4} availability={temporaryStates[4]} />
          <DayView day={5} availability={temporaryStates[5]} />
          <DayView day={6} availability={temporaryStates[6]} />
        </div>
        <HoursGuide />
      </div>
    </DragContext.Provider>
  );
};
