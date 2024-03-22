import React, {
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { UserWithIncludes } from '../../../common/types/user';
import { getUser } from '../api/client';
import { ScheduleContext } from './ScheduleContainer';

export type ScheduleUserContextType = [
  UserWithIncludes,
  (newSchedule: UserWithIncludes) => void,
];

// TODO: Using {} as ScheduleUser as a hack so that context consumers don't have to null check.  This isn't safe
export const ScheduleUserContext: React.Context<ScheduleUserContextType> =
  React.createContext([
    null as unknown as UserWithIncludes,
    (newScheduleUser: UserWithIncludes) => {},
  ]);

export const ScheduleUserContainer: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserWithIncludes | null>(null);
  const [schedule] = useContext(ScheduleContext);

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

  // TODO: Same issue as above with type safety
  const returnMemo: ScheduleUserContextType = useMemo(() => {
    return [user as UserWithIncludes, setUser];
  }, [user]);

  if (!user) {
    return <Suspense />;
  }

  return (
    <ScheduleUserContext.Provider value={returnMemo}>
      <Outlet />
    </ScheduleUserContext.Provider>
  );
};
