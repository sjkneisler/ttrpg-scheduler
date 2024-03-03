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

function getJson<T>(path: string): Promise<T> {
  return get(path).then((res) => res.json());
}
function putJson<T>(path: string, body:T): Promise<T> {
  return put(path, body).then((res) => res.json());
}

export async function getUser(scheduleId: number, userId: number): Promise<UserWithIncludes> {
  return getJson(`schedule/${scheduleId}/user/${userId}`);
}

export async function updateUser(user: UserWithIncludes): Promise<UserWithIncludes> {
  return putJson(`schedule/${user.scheduleId}/user/${user.id}`, user);
}
