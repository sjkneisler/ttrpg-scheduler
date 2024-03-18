/** @jsxImportSource @emotion/react */
import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserWeeklyCalendar } from './components/UserWeeklyCalendar';
import { Home } from './components/Home';
import { CampaignView } from './components/CampaignView';
import { ExceptionsCalendar } from './components/ExceptionsCalendar';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/schedule/:scheduleId',
    element: <CampaignView />,
  },
  {
    path: '/schedule/:scheduleId/user/:userId',
    element: <UserWeeklyCalendar />,
  },
  {
    path: '/schedule/:scheduleId/user/:userId/exceptions',
    element: <ExceptionsCalendar />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
