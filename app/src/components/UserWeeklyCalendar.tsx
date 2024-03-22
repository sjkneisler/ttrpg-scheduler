/** @jsxImportSource @emotion/react */
import React, { Suspense, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { WeeklyCalendar } from './WeekyCalendar';
import { updateUser } from '../api/client';
import { Availability } from '../../../common/types/availability-state';
import {
  getCurrentTimezone,
  getTimezoneOffset,
  shiftAvailabilityByTimezone,
} from '../../../common/util/timezones';
import { PageContainer } from './PageContainer';
import { TimezonePicker } from './TimezonePicker';
import { ScheduleInstructions } from './ScheduleInstructions';
import { ScheduleContext } from './ScheduleContainer';
import { ScheduleUserContext } from './ScheduleUserContainer';

export const UserWeeklyCalendar: React.FC = () => {
  const [schedule] = useContext(ScheduleContext);
  const [user, setUser] = useContext(ScheduleUserContext);

  const onAvailabilityUpdate = async (availability: Availability[][]) => {
    const shiftedAvailability = shiftAvailabilityByTimezone(
      availability,
      -1 * getTimezoneOffset(user.timezone || getCurrentTimezone()),
    );
    const updatedUser = {
      ...user,
      availability: {
        ...user.availability,
        weekly: shiftedAvailability,
      },
    };
    setUser(updatedUser);
    await updateUser(updatedUser);
  };

  const setTimezone = (newTimezone: string) => {
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

    // eslint-disable-next-line no-void
    void updateUser(updatedUser);
    setUser(updatedUser);
  };

  const navigate = useNavigate();

  const onBack = () => {
    navigate(`/schedule/${schedule?.inviteCode}`);
  };

  const gotoExceptions = () => {
    navigate(`/schedule/${schedule?.inviteCode}/user/${user.id}/exceptions`);
  };

  const shiftedWeeklyAvailability = useMemo(() => {
    if (!user) {
      return null;
    }
    return shiftAvailabilityByTimezone(
      user.availability.weekly,
      getTimezoneOffset(user.timezone || getCurrentTimezone()),
    );
  }, [user]);

  if (
    user == null ||
    user.availability == null ||
    shiftedWeeklyAvailability == null ||
    schedule == null
  ) {
    return <Suspense />;
  }

  return (
    <PageContainer>
      <Stack direction="row">
        <Stack spacing={2} maxWidth="sm">
          <Button variant="outlined" onClick={onBack}>
            Back To Schedule
          </Button>
          <TimezonePicker timezone={user.timezone} setTimezone={setTimezone} />
          <Button variant="outlined" onClick={gotoExceptions}>
            Go To Date Specific Availabilities
          </Button>
          <ScheduleInstructions exceptions={false} />
        </Stack>
        <WeeklyCalendar
          availability={shiftedWeeklyAvailability}
          onAvailabilityUpdate={onAvailabilityUpdate}
          scheduleGranularity={schedule.granularity}
        />
      </Stack>
    </PageContainer>
  );
};
