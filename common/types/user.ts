import { Prisma, ScheduleUser } from '@prisma/client';

export type StrippedScheduleUser = Omit<
  ScheduleUser,
  'passwordSalt' | 'passwordSaltIterations' | 'passwordHash'
>;

export type UnstrippedUserWithIncludes = Prisma.ScheduleUserGetPayload<{
  include: {
    schedule: true;
  };
}>;

export type UserWithIncludes = Omit<
  UnstrippedUserWithIncludes,
  'passwordSalt' | 'passwordSaltIterations' | 'passwordHash'
>;

export type ScheduleWithIncludes = Prisma.ScheduleGetPayload<{
  include: {
    users: true;
  };
}>;
