import { ExampleType } from "../../../common/types/example";

const API_ROOT = "http://localhost:3001/";

export function getExampleData(): Promise<ExampleType[]> {
	return fetch(API_ROOT + "exampleData")
		.then(r => r.json())
		.catch((err) => {
			console.error(err);
		});
}