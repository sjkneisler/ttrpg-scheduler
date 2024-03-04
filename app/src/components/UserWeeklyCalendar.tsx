/** @jsxImportSource @emotion/react */
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { css } from '@emotion/react';
import { WeeklyCalendar } from './WeekyCalendar';
import { UserWithIncludes } from '../../../common/types/user';
import { getUser, updateUser } from '../api/client';
import { Availability } from '../../../common/types/availability-state';
import {
  getCurrentTimezone,
  getTimezoneOffset,
  shiftAvailabilityByTimezone,
} from '../../../common/util/timezones';

const timezones = Intl.supportedValuesOf('timeZone');

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

  const setTimezone = (
    timezoneChangeEvent: SelectChangeEvent<string | null>,
  ) => {
    if (!user) {
      return;
    }
    const newTimezone = timezoneChangeEvent.target.value!;
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
    <div
      css={css`
        display: flex;
        flex-direction: row;
      `}
    >
      <div
        css={css`
          flex: 1 1 auto;
        `}
      >
        <Typography variant="h4">Schedule: {user.schedule.name}</Typography>
        <Typography variant="h4">User: {user.name}</Typography>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Select value={user.timezone} onChange={setTimezone}>
          {timezones.map((timezone) => (
            <MenuItem value={timezone}>{timezone}</MenuItem>
          ))}
        </Select>
        <Button variant="outlined" onClick={gotoExceptions}>
          Go To Date Specific Availabilities
        </Button>
      </div>
      <div
        css={css`
          flex: 1 1 auto;
        `}
      >
        <WeeklyCalendar
          availability={shiftedWeeklyAvailability}
          onAvailabilityUpdate={onAvailabilityUpdate}
        />
      </div>
    </div>
  );
};
