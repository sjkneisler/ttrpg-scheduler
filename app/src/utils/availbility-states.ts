import { AvailabilityState } from '../../../common/types/availability-state';

export function getColorFromAvailabilityState(state: AvailabilityState): string {
  switch (state) {
    case AvailabilityState.YELLOW:
      return '#FFFF00';
    case AvailabilityState.RED:
      return '#FF0000';
    case AvailabilityState.GREEN:
      return '#00FF00';
    default:
      return '#FF00FF';
  }
}
