import React, { Suspense, useContext, useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { ScheduleWithIncludes } from '../../../common/types/user';
import { ScheduleContext } from './ScheduleContainer';

export type ScheduleUserContextType = [
  ScheduleWithIncludes['users'][number],
  (newSchedule: ScheduleWithIncludes['users'][number]) => void,
];

// TODO: Using {} as ScheduleUser as a hack so that context consumers don't have to null check.  This isn't safe
export const ScheduleUserContext: React.Context<ScheduleUserContextType> =
  React.createContext([
    null as unknown as ScheduleWithIncludes['users'][number],
    (newScheduleUser: ScheduleWithIncludes['users'][number]) => {},
  ]);

export const ScheduleUserContainer: React.FC = () => {
  const { userId } = useParams();
  const [schedule, setSchedule, forceScheduleRefresh, setUser] =
    useContext(ScheduleContext);

  const parsedUserId = userId && parseInt(userId, 10);

  const user = useMemo(
    () => schedule.users.find((findUser) => findUser.id === parsedUserId),
    [parsedUserId, schedule],
  );

  // TODO: Same issue as above with type safety
  const returnMemo: ScheduleUserContextType = useMemo(() => {
    return [user as ScheduleWithIncludes['users'][number], setUser];
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
