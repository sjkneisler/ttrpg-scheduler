/** @jsxImportSource @emotion/react */
import React, { useContext, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import _ from 'lodash';
import { ScheduleGranularity } from '@prisma/client';
import { DayView } from './DayView';
import { HoursGuide } from './HoursGuide';
import {
  AggregateAvailability,
  Availability,
} from '../../../common/types/availability-state';
import { DragPosition, HoverContext } from './HoverContext';
import { TimeDetailOverlay } from './TimeDetailOverlay';
import { ScheduleContext } from './ScheduleContainer';
import {
  getCurrentTimezone,
  getTimezoneOffset,
  shiftAvailabilityByTimezone,
} from '../../../common/util/timezones';

export const AggregateWeeklyCalendar: React.FC<{
  availability: AggregateAvailability;
  labels?: string[];
  granularity: ScheduleGranularity;
}> = ({
  availability,
  labels = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
  granularity,
}) => {
  const [currentHover, setCurrentHover] = useState<DragPosition | null>(null);
  const [schedule] = useContext(ScheduleContext);

  const onMouseEnter = useMemo(
    () => (e: React.MouseEvent, pos: DragPosition) => {
      setCurrentHover(pos);
    },
    [setCurrentHover],
  );

  const onMouseLeave = useMemo(
    () => () => {
      setCurrentHover(null);
    },
    [setCurrentHover],
  );

  const hoverContextValue = useMemo(() => {
    return {
      onMouseEnter,
      onMouseLeave,
    };
  }, [onMouseEnter, onMouseLeave]);

  const userAvailabilities = useMemo(() => {
    if (currentHover === null) {
      return null;
    }
    return {
      [Availability.Green]: schedule.users
        .filter((user) => {
          return (
            shiftAvailabilityByTimezone(
              user.availability.weekly,
              getTimezoneOffset(user.timezone || getCurrentTimezone()),
            )[currentHover.day][currentHover.time] === Availability.Green
          );
        })
        .map((user) => user.name),
      [Availability.Yellow]: schedule.users
        .filter((user) => {
          return (
            shiftAvailabilityByTimezone(
              user.availability.weekly,
              getTimezoneOffset(user.timezone || getCurrentTimezone()),
            )[currentHover.day][currentHover.time] === Availability.Yellow
          );
        })
        .map((user) => user.name),
      [Availability.Red]: schedule.users
        .filter((user) => {
          return (
            shiftAvailabilityByTimezone(
              user.availability.weekly,
              getTimezoneOffset(user.timezone || getCurrentTimezone()),
            )[currentHover.day][currentHover.time] === Availability.Red
          );
        })
        .map((user) => user.name),
    };
  }, [schedule, currentHover]);

  return (
    <HoverContext.Provider value={hoverContextValue}>
      <div
        css={css`
          display: flex;
          flex-direction: row;
        `}
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
              editable={false}
              availability={availability[index]}
              setDayTo={() => Promise.resolve()}
              label={labels[index]}
              granularity={granularity}
            />
          ))}
          <HoursGuide />
        </div>
      </div>
      {currentHover && userAvailabilities && (
        <TimeDetailOverlay
          startTime={currentHover}
          userAvailabilities={userAvailabilities}
        />
      )}
    </HoverContext.Provider>
  );
};
