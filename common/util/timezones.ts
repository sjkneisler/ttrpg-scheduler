import { DateTime } from 'luxon';
import { Availability } from '../types/availability-state';

export function shiftAvailabilityByTimezone(
  weekData: Availability[][],
  offsetMinutes: number,
): Availability[][] {
  const shiftAmount: number = offsetMinutes / 15; // Convert offset to 15-minute intervals
  const daysInWeek: number = 7;
  const intervalsPerDay: number = 96; // 24 hours * 4 intervals per hour
  let flattened: number[] = []; // Flatten the week data to simplify shifting

  // Flatten the weekData for easier manipulation
  weekData.forEach((day) => {
    flattened = flattened.concat(day);
  });

  // Shift the flattened array based on the shiftAmount
  if (shiftAmount > 0) {
    for (let i = 0; i < shiftAmount; i++) {
      flattened.unshift(flattened.pop()!); // Move the end to the start
    }
  } else {
    for (let i = 0; i < Math.abs(shiftAmount); i++) {
      flattened.push(flattened.shift()!); // Move the start to the end
    }
  }

  // Rebuild the week data from the shifted flat array
  const newWeekData: Availability[][] = [];
  for (let dayIndex = 0; dayIndex < daysInWeek; dayIndex++) {
    newWeekData.push(
      flattened.slice(
        dayIndex * intervalsPerDay,
        (dayIndex + 1) * intervalsPerDay,
      ),
    );
  }

  return newWeekData;
}

export function getTimezoneOffset(ianaTimezoneName: string): number {
  const now = DateTime.now().setZone(ianaTimezoneName);

  return now.offset;
}

export function getCurrentTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
