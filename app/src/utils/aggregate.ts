import _ from 'lodash';
import { ScheduleWithIncludes } from '../../../common/types/user';
import {
  AggregateAvailability,
  Availability,
} from '../../../common/types/availability-state';
import { AggregationType } from '../../../common/types/aggregation-type';
import { shiftAvailabilityByTimezone } from '../../../common/util/timezones';

function availabilityToGradient(availability: Availability): number {
  switch (availability) {
    case Availability.Green:
      return 0;
    case Availability.Yellow:
      return 0.5;
    case Availability.Red:
      return 1;
    default:
      console.log(
        "Returning default value for availability gradient (this shouldn't be reached",
      );
      return -1;
  }
}

function getColorForGradient(value: number) {
  const hue = ((1 - value) * 120).toString(10);
  return ['hsl(', hue, ',100%,50%)'].join('');
}

export function aggregateUserAvailabilities(
  userAvailabilities: Availability[][][],
  aggregationType: AggregationType,
): AggregateAvailability {
  return _.times(7, (day) =>
    _.times(96, (time) => {
      if (aggregationType === AggregationType.Average) {
        const gradient =
          userAvailabilities.reduce(
            (acc, cur) => acc + availabilityToGradient(cur[day][time]),
            0,
          ) / userAvailabilities.length;
        return getColorForGradient(gradient);
      } // Aggregation type Common
      const availabilities = userAvailabilities.map((user) => user[day][time]);
      // TODO: Fix this hacky nonsense
      if (availabilities.some((a) => a === Availability.Red)) {
        return '#ff0000';
      }
      if (availabilities.some((a) => a === Availability.Yellow)) {
        return '#ffff00';
      }
      return '#00ff00';
    }),
  );
}

export function aggregateAvailability(
  schedule: ScheduleWithIncludes,
  aggregationType: AggregationType,
  timezoneOffset: number,
): AggregateAvailability {
  const userAvailabilities = schedule.users
    .map((user) => user.availability.weekly)
    .map((weeklyAvailability) =>
      shiftAvailabilityByTimezone(weeklyAvailability, timezoneOffset),
    );

  return aggregateUserAvailabilities(userAvailabilities, aggregationType);
}
