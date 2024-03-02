/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import './App.css';
import { WeeklyCalendar } from './components/WeekyCalendar';

function App() {
  return (
    <div css={css`
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
    `}
    >
      <AppBar
        position="relative"
        css={css`
        flex: 0 0  auto;
      `}
      >
        <Toolbar>
          <Typography variant="h4">
            TTRPG Scheduler
          </Typography>
        </Toolbar>
      </AppBar>

      <div css={css`
          flex: 1 1 auto
            `}
      >
        <WeeklyCalendar />
      </div>
    </div>
  );
}

export default App;
