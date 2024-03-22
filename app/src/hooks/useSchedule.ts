import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSchedule, getScheduleByInviteCode } from '../api/client';
import { ScheduleWithIncludes } from '../../../common/types/user';

export const useSchedule = (): ScheduleWithIncludes | null => {
  const { scheduleInviteCode } = useParams();
  const [schedule, setSchedule] = useState<ScheduleWithIncludes | null>(null);

  useEffect(() => {
    if (!scheduleInviteCode) {
      return;
    }

    // eslint-disable-next-line no-void
    void getScheduleByInviteCode(scheduleInviteCode).then((fetchedSchedule) =>
      setSchedule(fetchedSchedule),
    );
  }, [scheduleInviteCode]);

  if (!scheduleInviteCode) {
    return null;
  }

  return schedule;
};
