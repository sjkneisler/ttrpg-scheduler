import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUser } from '../api/client';
import { UserWithIncludes } from '../../../common/types/user';

export const useSchedule = (): UserWithIncludes | null => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserWithIncludes | null>(null);
  const schedule = useSchedule();

  if (!userId || !schedule) {
    return null;
  }

  const parsedUserId = parseInt(userId!, 10);

  useEffect(() => {
    if (!parsedUserId) {
      return;
    }

    getUser(schedule.id, parsedUserId).then((fetchedUser) => setUser(fetchedUser));
  }, [userId]);

  return user;
};
