import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WeeklyCalendar } from './WeekyCalendar';
import { UserWithIncludes } from '../../../common/types/user';
import { getUser } from '../api/client';

export const UserWeeklyCalendar: React.FC = () => {
  const [user, setUser] = useState<UserWithIncludes | null>(null);

  const {
    userId,
    scheduleId,
  } = useParams();

  useEffect(() => {
    getUser(parseInt(scheduleId!, 10), parseInt(userId!, 10)).then(setUser);
  }, []);

  if (user == null || user.availability == null) {
    return <Suspense />;
  }
  return (
    <div>
      <WeeklyCalendar availability={user.availability} onAvailabilityUpdate={() => null} />
    </div>
  );
};
