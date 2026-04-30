import Fastify from "fastify";

export const createServer = () => {
	const app = Fastify({ logger: false });

	app.post("/chat", {
		schema: {
			body: {
				type: "object",
				required: ["question"],
				properties: {
					question: {
						type: "string",
						minLength: 5,
					}
				}
			}
		}
	}, async (request, reply) => {
		try {
			const { question } = await request.body as { question: string };

			return reply.send("Ok");
			
		}catch(error) {
			console.error("Error processing request:", error);
			return reply.code(500).send("Internal Server Error");
		}
	});

	return app;
}