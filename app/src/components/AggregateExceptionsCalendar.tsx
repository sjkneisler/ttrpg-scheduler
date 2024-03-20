/** @jsxImportSource @emotion/react */
import React, { Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import { AvailabilityException } from '../../../common/types/availability-state';
import {
  getCurrentTimezone,
  getTimezoneOffset,
  shiftAvailabilityByTimezone,
} from '../../../common/util/timezones';
import { WeekPicker } from './WeekPicker';
import { PageContainer } from './PageContainer';
import { TimezonePicker } from './TimezonePicker';
import { useSchedule } from '../hooks/useSchedule';
import { aggregateUserAvailabilities } from '../utils/aggregate';
import { AggregationType } from '../../../common/types/aggregation-type';
import { AggregateWeeklyCalendar } from './AggregateWeekyCalendar';

dayjs.extend(utc);
dayjs.extend(dayjsTimezone);

const msPerInterval = 1000 * 60 * 15; // milliseconds in 15 minutes

export const AggregateExceptionsCalendar: React.FC = () => {
  const [week, setWeek] = useState<Dayjs>(dayjs().startOf('week'));

  const schedule = useSchedule();

  const navigate = useNavigate();

  const [aggregationType, setAggregationType] = useState<AggregationType>(
    AggregationType.Shared,
  );
  const [timezone, setTimezone] = useState(getCurrentTimezone());

  const onBack = () => {
    if (!schedule) {
      return;
    }

    navigate(`/schedule/${schedule.id}`);
  };

  const availabilityWithExceptions = useMemo(() => {
    if (!schedule) {
      return null;
    }
    const userAvailabilities = schedule.users.map((user) => {
      const shiftedWeeklyAvailability = shiftAvailabilityByTimezone(
        user.availability.weekly,
        getTimezoneOffset(timezone),
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
            startTime.isBetween(week, endWeek) ||
            endTime.isBetween(week, endWeek)
          );
        })
        .forEach(({ startTime, endTime, availability }) => {
          const startDayIndex = startTime.day();
          const endDayIndex = endTime.day();
          const startTimeMs = startTime.diff(
            startTime.startOf('day'),
            'milliseconds',
          );
          const endTimeMs = endTime.diff(
            endTime.startOf('day'),
            'milliseconds',
          );

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
    });

    console.log('User Availabilities');
    console.log(userAvailabilities);
    return aggregateUserAvailabilities(userAvailabilities, aggregationType);
  }, [schedule, week, aggregationType, timezone]);

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

  if (schedule == null || availabilityWithExceptions == null) {
    return <Suspense />;
  }

  return (
    <PageContainer>
      <Stack direction="row">
        <Stack spacing={2}>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <TimezonePicker timezone={timezone} setTimezone={setTimezone} />
          <WeekPicker
            weekValue={week}
            setWeekValue={(newWeek) => {
              // setWeek(newWeek.tz(user.timezone!));
              setWeek(newWeek);
            }}
          />
          <FormControl fullWidth>
            <Typography variant="h6">Aggregation Type</Typography>
            <ToggleButtonGroup
              value={aggregationType}
              exclusive
              onChange={(e, value) =>
                setAggregationType(value as AggregationType)
              }
            >
              <ToggleButton value={AggregationType.Shared}>Shared</ToggleButton>
              <ToggleButton value={AggregationType.Average}>
                Average
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl>
        </Stack>
        <AggregateWeeklyCalendar
          availability={availabilityWithExceptions}
          labels={dayLabels}
        />
      </Stack>
    </PageContainer>
  );
};
