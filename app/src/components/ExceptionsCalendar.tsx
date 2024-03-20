/** @jsxImportSource @emotion/react */
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import _ from 'lodash';
import { Button, Stack } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { WeeklyCalendar } from './WeekyCalendar';
import { UserWithIncludes } from '../../../common/types/user';
import { getUser, updateUser } from '../api/client';
import {
  Availability,
  AvailabilityException,
} from '../../../common/types/availability-state';
import {
  getCurrentTimezone,
  getTimezoneOffset,
  shiftAvailabilityByTimezone,
} from '../../../common/util/timezones';
import { WeekPicker } from './WeekPicker';
import { DragPosition } from './DragContext';
import { PageContainer } from './PageContainer';
import { TimezonePicker } from './TimezonePicker';

dayjs.extend(utc);
dayjs.extend(timezone);

const msPerInterval = 1000 * 60 * 15; // milliseconds in 15 minutes

// TODO: Exceptions added on the day of DST shift get moved by one hour

function resetExceptionsForDay(
  exceptions: AvailabilityException[],
  dayNumber: number,
  week: Dayjs,
): AvailabilityException[] {
  const day = week.day(dayNumber);
  const dayEnd = day.endOf('day');
  return exceptions.filter((exception) => {
    return (
      !dayjs(exception.startTime).isBetween(day, dayEnd) &&
      !dayjs(exception.endTime).isBetween(day, dayEnd)
    );
  });
}

function doesDayHaveExceptions(
  exceptions: AvailabilityException[],
  dayNumber: number,
  week: Dayjs,
): boolean {
  const day = week.day(dayNumber);
  const dayEnd = day.endOf('day');
  return exceptions.some((exception) => {
    return (
      dayjs(exception.startTime).isBetween(day, dayEnd) ||
      dayjs(exception.endTime).isBetween(day, dayEnd) ||
      dayjs(exception.startTime).isSame(day) ||
      dayjs(exception.endTime).isSame(dayEnd)
    );
  });
}

function mergeExceptions(
  exceptions: AvailabilityException[],
  newException: AvailabilityException,
): AvailabilityException[] {
  // First, sort exceptions by startTime for easier processing
  exceptions.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const newExceptions: AvailabilityException[] = [];
  let added = false;

  const newStartTime = new Date(newException.startTime);
  const newEndTime = new Date(newException.endTime);

  exceptions.forEach((exception) => {
    const existingStartTime = new Date(exception.startTime);
    const existingEndTime = new Date(exception.endTime);

    if (existingEndTime < newStartTime || existingStartTime > newEndTime) {
      // No overlap
      newExceptions.push(exception);
    } else if (
      existingStartTime < newStartTime &&
      existingEndTime > newEndTime
    ) {
      // New exception splits the current one into two
      newExceptions.push({
        ...exception,
        endTime: new Date(newStartTime.getTime() - 1).toISOString(),
      });
      if (!added) {
        newExceptions.push(newException);
        added = true;
      }
      newExceptions.push({
        ...exception,
        startTime: new Date(newEndTime.getTime() + 1).toISOString(),
      });
    } else {
      // Overlapping, adjust existing exception
      if (existingStartTime < newStartTime) {
        newExceptions.push({
          ...exception,
          endTime: new Date(newStartTime.getTime() - 1).toISOString(),
        });
      }

      if (!added) {
        newExceptions.push(newException);
        added = true;
      }

      if (existingEndTime > newEndTime) {
        newExceptions.push({
          ...exception,
          startTime: new Date(newEndTime.getTime() + 1).toISOString(),
        });
      }
    }
  });

  if (!added) {
    // If the new exception wasn't added yet, add it now.
    newExceptions.push(newException);
  }

  return newExceptions.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  ); // Return sorted list for consistency
}

// TODO: This should probably accept a timezone to generate the correct exception
function generateExceptionsFromDrag(
  dragStart: DragPosition,
  dragEnd: DragPosition,
  dragNewState: number,
  baseDate: Dayjs,
): AvailabilityException[] {
  const dragTopLeft: DragPosition = {
    day: Math.min(dragStart.day, dragEnd.day),
    time: Math.min(dragStart.time, dragEnd.time),
  };
  const dragBottomRight: DragPosition = {
    day: Math.max(dragStart.day, dragEnd.day),
    time: Math.max(dragStart.time, dragEnd.time),
  };
  const exceptions: AvailabilityException[] = [];
  let currentDay = dragTopLeft.day;

  while (currentDay <= dragBottomRight.day) {
    const startTime = baseDate
      .day(currentDay)
      .startOf('day')
      .minute(dragTopLeft.time * 15)
      .toDate()
      .toISOString();
    const endTime = baseDate
      .day(currentDay)
      .startOf('day')
      .minute((dragBottomRight.time + 1) * 15)
      .millisecond(-1)
      .toDate()
      .toISOString();

    exceptions.push({ startTime, endTime, availability: dragNewState });

    currentDay++;
  }

  return exceptions;
}

function updateExceptions(
  existingExceptions: AvailabilityException[],
  newExceptions: AvailabilityException[],
): AvailabilityException[] {
  let updatedExceptions = existingExceptions;
  newExceptions.forEach((newException) => {
    updatedExceptions = mergeExceptions(updatedExceptions, newException);
  });

  return updatedExceptions.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
}

export const ExceptionsCalendar: React.FC = () => {
  const [user, setUser] = useState<UserWithIncludes | null>(null);
  const [week, setWeek] = useState<Dayjs>(dayjs().startOf('week'));

  const { userId, scheduleId } = useParams();

  useEffect(() => {
    // eslint-disable-next-line no-void
    void getUser(parseInt(scheduleId!, 10), parseInt(userId!, 10)).then(
      (newUser) => {
        setUser(newUser);
        // setWeek(dayjs().tz(newUser.timezone!).startOf('week'));
      },
    );
  }, []);

  const onAvailabilityUpdate = async (
    availability: Availability[][],
    dragStart: DragPosition,
    dragEnd: DragPosition,
    dragNewState: Availability,
  ) => {
    if (!user) {
      return;
    }
    // Ignore the new Availability boxes here, just update exceptions and that's it.  It's a hack but oh well.
    const newExceptions: AvailabilityException[] = generateExceptionsFromDrag(
      dragStart,
      dragEnd,
      dragNewState,
      week,
    );
    const updatedUser = {
      ...user,
      availability: {
        ...user.availability,
        exceptions: updateExceptions(
          user.availability.exceptions,
          newExceptions,
        ),
      },
    };
    setUser(updatedUser);
    await updateUser(updatedUser);
  };

  const setTimezone = async (newTimezone: string) => {
    if (!user) {
      return;
    }
    const newOffset = getTimezoneOffset(newTimezone);
    const oldOffset = getTimezoneOffset(user.timezone!);
    const offsetDifference = newOffset - oldOffset;
    const shiftedAvailability = shiftAvailabilityByTimezone(
      user.availability.weekly,
      -1 * offsetDifference,
    );
    const updatedUser = {
      ...user,
      availability: {
        ...user.availability,
        weekly: shiftedAvailability,
      },
      timezone: newTimezone,
    };

    setUser(updatedUser);
    await updateUser(updatedUser);
  };

  const navigate = useNavigate();

  const onBack = () => {
    navigate(`/schedule/${scheduleId}/user/${userId}`);
  };

  const availabilityWithExceptions = useMemo(() => {
    if (!user) {
      return null;
    }
    const shiftedWeeklyAvailability = shiftAvailabilityByTimezone(
      user.availability.weekly,
      getTimezoneOffset(user.timezone || getCurrentTimezone()),
    );
    user.availability.exceptions
      .map((exception) => ({
        ...exception,
        startTime: dayjs(exception.startTime).tz(user.timezone!),
        endTime: dayjs(exception.endTime).tz(user.timezone!),
      }))
      .filter(({ startTime, endTime }) => {
        const endWeek = week.endOf('week');
        return (
          startTime.isBetween(week, endWeek) || endTime.isBetween(week, endWeek)
        );
      })
      .forEach(({ startTime, endTime, availability }) => {
        const startDayIndex = startTime.day();
        const endDayIndex = endTime.day();
        const startTimeMs = startTime.diff(
          startTime.startOf('day'),
          'milliseconds',
        );
        const endTimeMs = endTime.diff(endTime.startOf('day'), 'milliseconds');

        // Calculate the start and end intervals in the week
        const startIntervalIndex = Math.floor(
          (startTimeMs % 86400000) / msPerInterval,
        );
        const endIntervalIndex = Math.floor(
          (endTimeMs % 86400000) / msPerInterval,
        );

        // If the availability spans multiple days, handle accordingly
        let currentDayIndex = startDayIndex;
        let currentIntervalIndex = startIntervalIndex;

        while (currentDayIndex <= endDayIndex) {
          while (currentIntervalIndex <= endIntervalIndex) {
            shiftedWeeklyAvailability[currentDayIndex][currentIntervalIndex] =
              availability;
            currentIntervalIndex++;
          }
          currentIntervalIndex = startIntervalIndex;
          currentDayIndex++;
        }
      });

    return shiftedWeeklyAvailability;
  }, [user, week, timezone]);

  const dayLabels = useMemo(() => {
    return [
      week.day(0).format('ddd MMM D'),
      week.day(1).format('ddd MMM D'),
      week.day(2).format('ddd MMM D'),
      week.day(3).format('ddd MMM D'),
      week.day(4).format('ddd MMM D'),
      week.day(5).format('ddd MMM D'),
      week.day(6).format('ddd MMM D'),
    ];
  }, [week]);

  const weeklyCalendarHeaderChildren = _.times(7, (index) => {
    if (
      !user ||
      !doesDayHaveExceptions(user.availability.exceptions, index, week)
    ) {
      return undefined;
    }
    return (
      <Button
        onClick={() => {
          if (!user) {
            return;
          }
          const updatedUser: UserWithIncludes = {
            ...user,
            availability: {
              ...user.availability,
              exceptions: resetExceptionsForDay(
                user.availability.exceptions,
                index,
                week,
              ),
            },
          };

          setUser(updatedUser);
          // eslint-disable-next-line no-void
          void updateUser(updatedUser);
        }}
      >
        Reset Day
      </Button>
    );
  });

  if (
    user == null ||
    user.availability == null ||
    availabilityWithExceptions == null
  ) {
    return <Suspense />;
  }

  return (
    <PageContainer>
      <Stack direction="row">
        <Stack spacing={2}>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <TimezonePicker timezone={user.timezone} setTimezone={setTimezone} />
          <WeekPicker
            weekValue={week}
            setWeekValue={(newWeek) => {
              // setWeek(newWeek.tz(user.timezone!));
              setWeek(newWeek);
            }}
          />
        </Stack>
        <WeeklyCalendar
          availability={availabilityWithExceptions}
          onAvailabilityUpdate={onAvailabilityUpdate}
          labels={dayLabels}
          headerChildren={weeklyCalendarHeaderChildren}
        />
      </Stack>
    </PageContainer>
  );
};
