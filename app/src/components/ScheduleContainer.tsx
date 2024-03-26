import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { ScheduleWithIncludes } from '../../../common/types/user';
import { getScheduleByInviteCode } from '../api/client';

export type ScheduleContextType = [
  ScheduleWithIncludes,
  (newSchedule: ScheduleWithIncludes) => void,
  () => void, // Force refresh
];

// TODO: Using {} as Schedule as a hack so that context consumers don't have to null check.  This isn't safe
export const ScheduleContext: React.Context<ScheduleContextType> =
  React.createContext([
    null as unknown as ScheduleWithIncludes,
    (newSchedule: ScheduleWithIncludes) => {},
    () => {},
  ]);

export const ScheduleContainer: React.FC = () => {
  const { scheduleInviteCode } = useParams();
  const [schedule, setSchedule] = useState<ScheduleWithIncludes | null>(null);

  const forceRefresh = useMemo(
    () => () => {
      if (!scheduleInviteCode) {
        return;
      }

      // eslint-disable-next-line no-void
      void getScheduleByInviteCode(scheduleInviteCode).then((fetchedSchedule) =>
        setSchedule(fetchedSchedule),
      );
    },
    [scheduleInviteCode],
  );

  useEffect(() => {
    forceRefresh();
  }, [scheduleInviteCode]);

  // TODO: Same issue as above with type safety
  const returnMemo: ScheduleContextType = useMemo(() => {
    return [schedule as ScheduleWithIncludes, setSchedule, forceRefresh];
  }, [schedule]);

  if (!schedule) {
    return <Suspense />;
  }

  return (
    <ScheduleContext.Provider value={returnMemo}>
      <Outlet />
    </ScheduleContext.Provider>
  );
};
