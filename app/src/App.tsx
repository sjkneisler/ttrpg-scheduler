/** @jsxImportSource @emotion/react */
import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserWeeklyCalendar } from './components/UserWeeklyCalendar';
import { Home } from './components/Home';
import { CampaignView } from './components/CampaignView';
import { ExceptionsCalendar } from './components/ExceptionsCalendar';
import { AggregateExceptionsCalendar } from './components/AggregateExceptionsCalendar';
import { NewUserPage } from './components/NewUserPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/schedule/:scheduleInviteCode',
    element: <CampaignView />,
  },
  {
    path: '/schedule/:scheduleInviteCode/invite',
    element: <NewUserPage />,
  },
  {
    path: '/schedule/:scheduleInviteCode/plan',
    element: <AggregateExceptionsCalendar />,
  },
  {
    path: '/schedule/:scheduleInviteCode/user/:userId',
    element: <UserWeeklyCalendar />,
  },
  {
    path: '/schedule/:scheduleInviteCode/user/:userId/exceptions',
    element: <ExceptionsCalendar />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
