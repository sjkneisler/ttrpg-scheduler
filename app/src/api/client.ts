import { Example } from "@prisma/client";

const API_ROOT = "http://localhost:3001/";

function get(path: string): Promise<Response> {
	return fetch(API_ROOT + path);
}
export function getExampleData(): Promise<Example[]> {
	return get("examples")
		.then(r => r.json())
		.catch((err) => {
			console.error(err);
		});
}

export async function seed(): Promise<void> {
	await get("seed");
}