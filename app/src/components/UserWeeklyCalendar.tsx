import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WeeklyCalendar } from './WeekyCalendar';
import { UserWithIncludes, WeeklyAvailabilityWithIncludes } from '../../../common/types/user';
import { getUser, updateUser } from '../api/client';

export const UserWeeklyCalendar: React.FC = () => {
  const [user, setUser] = useState<UserWithIncludes | null>(null);

  const {
    userId,
    scheduleId,
  } = useParams();

  useEffect(() => {
    getUser(parseInt(scheduleId!, 10), parseInt(userId!, 10)).then(setUser);
  }, []);

  const onAvailabilityUpdate = (availability: WeeklyAvailabilityWithIncludes) => {
    if (!user) {
      return;
    }
    const updatedUser = {
      ...user,
      availability,
    };
    console.log('Updated User');
    console.log(updatedUser);
    updateUser(updatedUser);
    setUser(updatedUser);
  };

  if (user == null || user.availability == null) {
    return <Suspense />;
  }
  return (
    <div>
      <WeeklyCalendar availability={user.availability} onAvailabilityUpdate={onAvailabilityUpdate} />
    </div>
  );
};
