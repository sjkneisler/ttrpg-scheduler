import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Example, PrismaClient } from '@prisma/client';

dotenv.config();

const app: Express = express();
const port = process.env.SERVER_PORT || 3000;
app.use(cors());

const prisma = new PrismaClient();

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get<{}, Example[]>('/examples', async (req, res) => {
  const examples = await prisma.example.findMany();
  return res.status(200).json(examples);
});

app.get('/seed', async (req, res) => {
  await prisma.example.createMany({
    data: [{
      foo: 'bar',
      bar: 5,
    }, {
      foo: 'pizza',
      bar: 42,
    }],
  });
  return res.status(200);
});
