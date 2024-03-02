import { Day } from '../../../common/types/day';

export function getDayText(day: Day): string {
  switch (day) {
    case Day.Sunday:
      return 'Sunday';
    case Day.Monday:
      return 'Monday';
    case Day.Tuesday:
      return 'Tuesday';
    case Day.Wednesday:
      return 'Wednesday';
    case Day.Thursday:
      return 'Thursday';
    case Day.Friday:
      return 'Friday';
    case Day.Saturday:
      return 'Saturday';
    default:
      throw new Error("shouldn't get here!");
  }
}
