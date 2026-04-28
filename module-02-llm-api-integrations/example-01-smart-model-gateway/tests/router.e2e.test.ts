import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.ts";

import { config } from "../src/config.ts";
import { type LLMResponse, OpenRouterService } from "../src/openRouterService.ts";

console.assert(
	process.env.OPENROUTER_API_KEY, 
	"OPENROUTER_API_KEY is not set in env variables"
);

test("Router to cheapest model by default", async () => {
	const customCongif = {
		...config,
		provider: {
			...config.provider,
			sort: {
				...config.provider.sort,
				by: "price"
			}
		}
	};

	const routerService = new OpenRouterService(customCongif);

	const app = createServer(routerService);

	const response = await app.inject({
		method: "POST",
		url: "/chat",
		body: {
			question: "What is the meaning of life?"
		}
	});

	assert.equal(response.statusCode, 200);
	const body = response.json() as LLMResponse;
	assert.equal(body.model, "nvidia/nemotron-3-nano-30b-a3b:free");

});
test("Router to highest throughput model by default", async () => {
	const customCongif = {
		...config,
		provider: {
			...config.provider,
			sort: {
				...config.provider.sort,
				by: "throughput"
			}
		}
	};

	const routerService = new OpenRouterService(customCongif);

	const app = createServer(routerService);

	const response = await app.inject({
		method: "POST",
		url: "/chat",
		body: {
			question: "What is the meaning of life?"
		}
	});

	assert.equal(response.statusCode, 200);
	const body = response.json() as LLMResponse;
	assert.equal(body.model, "nvidia/nemotron-3-nano-30b-a3b:free");
});