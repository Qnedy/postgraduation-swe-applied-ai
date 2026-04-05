import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./documentProcessor.ts";
import { type PretrainedOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";

let _neo4jVectorStore = null;

async function clearAll(vectorStore: Neo4jVectorStore, nodeLabel: string) {
	console.log(`Clearing all nodes with label ${nodeLabel} from Neo4j...`);

	await vectorStore.query(`MATCH (n:${nodeLabel}) DETACH DELETE n`);

	console.log(`All nodes with label ${nodeLabel} have been deleted from Neo4j.`);
}

try {
	console.log("Initializing Embedding system with Neo4j... \n");

	const documentProcessor = new DocumentProcessor(
		CONFIG.pdf.path,
		CONFIG.textSplitter
	);

	const documents = await documentProcessor.loadAndSplit();
	const embeddings = new HuggingFaceTransformersEmbeddings({
		model: CONFIG.embedding.modelName,
		pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions
	});

	//const response = await embeddings.embedDocuments();
	_neo4jVectorStore = await Neo4jVectorStore.fromExistingGraph(embeddings, CONFIG.neo4j);

	clearAll(_neo4jVectorStore, CONFIG.neo4j.nodeLabel);

	for (const [index, doc] of documents.entries()) {
		console.log(`Adding document ${index + 1}/${documents.length} to Neo4j...`);
		await _neo4jVectorStore.addDocuments([doc]);

	}

	console.log("All documents have been added to Neo4j Vector Store.");


	// ==================== STEP 2: RUN SIMILARITY SEARCH ====================
  console.log("🔍 ETAPA 2: Executando buscas por similaridade...\n");
	const questions = [
		"o que é hot enconding e quando usar?"
	];

	for (const index in questions) {
		const question = questions[index]
		console.log(`\n${'='.repeat(80)}`);
		console.log(`📌 PERGUNTA: ${question}`);
		console.log('='.repeat(80));
		const result = await _neo4jVectorStore.similaritySearch(question!, CONFIG.similarity.topK);

		console.log(`Resultados para a pergunta: "${question}"`);
		console.log(result);
	}

	

} catch(error) {
	console.error("Error initializing the Neo4j Vector Store:", error);

} finally {
	// _neo4jVectorStore
}