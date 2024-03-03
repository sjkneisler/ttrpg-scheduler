import { useParams } from 'react-router-dom';
import { Schedule } from '@prisma/client';
import { useEffect, useState } from 'react';
import { getSchedule } from '../api/client';

export const useSchedule = (): Schedule | null => {
  const { scheduleId } = useParams();
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  if (!scheduleId) {
    return null;
  }

  const parsedScheduleId = parseInt(scheduleId!, 10);

  useEffect(() => {
    if (!parsedScheduleId) {
      return;
    }

    getSchedule(parsedScheduleId).then((fetchedSchedule) => setSchedule(fetchedSchedule));
  }, [scheduleId]);

  return schedule;
};
