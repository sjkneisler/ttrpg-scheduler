import { Schedule } from '@prisma/client';
import { UserWithIncludes } from '../../../common/types/user';

const API_ROOT = 'http://localhost:3001/';

function get(path: string): Promise<Response> {
  return fetch(API_ROOT + path);
}

function put(path: string, body: any): Promise<Response> {
  return fetch(API_ROOT + path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function post(path: string, body: any): Promise<Response> {
  return fetch(API_ROOT + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function getJson<T>(path: string): Promise<T> {
  return get(path).then((res) => res.json());
}

function putJson<T, U>(path: string, body: T): Promise<U> {
  return put(path, body).then((res) => res.json());
}

function postJson<T, U>(path: string, body: T): Promise<U> {
  return post(path, body).then((res) => res.json());
}

export async function getUser(scheduleId: number, userId: number): Promise<UserWithIncludes> {
  return getJson(`schedule/${scheduleId}/user/${userId}`);
}

export async function updateUser(user: UserWithIncludes): Promise<UserWithIncludes> {
  return putJson(`schedule/${user.scheduleId}/user/${user.id}`, user);
}

export async function createSchedule(name: string): Promise<Schedule> {
  return postJson('schedule', {
    name,
  });
}

export async function createUser(scheduleId: number, name: string): Promise<UserWithIncludes> {
  return postJson(`schedule/${scheduleId}/user`, {
    name,
  });
}

export async function getSchedule(scheduleId: number): Promise<Schedule> {
  return getJson(`schedule/${scheduleId}`);
}