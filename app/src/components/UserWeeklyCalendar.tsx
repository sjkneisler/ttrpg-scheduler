/** @jsxImportSource @emotion/react */
import React, { Suspense, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { css } from '@emotion/react';
import { WeeklyCalendar } from './WeekyCalendar';
import { UserWithIncludes } from '../../../common/types/user';
import { getUser, updateUser } from '../api/client';
import { Availability } from '../../../common/types/availability-state';

export const UserWeeklyCalendar: React.FC = () => {
  const [user, setUser] = useState<UserWithIncludes | null>(null);

  const {
    userId,
    scheduleId,
  } = useParams();

  useEffect(() => {
    getUser(parseInt(scheduleId!, 10), parseInt(userId!, 10)).then(setUser);
  }, []);

  const onAvailabilityUpdate = (availability: Availability[][]) => {
    if (!user) {
      return;
    }
    const updatedUser = {
      ...user,
      availability: {
        ...user.availability,
        weekly: availability,
      },
    };
    updateUser(updatedUser);
    setUser(updatedUser);
  };

  const navigate = useNavigate();

  const onBack = () => {
    navigate(`/schedule/${scheduleId}`);
  };

  if (user == null || user.availability == null) {
    return <Suspense />;
  }
  return (
    <div css={css`
            display: flex;
            flex-direction: row;
        `}
    >
      <div css={css`
                flex: 1 1 auto;
            `}
      >
        <Typography variant="h4">
          Schedule:
          {' '}
          {user.schedule.name}
        </Typography>
        <Typography variant="h4">
          User:
          {' '}
          {user.name}
        </Typography>
        <Button variant="outlined" onClick={onBack}>Back</Button>
      </div>
      <div css={css`
                flex: 1 1 auto;
            `}
      >
        <WeeklyCalendar availability={user.availability.weekly} onAvailabilityUpdate={onAvailabilityUpdate} />
      </div>
    </div>
  );
};
