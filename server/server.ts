import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {
  Availability, Day, PrismaClient, Schedule, ScheduleUser,
} from '@prisma/client';
import crypto from 'crypto';
import _ from 'lodash';

dotenv.config();

const app: Express = express();
const port = process.env.SERVER_PORT || 3000;
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.post<{}, {}, {
  name: string
}>('/schedule', async (req, res) => {
  const data = await prisma.schedule.create({
    data: {
      name: req.body.name,
      inviteCode: crypto.randomBytes(10).toString('hex'),
    },
  });
  res.status(200).json(data);
});

app.post<{
  id: string
}, StrippedScheduleUser, {
  name: string,
  password: string | undefined,
}>('/schedule/:id/user', async (req, res) => {
  const baseUser = {
    scheduleId: parseInt(req.params.id, 10),
    name: req.body.name,
    availability: {
      create: {
        days: {
          create: [
            {
              day: Day.SUNDAY,
              availability: _.times(96, () => Availability.GREEN),
            },
            {
              day: Day.MONDAY,
              availability: _.times(96, () => Availability.GREEN),
            },
            {
              day: Day.TUESDAY,
              availability: _.times(96, () => Availability.GREEN),
            },
            {
              day: Day.WEDNESDAY,
              availability: _.times(96, () => Availability.GREEN),
            },
            {
              day: Day.THURSDAY,
              availability: _.times(96, () => Availability.GREEN),
            },
            {
              day: Day.FRIDAY,
              availability: _.times(96, () => Availability.GREEN),
            },
            {
              day: Day.SATURDAY,
              availability: _.times(96, () => Availability.GREEN),
            },
          ],
        },
      },
    },
  };

  if (req.body.password) {
    const salt = crypto.randomBytes(128).toString('base64');
    const iterations = 10000;
    const hash = crypto.pbkdf2Sync(req.body.password, salt, iterations, 64, 'sha512');

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
  });
  res.status(200).json(schedule);
});

export type StrippedScheduleUser = Omit<ScheduleUser, 'passwordSalt' | 'passwordSaltIterations' | 'passwordHash'>;

function stripUser(user: ScheduleUser): StrippedScheduleUser {
  return _.omit(user, 'passwordSalt', 'passwordSaltIterations', 'passwordHash');
}
app.put<{
  id: string,
  userId: string,
}, StrippedScheduleUser, StrippedScheduleUser>('/schedule/:id/user/:userId', async (req, res) => {
  const result = await prisma.scheduleUser.update({
    where: {
      id: parseInt(req.params.userId, 10),
    },
    data: req.body,
  });

  const strippedResult = stripUser(result);

  res.status(200).json(strippedResult);
});

app.get<{
  id: string,
  userId: string,
}, StrippedScheduleUser, {}>('/schedule/:id/user/:userId', async (req, res) => {
  const user = await prisma.scheduleUser.findFirstOrThrow({
    where: {
      id: parseInt(req.params.userId, 10),
    },
    include: {
      availability: {
        include: {
          days: true,
        },
      },
      schedule: true,
      exceptions: true,
    },
  });

  const strippedUser = stripUser(user);

  res.status(200).json(strippedUser);
});
