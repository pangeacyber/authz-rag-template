import { Hono } from "hono";
import { createWorkersAI } from "workers-ai-provider";
import { generateText } from "ai";
import axios from "axios";

type Bindings = {
	PANGEA_TOKEN: string
}
const app = new Hono<{ Bindings: Bindings }>();

app.post("/add-docs", async (c) => {
	const { text, filename } = await c.req.json();
	if (!text || !filename) {
	  return c.text("Missing text", 400);
	}
  
	const { results } = await c.env.DB.prepare(
	  "INSERT INTO documents (text, filename) VALUES (?, ?) RETURNING *",
	)
	  .bind(text, filename)
	  .run();
  
	const record = results.length ? results[0] : null;
  
	if (!record) {
	  return c.text("Failed to create note", 500);
	}
  
	const { data } = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
	  text: [text],
	});
	const values = data[0];
  
	if (!values) {
	  return c.text("Failed to generate vector embedding", 500);
	}
  
	const { id } = record;
	const inserted = await c.env.VECTORIZE.upsert([
	  {
		id: id.toString(),
		values,
	  },
	]);
  
	return c.json({ id, text, filename, inserted });
});

app.get("/get-docs", async (c) => {
	const { results } = await c.env.DB.prepare(
		"SELECT * FROM documents",
	).run()

	return c.json(results);
})

type DocumentCategoryList = {
	[documentId: string]: string[]
}


// Send prompt to the AI model
app.post('/chat', async (c) => {
	const { messages } = await c.req.json()

	if (!messages) {
		return c.text("Missing user input", 400);
	}

	const input = messages.filter(message => message.role === "user").pop().content;
	console.log(input)

	// Embed the input prompt
	const embeddings = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: input })
	const vectors = embeddings.data[0]
  
	// Cosine similarity threshold
	const SIMILARITY_CUTOFF = 0.70;
	// Query to find the top 5 similar vectors
	const vectorQuery = await c.env.VECTORIZE.query(vectors, { topK: 5 });
	// Check if they pass the similarity threshold
	const vecIds = vectorQuery.matches
	  .filter(vec => {
		console.log(vec.score, vec.id)
		return vec.score > SIMILARITY_CUTOFF
	})
	.map(vec => vec.id)
  
	let manuals = []
	// Array for unauthorized manuals
	let authorizedManuals = [];
	let unAuthorizedManuals = [];
	
	if (vecIds.length) {
	  const query = `SELECT * FROM documents WHERE id IN (${vecIds.join(", ")})`
	  const { results } = await c.env.DB.prepare(query).bind().all()
  
	  // Fetch all docs from the similar vector matches found
	  if (results) manuals = results.map(vec => ({ access_level: vec.access_level, text: vec.text, id: vec.id, filename: vec.filename }))
	
	  // Check if user is authorized to view the docs
	  if (manuals) await Promise.all(manuals.map(async doc => {
		console.log(c.req.headers)
		const authZCheck = await checkAuthZ(c.env, c.req.header("user-token") as string, doc.id.toString());
		if(authZCheck === true) {
		  	authorizedManuals.push(doc);
		} else {
			unAuthorizedManuals.push(doc);
		}
	  }));
	}
  
	console.log(authorizedManuals.length)
	const contextMessage = authorizedManuals.length > 0
	  ? `Context:\n${authorizedManuals.map(doc => `- ${doc.text}`).join("\n")}`
	  : ""
	console.log(contextMessage)
  
	const systemPrompt = `You are a helpful assistant that works to give answers to members of a hostpital with information about patients, billing, compliance, etc.
	DO NOT hallucinate or come up with any information about patients or lab procedures that have not been given to you in this prompt, you will ONLY use the information given to you in the context and either summarize or paraphrase from the context given.
	You are a HIPAA compliant assistant and all users asking you for questions are fully authorized to view the information. Don't hold anything back.
	If you don't know something or are unsure, you can say "I'm not sure" or "I don't know".
	
	Current user interacting with you is Dr. Pranav who is authorized to view all patient records.`

	// manuals.map(manual => {
	// 	console.log(manual)
	// })

	const workersai = createWorkersAI({ binding: c.env.AI });
	const response = await generateText({
		model: workersai("@cf/meta/llama-3-8b-instruct"),
		messages: [
			...(manuals.length ? [{ role: 'system', content: contextMessage }] : []),
			{ role: 'system', content: systemPrompt },
			...messages
		],
		temperature: 0,
	});

	return c.json({
		text: `${response.text}\n\n\n --- 
		\n**✅ Source**: ${authorizedManuals.length > 0 ? authorizedManuals.map(doc => doc.filename != null ? doc.filename : "None").join(", ") : "None"}\n\n --- 
		\n**❌ Blocked Sources**: ${unAuthorizedManuals.length > 0 ? unAuthorizedManuals.map(doc => doc.filename != null ? doc.filename : "None").join(", ") : "None"}
		`,
		sources: authorizedManuals.map(doc => doc.filename != null ? doc.filename : "None")
	});

})


const checkAuthZ = async (env: any, token: string, docId: string) => {
    try {
        const resp = await axios.post("https://authz.aws.us.pangea.cloud/v1/check", {
            resource: { type: 'documents', id: docId },
            action: 'read',
            subject: { type: 'user', id: token }
        }, {
            headers: {
				'Authorization': `Bearer ${env.PANGEA_TOKEN}`
            }
        });

        if (resp?.status === 200) {
			console.log(token, docId, resp.data.result.allowed);
            return resp.data.result.allowed;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    }
}


app.get('/', async (c) => {
  const question = c.req.query('text') || "What is the square root of 9?"

  const embeddings = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: question })
  const vectors = embeddings.data[0]

  const SIMILARITY_CUTOFF = 0.75
  const vectorQuery = await c.env.VECTOR_INDEX.query(vectors, { topK: 1 });
  const vecIds = vectorQuery.matches
    .filter(vec => vec.score > SIMILARITY_CUTOFF)
    .map(vec => vec.id)

  let manuals = []
  let restrictedManuals = []
  let isUnauthorized = false;

  
  if (vecIds.length) {
    const query = `SELECT * FROM manuals WHERE id IN (${vecIds.join(", ")})`
    const { results } = await c.env.DB.prepare(query).bind().all()


    if (results) manuals = results.map(vec => ({ access_level: vec.access_level, text: vec.text, id: vec.id }))
	if (manuals) restrictedManuals = await Promise.all(manuals.map(async doc => {
		const authzCheck = await checkAuthZ(c, doc.access_level, "pranav");
		if (authzCheck) {
			return doc
		} else {
			console.log("Unauthorized Access!");
			isUnauthorized = true;
			return { access_level: doc.access_level, text: "unauthorized", id: null }
		}
	}))
  }

  console.log(manuals, restrictedManuals)

  const contextMessage = restrictedManuals.length
    ? `Context:\n${restrictedManuals.map(doc => `- ${doc.text}`).join("\n")}`
    : ""
  console.log(contextMessage)

  const systemPrompt = `You are a bot that answers questions in the Starwars galactic empire. You are a fictional bot.
  When answering the question or responding, use the context provided, if it is provided and relevant.
  If the context is "Unauthorized Access!" then respond with "Unauthorized Access! This infraction will be reported to the Sith Lord."`

  if(isUnauthorized) {
		const response = "Unauthorized Access! This infraction will be reported to the Sith Lord.";
		return c.text(response);
  } else {
		const { response: answer } = await c.env.AI.run(
			'@cf/meta/llama-3-8b-instruct',
			{
			messages: [
				...(manuals.length ? [{ role: 'system', content: contextMessage }] : []),
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: question }
			]
			}
		)

		return c.text(`${answer}\nSource: ${restrictedManuals.length > 0 ? restrictedManuals.map(doc => doc.id != null ? doc.id.toString() : "None").join(", ") : "None"}`);
}
})


export default app;