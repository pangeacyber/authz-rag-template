# AWS GenAI Loft Workshop

Here's a list of important resources for the workshop on Sept 13, 2024.

## RBAC Demo
### Important links / resources
Quickstart Environment Variables (`.env.local` file) for demo can be accessed [here]()

The goal of using the `.env.local` file is to remove the need of setting up a RAG pipeline from scratch just to understand how to secure a RAG pipeline. The `.env.local` file given to you contains a `CF_WORKERS_HOST` variable which contains a deployed cloudflare worker that will be used for each demo.

#### Miscellaneous notes
Note: the `/add-docs` route has been disabled in the cloudflare worker API given to you in the `.env.local` file to prevent unauthorized use.

---
## ReBAC Demo
### Important links / resources
Quickstart Environment Variables (`.env.local` file) for demo can be accessed [here](https://l.pangea.cloud/SQfs0Kp)

#### Miscellaneous notes
Note: the `/add-docs` route has been disabled in the cloudflare worker API given to you in the `.env.local` file to prevent unauthorized use.
