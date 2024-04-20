/** @jsxImportSource @emotion/react */
import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserWeeklyCalendar } from './pages/UserWeeklyCalendar';
import { Home } from './pages/Home';
import { CampaignView } from './pages/CampaignView';
import { ExceptionsCalendar } from './pages/ExceptionsCalendar';
import { AggregateExceptionsCalendar } from './pages/AggregateExceptionsCalendar';
import { NewUserPage } from './pages/NewUserPage';
import { AttributionsPage } from './pages/AttributionsPage';
import { ScheduleContainer } from './contexts/ScheduleContainer';
import { ScheduleUserContainer } from './contexts/ScheduleUserContainer';
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
