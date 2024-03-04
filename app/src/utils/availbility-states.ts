import { Availability } from '../../../common/types/availability-state';

export function getColorFromAvailabilityState(
  state: Availability | string,
): string {
  if (typeof state === 'string') {
    return state;
  }
  switch (state) {
    case Availability.Yellow:
      return '#FFFF00';
    case Availability.Red:
      return '#FF0000';
    case Availability.Green:
      return '#00FF00';
    default:
      return '#FF00FF';
  }
}
