import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";

try {
	console.log("Initializing Embedding system with Neo4j... \n");

	const documentProcessor = new DocumentProcessor(
		CONFIG.pdf.path,
		CONFIG.textSplitter
	);

	const documents = await documentProcessor.loadAndSplit();
	console.log(documents);
} catch(error) {


}