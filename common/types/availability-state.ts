export enum AvailabilityState {
  GREEN,
  YELLOW,
  RED,
}

// TODO: Revisit these types to be better but still space efficient in the database
export type DayAvailability = AvailabilityState[];
export type WeekAvailability = DayAvailability[];
