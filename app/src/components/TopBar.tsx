/** @jsxImportSource @emotion/react */
import { AppBar, Toolbar, Typography } from '@mui/material';
import { css } from '@emotion/react';
import React from 'react';
import { useSchedule } from '../hooks/useSchedule';
import { useScheduleUser } from '../hooks/useScheduleUser';

export const TopBar: React.FC = () => {
  const schedule = useSchedule();
  const user = useScheduleUser();

  return (
    <AppBar
      position="relative"
      css={css`
        flex: 0 0 auto;
      `}
    >
      <Toolbar
        css={css`
          gap: 30px;
        `}
      >
        <Typography variant="h4">TTRPG Scheduler</Typography>
        {schedule && (
          <Typography variant="h5">Schedule: {schedule.name}</Typography>
        )}
        {user && <Typography variant="h5">User: {user.name}</Typography>}
      </Toolbar>
    </AppBar>
  );
};
