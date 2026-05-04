import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.ts";

console.assert(
	process.env.OPENROUTER_API_KEY, 
	"OPENROUTER_API_KEY is not set in env variables"
);

test("command upper transforms messages into UPPERCASE", async () => {
	const app = createServer();

	const msg = "make this message upper!";

	const expected = msg.toUpperCase();

	const response = await app.inject({
		method: "POST",
		url: "/chat",
		body: {
			question: msg
		}
	});

	assert.equal(response.statusCode, 200);
	assert.equal(response.body, expected);
});