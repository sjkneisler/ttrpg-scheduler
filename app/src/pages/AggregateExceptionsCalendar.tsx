/** @jsxImportSource @emotion/react */
import React, { Suspense, useContext, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormControl,
  Stack,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  TypographyProps,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTheme } from '@mui/material/styles';
import _ from 'lodash';
import {
  getCurrentTimezone,
  getTimezoneOffset,
  shiftAvailabilityByTimezone,
} from '../../../common/util/timezones';
import { WeekPicker } from '../components/WeekPicker';
import { PageContainer } from '../components/PageContainer';
import { TimezonePicker } from '../components/TimezonePicker';
import { aggregateUserAvailabilities } from '../utils/aggregate';
import { AggregationType } from '../../../common/types/aggregation-type';
import { AggregateWeeklyCalendar } from '../components/AggregateWeekyCalendar';
import { ScheduleContext } from '../contexts/ScheduleContainer';
import { generateDayLabels } from '../utils/day-labels';

dayjs.extend(utc);
dayjs.extend(dayjsTimezone);

const msPerInterval = 1000 * 60 * 15; // milliseconds in 15 minutes
const intervalsPerDay = (24 * 60) / 15; // count of intervals per day

export const AggregateExceptionsCalendar: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsWeek = searchParams.get('week');
  const initialWeekValue = paramsWeek
    ? dayjs.unix(parseInt(paramsWeek, 10)).startOf('week')
    : dayjs().startOf('week');
  const [week, setWeek] = useState<Dayjs>(initialWeekValue);

  const [schedule] = useContext(ScheduleContext);
  const navigate = useNavigate();

  const [aggregationType, setAggregationType] = useState<AggregationType>(
    AggregationType.Shared,
  );
  const [timezone, setTimezone] = useState(getCurrentTimezone());

  const onBack = () => {
    if (!schedule) {
      return;
    }

    navigate(`/schedule/${schedule.inviteCode}`);
  };

  const availabilityWithExceptions = useMemo(() => {
    if (!schedule) {
      return null;
    }
    const userAvailabilities = schedule.users
      .filter((user) => user.shown)
      .map((user) => {
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
              while (
                (currentDayIndex < endDayIndex &&
                  currentIntervalIndex < intervalsPerDay) ||
                (currentDayIndex === endDayIndex &&
                  currentIntervalIndex <= endIntervalIndex)
              ) {
                shiftedWeeklyAvailability[currentDayIndex][
                  currentIntervalIndex
                ] = availability;
                currentIntervalIndex++;
              }
              currentIntervalIndex = 0;
              currentDayIndex++;
            }
          });

        return shiftedWeeklyAvailability;
      });

    return aggregateUserAvailabilities(userAvailabilities, aggregationType);
  }, [schedule, week, aggregationType, timezone]);

  const theme = useTheme();

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

  const dayLabelProps = useMemo(
    () => generateDayLabels(week, theme),
    [week, theme],
  );

  if (schedule == null || availabilityWithExceptions == null) {
    return <Suspense />;
  }

  return (
    <PageContainer>
      <Stack direction="row" spacing={4}>
        <Stack spacing={2}>
          <Button variant="outlined" onClick={onBack}>
            Back To Schedule
          </Button>
          <WeekPicker
            weekValue={week}
            setWeekValue={(newWeek) => {
              // setWeek(newWeek.tz(user.timezone!));
              setWeek(newWeek);
              setSearchParams({ week: newWeek.unix().toString() });
            }}
            timezone={timezone}
          />
          <Accordion>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
              <Typography>Advanced Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <Typography variant="h6">Aggregation Type</Typography>
                  <ToggleButtonGroup
                    value={aggregationType}
                    exclusive
                    onChange={(e, value) =>
                      setAggregationType(value as AggregationType)
                    }
                  >
                    <ToggleButton value={AggregationType.Shared}>
                      Shared
                    </ToggleButton>
                    <ToggleButton value={AggregationType.Average}>
                      Average
                    </ToggleButton>
                  </ToggleButtonGroup>
                </FormControl>
                <TimezonePicker timezone={timezone} setTimezone={setTimezone} />
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
        <AggregateWeeklyCalendar
          availability={availabilityWithExceptions}
          labels={dayLabels}
          labelProps={dayLabelProps}
          granularity={schedule.granularity}
          timezone={timezone}
        />
      </Stack>
    </PageContainer>
  );
};
