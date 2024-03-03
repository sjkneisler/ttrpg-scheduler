import { Prisma, ScheduleUser } from '@prisma/client';

export type StrippedScheduleUser = Omit<ScheduleUser, 'passwordSalt' | 'passwordSaltIterations' | 'passwordHash'>;

export type UnstrippedUserWithIncludes = Prisma.ScheduleUserGetPayload<{ include: {
  availability: {
    include: {
      days: true,
    },
  },
  schedule: true,
  exceptions: true,
} }>;

export type UserWithIncludes = Omit<UnstrippedUserWithIncludes, 'passwordSalt' | 'passwordSaltIterations' | 'passwordHash'>;

export type WeeklyAvailabilityWithIncludes = Prisma.WeeklyAvailabilityGetPayload<{
  include: {
    days: true,
  },
}>;
