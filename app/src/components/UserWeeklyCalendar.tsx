/** @jsxImportSource @emotion/react */
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import { WeeklyCalendar } from './WeekyCalendar';
import { UserWithIncludes } from '../../../common/types/user';
import { getUser, updateUser } from '../api/client';
import { Availability } from '../../../common/types/availability-state';
import {
  getCurrentTimezone,
  getTimezoneOffset,
  shiftAvailabilityByTimezone,
} from '../../../common/util/timezones';
import { PageContainer } from './PageContainer';
import { TimezonePicker } from './TimezonePicker';
import { useSchedule } from '../hooks/useSchedule';
import { ScheduleInstructions } from './ScheduleInstructions';

export const UserWeeklyCalendar: React.FC = () => {
  const [user, setUser] = useState<UserWithIncludes | null>(null);

  const { userId } = useParams();
  const schedule = useSchedule();

  useEffect(() => {
    if (!schedule || !userId) {
      return;
    }

    // eslint-disable-next-line no-void
    void getUser(schedule.id, parseInt(userId, 10)).then(setUser);
  }, [schedule]);

  const onAvailabilityUpdate = async (availability: Availability[][]) => {
    if (!user) {
      return;
    }
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
    navigate(`/schedule/${schedule?.inviteCode}/user/${userId}/exceptions`);
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
    shiftedWeeklyAvailability == null
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
        />
      </Stack>
    </PageContainer>
  );
};
