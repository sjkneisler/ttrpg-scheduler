import { ExampleType } from "../../../common/types/example";

const API_ROOT = "http://localhost:3001/";

function get(path: string): Promise<Response> {
	return fetch(API_ROOT + path);
}
export function getExampleData(): Promise<ExampleType[]> {
	return get("exampleData")
		.then(r => r.json())
		.catch((err) => {
			console.error(err);
		});
}

export function getTestDbConnection(): Promise<string> {
	return get("testDbConnection")
		.then(r => r.text());
}