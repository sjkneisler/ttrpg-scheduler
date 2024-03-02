import { Availability } from '@prisma/client';

export function getColorFromAvailabilityState(state: Availability): string {
  switch (state) {
    case Availability.YELLOW:
      return '#FFFF00';
    case Availability.RED:
      return '#FF0000';
    case Availability.GREEN:
      return '#00FF00';
    default:
      return '#FF00FF';
  }
}
