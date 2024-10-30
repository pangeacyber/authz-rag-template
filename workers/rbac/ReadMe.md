# Setting up Cloudflare Worker 🌩️ for RAG Pipeline (RBAC Mode)

Cloudflare Workers AI offers a vast array of services that makes it easy for us to setup a RAG pipeline in minutes.

In this section, we will use Cloudflare Workers AI to setup our RAG pipeline usin:
* Cloudflare Vectorize (Vector DB)
* Llama 3.1 (LLM) using Cloudflare Workers AI
* Cloudflare D1 (SQL DB)

Note: All the above cloudflare services can be used with Cloudflare's free tier. Additionally, you can also use any LLM, Vector DB and SQL DB; however, you will have to rewrite `workers` folder logic to match your tech stack of choice.

### 1. Create a Cloudflare Account
Visit [ai.cloudflare.com](https://ai.cloudflare.com?referrer=pangea.cloud) and signup using the `Getting Started` button.

### 2. Install the Wrangler CLI
Note: If you're running this demo in a GitHub codespace, you can skip this step.
Or just run
```
npm install
```
and this should install all required dependencies for the worker.

### 3. Login to your Cloudflare account from the CLI
The easiest way to provision all cloudflare workers services is through the CLI, so run the following command to login:
```
npx wrangler login
```

This should redirect you to a login page on your browser and you will need to finish all the login steps.

### 4. Provision the services needed
First, let's create a vector index on Cloudflare Vectorize:
```
npx wrangler vectorize create vector-index --dimensions=768 --metric=cosine
```

This should return configuration details for vectorize, add them to `wrangler.toml`:
```toml
# ... existing wrangler configuration

[[vectorize]]
binding = "VECTOR_INDEX"
index_name = "vector-index-name"
```

Next, let's create a SQL database on Cloudflare D1:
```
npx wrangler d1 create database
```
Once Again, this should return configuration details for the database, add them to `wrangler.toml`
```toml
# ... existing wrangler configuration

[[d1_databases]]
binding = "DB" # available in your Worker on env.DB
database_name = "database-name"
database_id = "random-database-id-generated-by-wrangler" # replace this with a real database_id (UUID)
```
Lastly, let's create a table in our newly provisioned SQL DB using the `wrangler d1 execute` command:
```
npx wrangler d1 execute database --remote --command "CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY, filename TEXT NOT NULL, text TEXT NOT NULL, metadata_category TEXT)"
```

We created 3 columns here which will be used in our worker to implement the RAG pipeline.


### 5. Deploy your Cloudflare Worker
All the ingestion of the documents can be done directly from the web app's UI. So we're ready to deploy the worker.

Note: If you're curious to learn how the ingestion is done behind the scenes, look at the `/add-docs` route in the [src/index.ts](./src/index.ts) file.

```
npx wrangler deploy
```

It should return a cloudflare workers URL that looks something like:
`https://<YOUR_WORKER>.<YOUR_SUBDOMAIN>.workers.dev`. Copy this exact URL and paste it into your .env file of the root next JS app for the environment variable `CF_WORKERS_HOST`.

That's it! Done with the Cloudflare setup part. Head back to the [main README](../README.md) to set the rest of the template up.