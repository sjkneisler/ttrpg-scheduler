export type UserAvailability = {
  weekly: Availability[][];
  exceptions: AvailabilityException[];
};

export enum Availability {
  Green,
  Yellow,
  Red,
}

export type AvailabilityException = {
  startTime: string;
  endTime: string;
  availability: Availability;
};

export type AggregateAvailability = string[][];
