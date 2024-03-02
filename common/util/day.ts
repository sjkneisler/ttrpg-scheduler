import { Day } from '@prisma/client';

export function getNumberForDay(day: Day): number {
  switch (day) {
    case 'SUNDAY':
      return 0;
    case 'MONDAY':
      return 1;
    case 'TUESDAY':
      return 2;
    case 'WEDNESDAY':
      return 3;
    case 'THURSDAY':
      return 4;
    case 'FRIDAY':
      return 5;
    case 'SATURDAY':
      return 6;
    default:
      throw new Error('Invalid day');
  }
}

export function getDayForNumber(day: number): Day {
  switch (day) {
    case 0:
      return Day.SUNDAY;
    case 1:
      return Day.MONDAY;
    case 2:
      return Day.TUESDAY;
    case 3:
      return Day.WEDNESDAY;
    case 4:
      return Day.THURSDAY;
    case 5:
      return Day.FRIDAY;
    case 6:
      return Day.SATURDAY;
    default:
      throw new Error('Invalid day');
  }
}
