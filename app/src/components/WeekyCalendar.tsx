/** @jsxImportSource @emotion/react */
import React, { useContext, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import _ from 'lodash';
import { AvailabilityState, WeekAvailability } from '../../../common/types/availability-state';
import { Day } from '../../../common/types/day';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { DragContext, DragPosition } from './DragContext';

function generateInitialAvailabilities(): WeekAvailability {
  return _.times(7, () => _.times(96, () => AvailabilityState.GREEN));
}

function updateAvailabilityBox(
  week: WeekAvailability,
  start: DragPosition,
  end: DragPosition,
  newValue: AvailabilityState,
): WeekAvailability {
  const beginPos = {
    day: Math.min(start.day, end.day),
    time: Math.min(start.time, end.time),
  };
  const endPos = {
    day: Math.max(start.day, end.day),
    time: Math.max(start.time, end.time),
  };

  return _.times(7, (day) => _.times(96, (time) => {
    if (day >= beginPos.day && day <= endPos.day && time >= beginPos.time && time <= endPos.time) {
      return newValue;
    }
    return week[day][time];
  }));
}

export const WeeklyCalendar: React.FC = () => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<DragPosition | null>(null);

  const [states, setStates] = useState(generateInitialAvailabilities());
  const [temporaryStates, setTemporaryStates] = useState(states);

  const onDragStart = (pos: DragPosition) => {
    console.log('Drag start');
    console.log(pos);
    setDragging(true);
    setDragStart(pos);
    // setDragEnd(pos);
    const initialValue = states[pos!.day][pos!.time];
    const newValue = initialValue === AvailabilityState.RED
      ? AvailabilityState.GREEN
      : AvailabilityState.RED;
    setTemporaryStates(updateAvailabilityBox(states, pos!, pos!, newValue));
  };
  const onDragEnd = (pos: DragPosition) => {
    console.log('Drag end');
    console.log(pos);
    setDragging(false);
    setDragStart(null);
    // setDragEnd(null);
    // TODO: Update the availability state here
    const initialValue = states[dragStart!.day][dragStart!.time];
    const newValue = initialValue === AvailabilityState.RED
      ? AvailabilityState.GREEN
      : AvailabilityState.RED;
    const newStates = updateAvailabilityBox(states, dragStart!, pos!, newValue);
    setStates(newStates);
    setTemporaryStates(newStates);
  };
  const onDrag = (pos: DragPosition) => {
    console.log('Drag');
    console.log(pos);
    if (dragging) {
      const startPos = dragStart || pos;
      // setDragEnd(pos);
      const initialValue = states[startPos!.day][startPos!.time];
      const newValue = initialValue === AvailabilityState.RED
        ? AvailabilityState.GREEN
        : AvailabilityState.RED;
      setTemporaryStates(updateAvailabilityBox(states, startPos!, pos!, newValue));
    }
  };

  const dragContextValue = useMemo(() => ({
    onDragStart,
    onDragEnd,
    onDrag,
  }), [dragStart, dragging, states]);

  return (
    <DragContext.Provider value={dragContextValue}>

      <div css={css`
                display: flex;
                flex-direction: row;
            `}
      >
        <HoursGuide />
        <DayView day={Day.Sunday} availability={temporaryStates[0]} />
        <DayView day={Day.Monday} availability={temporaryStates[1]} />
        <DayView day={Day.Tuesday} availability={temporaryStates[2]} />
        <DayView day={Day.Wednesday} availability={temporaryStates[3]} />
        <DayView day={Day.Thursday} availability={temporaryStates[4]} />
        <DayView day={Day.Friday} availability={temporaryStates[5]} />
        <DayView day={Day.Saturday} availability={temporaryStates[6]} />
        <HoursGuide />
      </div>
    </DragContext.Provider>
  );
};
