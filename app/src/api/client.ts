import { Schedule } from '@prisma/client';
import {
  ScheduleWithIncludes,
  UserWithIncludes,
} from '../../../common/types/user';

const API_ROOT = process.env.REACT_APP_SERVER_URL || 'http://localhost:443/';

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
  return get(path).then((res) => res.json()) as Promise<T>;
}

function putJson<T, U>(path: string, body: T): Promise<U> {
  return put(path, body).then((res) => res.json()) as Promise<U>;
}

function postJson<T, U>(path: string, body: T): Promise<U> {
  return post(path, body).then((res) => res.json()) as Promise<U>;
}

export async function getUser(
  scheduleId: number,
  userId: number,
): Promise<UserWithIncludes> {
  return getJson(`schedule/${scheduleId}/user/${userId}`);
}

export async function updateUser(
  user: UserWithIncludes,
): Promise<UserWithIncludes> {
  return putJson(`schedule/${user.scheduleId}/user/${user.id}`, user);
}

export async function createSchedule(name: string): Promise<Schedule> {
  return postJson('schedule', {
    name,
  });
}

export async function createUser(
  scheduleId: number,
  name: string,
  timezone: string,
): Promise<UserWithIncludes> {
  return postJson(`schedule/${scheduleId}/user`, {
    name,
    timezone,
  });
}

export async function getSchedule(
  scheduleId: number,
): Promise<ScheduleWithIncludes> {
  return getJson(`schedule/${scheduleId}`);
}
