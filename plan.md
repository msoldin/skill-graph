I am building a custom interactive learning platform similar to roadmap-style sites, where users explore a visual graph of topics and click nodes to access structured study material.

Core Idea
- A zoomable, interactive roadmap (graph of nodes and edges)
- Each node represents a topic
- Nodes could includes subnodes in a tree structure
- Clicking a ressource node opens detailed study content
- Nodes have relationships like prerequisites, related topics, and recommended paths
- Something like roadmap.sh
- No progress tracking you can freely click any node

Project structure:

I want a backend folder (java) and a frontend folder (react), both should contain a Dockerfile or likewise mechanism to build the running app inside a container.
In the root directory i want a docker-compose app to start everything, also the database.

Tech Stack proposal

- Backend: Java + Quarkus
- Database: PostgreSQL
- Frontend: Next.j, React, TypeScript
- Graph rendering maybe: React Flow
- Docker for Backend and Frontend
- Docker compose to start the whole project

What I need from you

Create a detailed, practical architecture plan for building this product from scratch.

Requirements
1. System Architecture

- Define high-level architecture (monolith vs modular monolith), perferebly hexagonal architecture with ddd for backend and atomic design for frontend
- Explain how frontend and backend interact
- Define API style (REST vs GraphQL and why)

2. Graph Handling Strategy
- Explain how to model and query graph relationships in PostgreSQL
- Show how to efficiently fetch:
- all nodes + edges for a roadmap
- prerequisites for a node
- related nodes
- Explain tradeoffs vs graph databases

3. Frontend Integration
- Describe how the backend should shape responses for React Flow
- Define the ideal payload structure for nodes and edges
- Explain how node click → content fetch should work

4. Performance Considerations
- Avoid N+1 queries
- Caching strategies (if needed)
- Handling large roadmaps (hundreds of nodes)

5. MVP Scope (IMPORTANT)

Define the simplest version of this product that is still useful, including:
- minimum features
- what to intentionally NOT build yet

Constraints
- Keep the solution pragmatic (not over-engineered)
- Optimize for a solo developer or small team
- Prioritize clarity and maintainability
- Avoid unnecessary complexity

Output Format
- Use clear sections
- Be specific and concrete (not generic advice)
- Include example schemas and API payloads where helpful
- Make this something I could realistically implement step-by-step
- Goal

By the end, I want a clear blueprint I can start coding immediately.

Be opinionated where needed.