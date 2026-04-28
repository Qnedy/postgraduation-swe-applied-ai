import { OpenRouter } from "@openrouter/sdk";
import { config, type ModelConfig } from "./config.ts";
import type { ChatGenerationParams } from "@openrouter/sdk/models";

export type LLMResponse = {
	model: string;
	content: string;
}

export class OpenRouterService {
	private client: OpenRouter;
	private config: ModelConfig;

	constructor(configOverride?: ModelConfig) {
		this.config = configOverride ?? config;

		this.client = new OpenRouter({
			apiKey: config.apiKey,
			httpReferer: config.httpReferer,
			xTitle: config.xTitle
		})
	}

	async generate(propmt: string): Promise<LLMResponse> {
		const response = await this.client.chat.send({
			models: this.config.models,
			messages: [{
				role: "system", content: this.config.systemPrompt
			}, {
				role: "user", content: propmt
			}],
			// nao vai mandar os dados sob demanda, vai agrupar e mandar tudo de uma vez
			stream: false,
			temperature: this.config.temperature,
			maxTokens: this.config.maxTokens,
			provider: this.config.provider as ChatGenerationParams["provider"]
		});

		const content = String(response.choices[0]?.message.content) ?? "";
		console.log(content);
		return {
			model: response.model,
			content
		}
	}
}