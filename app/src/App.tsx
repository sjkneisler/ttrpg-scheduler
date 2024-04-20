/** @jsxImportSource @emotion/react */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserWeeklyCalendar } from './components/UserWeeklyCalendar';
import { Home } from './components/Home';
import { CampaignView } from './components/CampaignView';
import { ExceptionsCalendar } from './components/ExceptionsCalendar';
import { AggregateExceptionsCalendar } from './components/AggregateExceptionsCalendar';
import { NewUserPage } from './components/NewUserPage';
import { AttributionsPage } from './components/AttributionsPage';
import { ScheduleContainer } from './components/ScheduleContainer';
import { ScheduleUserContainer } from './components/ScheduleUserContainer';
import { darkTheme } from './themes/dark';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/schedule/:scheduleInviteCode',
    element: <ScheduleContainer />,
    children: [
      {
        path: '',
        element: <CampaignView />,
      },
      {
        path: 'invite',
        element: <NewUserPage />,
      },
      {
        path: 'plan',
        element: <AggregateExceptionsCalendar />,
      },
      {
        path: 'user/:userId',
        element: <ScheduleUserContainer />,
        children: [
          {
            path: '',
            element: <UserWeeklyCalendar />,
          },
          {
            path: 'exceptions',
            element: <ExceptionsCalendar />,
          },
        ],
      },
    ],
  },
  {
    path: '/attributions',
    element: <AttributionsPage />,
  },
]);

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
