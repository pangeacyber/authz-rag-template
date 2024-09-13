# Secure RAG Chatbot Template with Pangea AuthZ

![./assets/pangea-rag-authz-diagram.png](assets/pangea-rag-authz-diagram.png)
This template demonstrates how you can build an secure RAG pipeline with robust access control and is built using [Next.js](https://nextjs.org), [Cloudflare Workers AI](https://ai.cloudflare.com), and [Pangea AuthZ](https://pangea.cloud/services/authz?utm_source=github&utm_medium=authz-rag-template)

Note: the LLM and vector DB can be swapped out and exists in the `workers` repo.

## Current Problem with RAG
Chatbots using LLMs are great at giving users responses with contextual information. Architectures such as Retrieval Augmented Generation (RAG) pipelining further allow chatbots to access real-time and more fine-grained contexts using tools like vector searching through vector-embedded documents. However, when using tools like vector search to improve our chatbot responses, it is hard to ensure that the contextual information obtained by these RAG pipelines is authorized for the eyes of every user. This problem enables malicious actors to gain unauthorized access to contextual information pulled from unauthorized sensitive company documents.

## How Does Pangea AuthZ Help?
Pangea AuthZ allows us to add ReBAC and RBAC authorization in any application or architecture - including chatbots and LLMs. Using Pangea AuthZ, we can classify every document from our data store with an access level using Pangea’s robust authorization schema. 
Once we’ve classified all documents with appropriate access levels, we can now securely perform checks during inference (runtime) to check if a user requesting information from a chatbot or LLM has access to a required document. In RAG pipelines, during inference (runtime) the user prompt is sent to a vector DB to run a vector search finding the most relevant document to add as context to the prompt. Since each document in the vector store is classified in Pangea AuthZ with an access level, we can seamlessly check if the user can access that particular document using Pangea’s ReBAC authorization models and decide to allow or deny that user request.


## Getting Started
* Pre-req checks
* RAG setup

## Pre-req checks
To spin up this template, you will need:
* Pangea Account
* Cloudflare Account (only if you are using Cloudflare LLMs + Vector DB + SQL DB)
* Node.js (if you're using GitHub codespaces, you won't need to install this)

## RAG Setup
In this section, we will use Cloudflare Workers AI to setup our RAG pipeline using Cloudflare Vectorize (Vector DB), Llama 3.1 (LLM) and Cloudflare D1 (SQL DB).

Note: Since Cloudflare Vectorize is in beta, you will need a paid account. Additionally you can also use any LLM, Vector DB and SQL DB; however, you will have to rewrite `workers` folder logic to match your tech stack of choice.

### 1. Create a Cloudflare Account
Visit [ai.cloudflare.com](https://ai.cloudflare.com) and signup using the `Getting Started` button.

### 2. Install the Wrangler CLI
Note: If you're running this demo in a GitHub codespace, you can skip this step.

### 3. Create 
If you are 

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
