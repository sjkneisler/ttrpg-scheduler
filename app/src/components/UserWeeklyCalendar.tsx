import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

  if (user == null || user.availability == null) {
    return <Suspense />;
  }
  return (
    <div>
      <WeeklyCalendar availability={user.availability.weekly} onAvailabilityUpdate={onAvailabilityUpdate} />
    </div>
  );
};
