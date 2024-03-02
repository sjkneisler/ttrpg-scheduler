/** @jsxImportSource @emotion/react */
import React, { useMemo, useState } from 'react';
import { css } from '@emotion/react';
import {Availability, Day} from '@prisma/client';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import { DragContext, DragPosition } from './DragContext';
import { Nullable } from '../../../common/types/nullable';
import { getNumberForDay } from '../../../common/util/day';
import { WeeklyAvailabilityWithIncludes } from '../../../common/types/user';

function getNewAvailabilityValue(initialValue: Availability, mouseButton: number): Availability {
  if (mouseButton === 2) {
    console.log('test');
    return Availability.YELLOW;
  }
  return initialValue === Availability.RED
    ? Availability.GREEN
    : Availability.RED;
}

function updateAvailabilityBox(
  week: WeeklyAvailabilityWithIncludes,
  start: DragPosition,
  end: DragPosition,
  newValue: Availability,
): WeeklyAvailabilityWithIncludes {
  const beginPos = {
    day: Math.min(getNumberForDay(start.day), getNumberForDay(end.day)),
    time: Math.min(start.time, end.time),
  };
  const endPos = {
    day: Math.max(getNumberForDay(start.day), getNumberForDay(end.day)),
    time: Math.max(start.time, end.time),
  };

  // return _.times(7, (day.ts) => _.times(96, (time) => {
  //     if (day.ts >= beginPos.day.ts && day.ts <= endPos.day.ts && time >= beginPos.time && time <= endPos.time) {
  //         return newValue;
  //     }
  //     return week.days[day.ts].availability[time];
  // }));
  return {
    ...week,
    days: week.days.map((day) => {
      if (getNumberForDay(day.day) < beginPos.day || getNumberForDay(day.day) > endPos.day) {
        return day;
      }
      return {
        ...day,
        availability: day.availability.map((availability, time) => {
          if (time < beginPos.time || time > endPos.time) {
            return availability;
          }
          return newValue;
        }),
      };
    }),
  };
}

export const WeeklyCalendar: React.FC<{
  availability: WeeklyAvailabilityWithIncludes,
  onAvailabilityUpdate: (availability: WeeklyAvailabilityWithIncludes) => void;
}> = ({ availability, onAvailabilityUpdate }) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [dragNewState, setDragNewState] = useState<Nullable<Availability>>(null);
  const [dragStart, setDragStart] = useState<Nullable<DragPosition>>(null);
  const [temporaryStates, setTemporaryStates] = useState(availability);

  const onDragStart = (e: React.MouseEvent, pos: DragPosition) => {
    setDragging(true);
    setDragStart(pos);
    const initialValue: Availability = availability.days[getNumberForDay(pos!.day)].availability[pos!.time];
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
          <DayView day={Day.SUNDAY} availability={temporaryStates.days[0]} />
          <DayView day={Day.MONDAY} availability={temporaryStates.days[1]} />
          <DayView day={Day.TUESDAY} availability={temporaryStates.days[2]} />
          <DayView day={Day.WEDNESDAY} availability={temporaryStates.days[3]} />
          <DayView day={Day.THURSDAY} availability={temporaryStates.days[4]} />
          <DayView day={Day.FRIDAY} availability={temporaryStates.days[5]} />
          <DayView day={Day.SATURDAY} availability={temporaryStates.days[6]} />
        </div>
        <HoursGuide />
      </div>
    </DragContext.Provider>
  );
};
