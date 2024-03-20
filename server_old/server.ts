import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient, Schedule, ScheduleUser } from '@prisma/client';
import crypto from 'crypto';
import _ from 'lodash';
import {
  StrippedScheduleUser,
  UnstrippedUserWithIncludes,
  UserWithIncludes,
} from '../common/types/user';
import { Availability } from '../common/types/availability-state';

dotenv.config();

declare global {
  namespace PrismaJson {
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
  }
}

const app: Express = express();
const port = process.env.SERVER_PORT || 3000;
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.status(200).json('Server status OK');
});

app.post<
  {},
  {},
  {
    name: string;
  }
>('/schedule', async (req, res) => {
  const data = await prisma.schedule.create({
    data: {
      name: req.body.name,
      inviteCode: crypto.randomBytes(10).toString('hex'),
    },
  });
  res.status(200).json(data);
});

function stripUser(user: ScheduleUser): StrippedScheduleUser {
  return _.omit(user, 'passwordSalt', 'passwordSaltIterations', 'passwordHash');
}

function stripUserWithIncludes(
  user: UnstrippedUserWithIncludes,
): UserWithIncludes {
  return _.omit(user, 'passwordSalt', 'passwordSaltIterations', 'passwordHash');
}

app.post<
  {
    id: string;
  },
  StrippedScheduleUser,
  {
    name: string;
    timezone: string;
    password: string | undefined;
  }
>('/schedule/:id/user', async (req, res) => {
  const baseUser = {
    scheduleId: parseInt(req.params.id, 10),
    name: req.body.name,
    timezone: req.body.timezone,
    availability: {
      weekly: _.times(7, () => _.times(96, () => Availability.Green)),
      exceptions: [],
    },
  };

  if (req.body.password) {
    const salt = crypto.randomBytes(128).toString('base64');
    const iterations = 10000;
    const hash = crypto.pbkdf2Sync(
      req.body.password,
      salt,
      iterations,
      64,
      'sha512',
    );

    const user = await prisma.scheduleUser.create({
      data: {
        ...baseUser,
        passwordHash: hash.toString(),
        passwordSalt: salt,
        passwordSaltIterations: iterations,
      },
    });

    const strippedResult = stripUser(user);

    res.status(200).json(strippedResult);
  } else {
    const user = await prisma.scheduleUser.create({
      data: baseUser,
    });

    const strippedResult = stripUser(user);

    res.status(200).json(strippedResult);
  }
});

app.get<{ id: string }, Schedule, {}>('/schedule/:id', async (req, res) => {
  const schedule = await prisma.schedule.findFirstOrThrow({
    where: {
      id: parseInt(req.params.id, 10),
    },
    include: {
      users: true,
    },
  });
  res.status(200).json(schedule);
});

app.put<
  {
    id: string;
    userId: string;
  },
  UserWithIncludes,
  UserWithIncludes,
  UserWithIncludes
>('/schedule/:id/user/:userId', async (req, res) => {
  const result = await prisma.scheduleUser.update({
    where: {
      id: req.body.id,
    },
    data: _.omit(req.body, 'schedule'),
    include: {
      schedule: true,
    },
  });

  res.status(200).json(result);
});

app.get<
  {
    id: string;
    userId: string;
  },
  StrippedScheduleUser,
  {}
>('/schedule/:id/user/:userId', async (req, res) => {
  const user = await prisma.scheduleUser.findFirstOrThrow({
    where: {
      id: parseInt(req.params.userId, 10),
    },
    include: {
      schedule: true,
    },
  });

  const strippedUser = stripUser(user);

  res.status(200).json(strippedUser);
});

app.get<
  {},
  Schedule,
  {
    inviteCode: string;
  }
>('/scheduleByInviteCode', async (req, res) => {
  const schedule = await prisma.schedule.findFirstOrThrow({
    where: {
      inviteCode: req.body.inviteCode,
    },
    include: {
      users: true,
    },
  });

  res.status(200).json(schedule);
});

app.get<
  {
    scheduleId: string;
  },
  ScheduleUser[]
>('/schedule/:scheduleId/users', async (req, res) => {
  const users = await prisma.scheduleUser.findMany({
    where: {
      scheduleId: parseInt(req.params.scheduleId, 10),
    },
  });

  res.status(200).json(users);
});
