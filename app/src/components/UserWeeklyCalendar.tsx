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

export const UserWeeklyCalendar: React.FC = () => {
  const [user, setUser] = useState<UserWithIncludes | null>(null);

  const { userId, scheduleId } = useParams();

  useEffect(() => {
    // eslint-disable-next-line no-void
    void getUser(parseInt(scheduleId!, 10), parseInt(userId!, 10)).then(
      setUser,
    );
  }, []);

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
    navigate(`/schedule/${scheduleId}`);
  };

  const gotoExceptions = () => {
    navigate(`/schedule/${scheduleId}/user/${userId}/exceptions`);
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
        <Stack spacing={2}>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <TimezonePicker timezone={user.timezone} setTimezone={setTimezone} />
          <Button variant="outlined" onClick={gotoExceptions}>
            Go To Date Specific Availabilities
          </Button>
        </Stack>
        <WeeklyCalendar
          availability={shiftedWeeklyAvailability}
          onAvailabilityUpdate={onAvailabilityUpdate}
        />
      </Stack>
    </PageContainer>
  );
};
