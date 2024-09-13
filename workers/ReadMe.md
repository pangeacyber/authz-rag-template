# Setting up Cloudflare Worker RAG pipeline
In this section, we will use Cloudflare Workers AI to setup our RAG pipeline using Cloudflare Vectorize (Vector DB), Llama 3.1 (LLM) and Cloudflare D1 (SQL DB).

Note: Since Cloudflare Vectorize is in beta, you will need a paid account. Additionally you can also use any LLM, Vector DB and SQL DB; however, you will have to rewrite `workers` folder logic to match your tech stack of choice.

### 1. Create a Cloudflare Account
Visit [ai.cloudflare.com](https://ai.cloudflare.com) and signup using the `Getting Started` button.

### 2. Install the Wrangler CLI
Note: If you're running this demo in a GitHub codespace, you can skip this step.

### 3. Create 
If you are 