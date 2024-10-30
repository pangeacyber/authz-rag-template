import { Hono } from 'hono'
import axios from 'axios';
import { CheckAuthZ } from './authz';

const app = new Hono()

app.post('/add-manual', async (c) => {
	const { filename, text, category } = await c.req.json()
	if (!text) {
		return c.text("Missing text", 400);
	}
	if (!category) {
		return c.text("Missing category", 400);
	}
  
	// Insert into Cloudflare D1 database
	const { results } = await c.env.DB.prepare("INSERT INTO documents (filename, text, metadata_category) VALUES (?, ?, ?) RETURNING *")
	  .bind(filename, text, category[0])
	  .run()
  
	const record = results.length ? results[0] : null
  
	if (!record) {
			  return c.text("Failed to create note", 500);
	  }
  
	//   Vectorize text data
	const { data } = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [text] })
	const values = data[0]
  
	if (!values) {
			  return c.text("Failed to generate vector embedding", 500);
	  }
  
	// Store vector embedding in Cloudflare Vector Index
	const { id } = record
	const inserted = await c.env.VECTOR_INDEX.upsert([
	  {
		id: id.toString(),
		values,
	  }
	])
  
	return c.json({ id, text, category, inserted })
})

app.get("/get-docs", async (c) => {
	const { results } = await c.env.DB.prepare(
		"SELECT * FROM documents",
	).run()

	return c.json(results);
})

// Send prompt to the AI model
app.post('/chat', async (c) => {
	const { messages } = await c.req.json()
	console.log(messages);

	if (!messages) {
		return c.text("Missing user input", 400);
	}

	if(!c.req.header("user-token")) {
		return c.text("No user auth token attached", 403);
	}

	const input = messages.filter(message => message.role === "user").pop().content;

	console.log(input);
	// Embed the input prompt
	const embeddings = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: input })
	const vectors = embeddings.data[0]
  
	const SIMILARITY_CUTOFF = 0.65
	const vectorQuery = await c.env.VECTOR_INDEX.query(vectors, { topK: 1 });
	const vecIds = vectorQuery.matches
		.filter(vec => {
			console.log(vec.score)
			return vec.score > SIMILARITY_CUTOFF
		})
		.map(vec => vec.id)

	let documents = []
	let restrictedDocuments = []
	let isUnauthorized = false;

	if (vecIds.length > 0) {
		console.log(vecIds);
		const query = `SELECT * FROM documents WHERE id IN (${vecIds.join(", ")})`
		console.log(query);
		const { results } = await c.env.DB.prepare(query).bind().all()


		if (results) documents = results.map(vec => ({ metadata_category: vec.metadata_category, text: vec.text, id: vec.id }))
		if (documents) restrictedDocuments = await Promise.all(documents.map(async doc => {
			console.log(doc);
			const authzCheck = await CheckAuthZ(c.env, doc.metadata_category, c.req.header("user-token"), c.req.header("Authorization")?.replace("Bearer ", ""));
			if (authzCheck) {
				return doc
			} else {
				console.log("Unauthorized Access!");
				isUnauthorized = true;
				return { category: doc.metadata_category, text: "unauthorized", id: null }
			}
		}))
	}

	console.log(documents, restrictedDocuments)

	const contextMessage = restrictedDocuments.length
		? `Context:\n${restrictedDocuments.map(doc => `- ${doc.text}`).join("\n")}`
		: ""
	console.log(contextMessage)

	const systemPrompt = `You are a helpful assistant that works to give answers to members of a bank with information about financial reports, customer accounts, etc.
	DO NOT hallucinate or come up with any information about patients or lab procedures that have not been given to you in this prompt, you will ONLY use the information given to you in the context and either summarize or paraphrase from the context given.
	All users asking you for questions are fully authorized to view the information. Don't hold anything back.
	If you don't know something or are unsure, you can say "I'm not sure" or "I don't know".
	
	Current user interacting with a user who is fully authorized to view all bank records."`

	console.log(isUnauthorized);
	if(isUnauthorized) {
			const response = "Access Denied! Groot says, 'I am Groot.' Translation: 'Back off, or there will be twigs to pay!'";
			return c.json({
				text: response
			});
	} else {
			const { response: answer } = await c.env.AI.run(
				'@cf/meta/llama-3-8b-instruct',
				{
				messages: [
					...messages,
					...(documents.length ? [{ role: 'system', content: contextMessage }] : []),
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: input }
				]
				}
			)

			console.log(answer);

	return c.json({
		text: `${answer}\n\n\n --- 
		\n**✅ Source**: ${restrictedDocuments.length > 0 ? restrictedDocuments.map(doc => doc.id != null ? doc.id : "None").join(", ") : "None"}\n\n
		`,
		sources: restrictedDocuments.map(doc => doc.id != null ? doc.id : "None")
	});}
})

app.onError((err, c) => {
  console.log(err);
  return c.text(err)
})

export default app;