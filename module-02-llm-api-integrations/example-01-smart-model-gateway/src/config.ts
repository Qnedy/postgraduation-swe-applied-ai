console.assert(
	process.env.OPENROUTER_API_KEY, 
	"OPENROUTER_API_KEY is not set in env variables"
);

export type ModelConfig = {
	apiKey: string;
	httpReferer: string;
	xTitle: string;
	port: number;
	models: string[];
	temperature: number;
	maxTokens: number;
	systemPrompt: string;

	provider: {
		sort: {
			by: string;
			partition: string;
		}
	}
}

export const config: ModelConfig = {
	apiKey: process.env.OPENROUTER_API_KEY!,
	httpReferer: "http://pos-ia.com",
	xTitle: "SmartModelRouterGateway",
	port: 3000,
	models: [
		// top 4 para a listagem ordenada por preço
		"google/gemma-4-26b-a4b-it:free"
	],
	temperature: 0.2,
	maxTokens: 50,
	systemPrompt: "You are a helpful assistant.",

	provider: {
		sort: {
			by: "price", // latency, throughput
			partition: "none" // ou "model"
		}
	}
};