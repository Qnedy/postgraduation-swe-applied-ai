import { createServer } from "./server.ts";

const app = createServer();

await app.listen({ port: 4000, host: '0.0.0.0'})
console.log('server running at 3000')

// app.inject({
// 	method: "POST",
// 	url: "/chat",
// 	body: {
// 		question: "What is the meaning of life?"
// 	}
// }).then(response => {
// 	console.log("Response:", response.body);
// }).catch(error => {
// 	console.error("Error:", error);
// });