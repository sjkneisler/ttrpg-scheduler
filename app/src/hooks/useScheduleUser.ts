import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUser } from '../api/client';
import { UserWithIncludes } from '../../../common/types/user';
import { useSchedule } from './useSchedule';

export const useScheduleUser = (): UserWithIncludes | null => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserWithIncludes | null>(null);
  const schedule = useSchedule();

  const parsedUserId = userId && parseInt(userId, 10);

  useEffect(() => {
    if (!parsedUserId || !schedule || !userId) {
      return;
    }

    // eslint-disable-next-line no-void
    void getUser(schedule.id, parsedUserId).then((fetchedUser) =>
      setUser(fetchedUser),
    );
  }, [userId, schedule]);

  if (!userId || !schedule) {
    return null;
  }

  return user;
};
