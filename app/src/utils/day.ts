import { Day } from '@prisma/client';

export function getDayText(day: Day): string {
  switch (day) {
    case Day.SUNDAY:
      return 'Sunday';
    case Day.MONDAY:
      return 'Monday';
    case Day.TUESDAY:
      return 'Tuesday';
    case Day.WEDNESDAY:
      return 'Wednesday';
    case Day.THURSDAY:
      return 'Thursday';
    case Day.FRIDAY:
      return 'Friday';
    case Day.SATURDAY:
      return 'Saturday';
    default:
      throw new Error("shouldn't get here!");
  }
}
