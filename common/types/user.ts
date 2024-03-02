import { Prisma, ScheduleUser } from '@prisma/client';

export type StrippedScheduleUser = Omit<ScheduleUser, 'passwordSalt' | 'passwordSaltIterations' | 'passwordHash'>;

export type UserWithIncludes = Omit<Prisma.ScheduleUserGetPayload<{ include: {
  availability: {
    include: {
      days: true,
    },
  },
  schedule: true,
  exceptions: true,
} }>, 'passwordSalt' | 'passwordSaltIterations' | 'passwordHash'>;

export type WeeklyAvailabilityWithIncludes = Prisma.WeeklyAvailabilityGetPayload<{
  include: {
    days: true,
  },
}>;
