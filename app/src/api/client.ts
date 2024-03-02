import { UserWithIncludes } from '../../../common/types/user';

const API_ROOT = 'http://localhost:3001/';

function get(path: string): Promise<Response> {
  return fetch(API_ROOT + path);
}

function getJson<T>(path: string): Promise<T> {
  return get(path).then((res) => res.json());
}

export async function getUser(scheduleId: number, userId: number): Promise<UserWithIncludes> {
  return getJson(`schedule/${scheduleId}/user/${userId}`);
}
