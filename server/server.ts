import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { ExampleType } from "../common/types/example";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.SERVER_PORT || 3000;
app.use(cors());

app.get("/", (req: Request, res: Response) => {
	res.send("Express + TypeScript Server");
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});

app.get<{},ExampleType[]>("/exampleData", (req, res) => {
	res.status(200).send([{
		foo: "hi",
		bar: 5,
	}, {
		foo: "bye",
		bar: 7,
	}]);
})