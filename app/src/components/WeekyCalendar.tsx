/** @jsxImportSource @emotion/react */
import React, { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import _ from 'lodash';
import { AvailabilityState, WeekAvailability } from '../../../common/types/availability-state';
import { Day } from '../../../common/types/day';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { DragContext, DragPosition } from './DragContext';
import { Nullable } from '../../../common/types/nullable';

function generateInitialAvailabilities(): WeekAvailability {
  return _.times(7, () => _.times(96, () => AvailabilityState.GREEN));
}

function getNewAvailabilityStateValue(initialValue: AvailabilityState, mouseButton: number): AvailabilityState {
  if (mouseButton === 2) {
    console.log('test');
    return AvailabilityState.YELLOW;
  }
  return initialValue === AvailabilityState.RED
    ? AvailabilityState.GREEN
    : AvailabilityState.RED;
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
  const [dragNewState, setDragNewState] = useState<Nullable<AvailabilityState>>(null);
  const [dragStart, setDragStart] = useState<Nullable<DragPosition>>(null);

  const [states, setStates] = useState(generateInitialAvailabilities());
  const [temporaryStates, setTemporaryStates] = useState(states);

  const onDragStart = (e: React.MouseEvent, pos: DragPosition) => {
    setDragging(true);
    setDragStart(pos);
    const initialValue = states[pos!.day][pos!.time];
    const newState = getNewAvailabilityStateValue(initialValue, e.button);
    setDragNewState(newState);
    setTemporaryStates(updateAvailabilityBox(states, pos!, pos!, newState));
  };
  const onDragEnd = (e: React.MouseEvent, pos: DragPosition) => {
    if (dragging) {
      setDragging(false);
      setDragStart(null);
      // TODO: Update the availability state here
      const newStates = updateAvailabilityBox(states, dragStart!, pos!, dragNewState!);
      setStates(newStates);
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
      setTemporaryStates(updateAvailabilityBox(states, dragStart!, pos!, dragNewState!));
    }
  };

  const dragContextValue = useMemo(() => ({
    onDragStart,
    onDragEnd,
    onDrag,
  }), [dragStart, dragging, states, dragNewState]);

  return (
    <DragContext.Provider value={dragContextValue}>
      <div
        css={css`
                    display: flex;
                    flex-direction: row;
                `}
        onMouseLeave={onMouseOut}
        // onBlur={onMouseOut}
      >
        <HoursGuide />
        <div
          css={css`
            display: flex;
            flex-direction: row;
            //border: 1px solid #000000;
          `}
        >
          <DayView day={Day.Sunday} availability={temporaryStates[0]} />
          <DayView day={Day.Monday} availability={temporaryStates[1]} />
          <DayView day={Day.Tuesday} availability={temporaryStates[2]} />
          <DayView day={Day.Wednesday} availability={temporaryStates[3]} />
          <DayView day={Day.Thursday} availability={temporaryStates[4]} />
          <DayView day={Day.Friday} availability={temporaryStates[5]} />
          <DayView day={Day.Saturday} availability={temporaryStates[6]} />
        </div>
        <HoursGuide />
      </div>
    </DragContext.Provider>
  );
};
