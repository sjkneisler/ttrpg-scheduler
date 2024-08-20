import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import useLocalStorageState from 'use-local-storage-state';
import { ScheduleWithIncludes } from '../../../common/types/user';
import { getScheduleByInviteCode } from '../api/client';

export type ScheduleContextType = [
  ScheduleWithIncludes,
  (newSchedule: ScheduleWithIncludes) => void,
  () => Promise<void>, // Force refresh
  setUser: (updatedUser: ScheduleWithIncludes['users'][number]) => void,
];

// TODO: Using {} as Schedule as a hack so that context consumers don't have to null check.  This isn't safe
export const ScheduleContext: React.Context<ScheduleContextType> =
  React.createContext([
    null as unknown as ScheduleWithIncludes,
    (newSchedule: ScheduleWithIncludes) => {},
    () => Promise.resolve(),
    (updatedUser: ScheduleWithIncludes['users'][number]) => {},
  ]);

export const ScheduleContainer: React.FC = () => {
  const { scheduleInviteCode } = useParams();
  const [schedule, setSchedule] = useState<ScheduleWithIncludes | null>(null);

  const forceRefresh = useMemo(
    () => async () => {
      if (!scheduleInviteCode) {
        return;
      }

      const updatedSchedule = await getScheduleByInviteCode(scheduleInviteCode);
      setSchedule(updatedSchedule);
    },
    [scheduleInviteCode],
  );

  const setUser = (updatedUser: ScheduleWithIncludes['users'][number]) => {
    if (!schedule) {
      return;
    }
    const updatedSchedule = {
      ...schedule,
      users: schedule.users.map((user) => {
        if (user.id === updatedUser.id) {
          return updatedUser;
        }

        return user;
      }),
    };

    setSchedule(updatedSchedule);
  };

  useEffect(() => {
    // eslint-disable-next-line no-void
    void forceRefresh();
  }, [scheduleInviteCode]);

  // TODO: Same issue as above with type safety
  const returnMemo: ScheduleContextType = useMemo(() => {
    return [
      schedule as ScheduleWithIncludes,
      setSchedule,
      forceRefresh,
      setUser,
    ];
  }, [schedule]);

  const [recentScheduleData, setRecentScheduleData] = useLocalStorageState<
    [string, string][]
  >('recentSchedules', { defaultValue: [] });

  useEffect(() => {
    if (schedule === null) {
      return;
    }
    if (
      !recentScheduleData.some(
        ([recentScheduleInviteCode]) =>
          recentScheduleInviteCode === schedule.inviteCode,
      )
    ) {
      const newData: [string, string][] = [
        [schedule.inviteCode, schedule.name],
        ...recentScheduleData,
      ];
      setRecentScheduleData(newData);
    } else {
      const newData: [string, string][] = [
        [schedule.inviteCode, schedule.name],
        ...recentScheduleData.filter(
          ([recentScheduleInviteCode]) =>
            recentScheduleInviteCode !== schedule.inviteCode,
        ),
      ];

      setRecentScheduleData(newData);
    }
  }, [schedule, recentScheduleData, setRecentScheduleData]);

  if (!schedule) {
    return <Suspense />;
  }

  return (
    <ScheduleContext.Provider value={returnMemo}>
      <Outlet />
    </ScheduleContext.Provider>
  );
};
