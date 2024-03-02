import { Example } from '@prisma/client';

const API_ROOT = 'http://localhost:3001/';

function get(path: string): Promise<Response> {
  return fetch(API_ROOT + path);
}

function getJson<T>(path: string): Promise<T> {
  return get(path).then((res) => res.json());
}

export function getExampleData(): Promise<Example[]> {
  return getJson<Example[]>('examples');
}

export async function seed(): Promise<void> {
  await get('seed');
}
