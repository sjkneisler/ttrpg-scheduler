import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSchedule } from '../api/client';
import { ScheduleWithIncludes } from '../../../common/types/user';

export const useSchedule = (): ScheduleWithIncludes | null => {
  const { scheduleId } = useParams();
  const [schedule, setSchedule] = useState<ScheduleWithIncludes | null>(null);

  if (!scheduleId) {
    return null;
  }

  const parsedScheduleId = parseInt(scheduleId, 10);

  useEffect(() => {
    if (!parsedScheduleId) {
      return;
    }

    // eslint-disable-next-line no-void
    void getSchedule(parsedScheduleId).then((fetchedSchedule) =>
      setSchedule(fetchedSchedule),
    );
  }, [scheduleId]);

  return schedule;
};
