import _ from 'lodash';
import { ScheduleWithIncludes } from '../../../common/types/user';
import { AggregateAvailability, Availability } from '../../../common/types/availability-state';

function availabilityToGradient(availability: Availability): number {
  switch (availability) {
    case Availability.Green:
      return 0;
    case Availability.Yellow:
      return 0.5;
    case Availability.Red:
      return 1;
    default:
      return -1;
  }
}

function getColorForGradient(value: number) {
  const hue = ((1 - value) * 120).toString(10);
  return ['hsl(', hue, ',100%,50%)'].join('');
}

export function aggregateAvailability(schedule: ScheduleWithIncludes): AggregateAvailability {
  const userAvailabilities = schedule.users.map((user) => user.availability.weekly);

  return _.times(7, (day) => _.times(96, (time) => {
    const gradient = userAvailabilities.reduce((acc, cur) => acc + availabilityToGradient(cur[day][time]), 0) / userAvailabilities.length;
    return getColorForGradient(gradient);
  }));
}
