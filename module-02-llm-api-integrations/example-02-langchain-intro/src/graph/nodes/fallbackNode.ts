import { AIMessage } from "langchain";
import type { GraphState } from "../graph.ts";

export function fallbackNode(state: GraphState): GraphState {
	const responseText = "Unknown command. Try 'make this uppercase' or 'make this lowercase'";
	const fallbackMessage = new AIMessage(responseText);

	return {
		...state,
		output: responseText,
		messages: [
			...state.messages,
			fallbackMessage
		]
	}
}