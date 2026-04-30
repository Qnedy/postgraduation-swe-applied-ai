import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.ts";

console.assert(
	process.env.OPENROUTER_API_KEY, 
	"OPENROUTER_API_KEY is not set in env variables"
);

test("Router to cheapest model by default", async () => {
	const app = createServer();

	const response = await app.inject({
		method: "POST",
		url: "/chat",
		body: {
			question: "What is the meaning of life?"
		}
	});

	assert.equal(response.statusCode, 200);
});