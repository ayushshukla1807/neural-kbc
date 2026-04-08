# Neural-KBC: Project Deep-Dive Report (Interview Kit)

This document is designed to prepare you for intense, high-bar technical interviews regarding your work on the "Neural-KBC" engine. It covers 20 complex questions across System Design, Data Structures & Algorithms, and AI Integration.

## System Design & Real-Time Architecture

**1. How did you ensure low-latency real-time synchronization between the Game Engine and clients during live server events?**
*Hint:* Discuss WebSocket architectures, payload serialization (Protobufs/JSON), the Pub/Sub model handling thousands of connections under the Node.js event-loop, and avoiding race conditions during question ticking.

**2. Explain your decision to split the application into a microservice architecture (Node.js & FastAPI). What were the specific bottlenecks you were trying to solve?**
*Hint:* Detail the CPU-bound nature of the AI/ML module via FastAPI versus the high I/O throughput requirements of real-time WebSockets via Node.js.

**3. If the platform scales to 1,000,000 concurrent players during a live event round, how does your Redis Leaderboard sustain the load?**
*Hint:* Mention Redis ZSET internal implementations (Skip Lists + Hash Tables). Address Redis clustering, write-sharding, and eventual consistency using periodic flush-to-Postgres asynchronous task queues.

**4. How does Neural-KBC handle edge-case network partitions? If a client reconnects right after a question timer expires, how is synchronization resolved?**
*Hint:* Discuss the concept of authoritative servers. The client UI is purely a projection; the Node.js core tracks absolute monotonic timestamps and calculates validity. Mention idempotent data-fetching on socket reconnection.

**5. How are database responsibilities partitioned across PostgreSQL and MongoDB? Why not use just one?**
*Hint:* Relational data (Postgres) is strictly used for transactional states—user balances, ledgers, secure user profiles. MongoDB allows dynamically changing question schemas, arrays of metadata, and complex AI-generated attributes without continuous migrations.

## Data Structures & Algorithms

**6. Explain the Dynamic Programming approach used in the "Risk Assessment" feature.**
*Hint:* Detail how you framed the problem as a Markov Decision Process (MDP). Explain the state variables ($Score$, $Question Difficulty$, $Lifelines Left$) and the recursive relation maximizing the Expected Value (EV) between $Quit$ and $Play$.

**7. How would you optimize the space complexity of your DP risk assessment matrix for continuous real-time queries?**
*Hint:* Discuss memoization techniques, state-space reduction (bucketing variables like difficulty), caching DP results in Redis, vs computing locally on the edge via WASM.

**8. For the "Hint Generation" engine, you mentioned Backtracking. Walk me through the branching logic used to eliminate incorrect options.**
*Hint:* Explain treating the 4 options as a tree structure. The backtracking algorithm traces logical invalidations (if A is true, then fact X is contradicted) to filter out incorrect answers systematically.

**9. In worst-case scenarios, your backtracker could take exponential time. How did you prune the search tree in production?**
*Hint:* Alpha-beta pruning principles, using pre-calculated heuristic values limits, or limiting tree depth bounding. 

**10. How is the Redis Global Leaderboard constructed algorithmically under the hood?**
*Hint:* Explain the dual data-structure of a Redis Sorted Set: A hash map pointing items to scores for $O(1)$ lookup, and a Skip List ordering items for $O(\log N)$ range and rank queries. 

**11. Discuss how priority queues might be used over sorted sets if we only wanted to show the current top 100 users, and what the trade-offs are?**
*Hint:* Min-Heap vs Skip List. A Min-Heap of size K maintains top 100 in $O(N \log K)$. Redis ZSET natively allows constant updating, whereas array-based heaps might face fragmentation.

**12. When processing Big Data via Hadoop/Spark, what sorting algorithm or data shuffle map-reduce strategy did you configure for performance?**
*Hint:* Hash-partitioning by user ID for aggregation tasks, and using Map-side combiners to reduce shuffle data volume across the network.

## AI Integration & Machine Learning

**13. Why use Random Forest / XGBoost instead of a Deep Neural Network (DNN) for Question Difficulty prediction?**
*Hint:* Discuss tabular data structures. XGBoost handles discrete categoricals efficiently, requires far less data to converge, and is highly interpretable (feature importance), which helps content creators understand *why* a question is rated hard.

**14. Explain the pipeline for updating the XGBoost model. Does it train in real-time or via batch updates?**
*Hint:* Online vs Batch learning. Real-time inference happens in FastAPI, but training should aggregate batches using Hadoop pipelines overnight to prevent concept drift and manage computational overload.

**15. In your "Expert Advice" lifeline, you integrate LangChain and Gemini. How do you prevent the LLM from hallucinating or generating offensive text?**
*Hint:* Implement strict system prompts, few-shot prompting, and validation guardrails via LangChain. Use semantic similarity bounds against the core question truth to ensure the response remains aligned.

**16. How did you structure the Vector Database (if any) or Prompt Context to ensure the Gemini model possessed sufficient internal game-logic context?**
*Hint:* Briefly passing $RAG$ (Retrieval Augmented Generation) patterns where the user's past interaction metadata is injected cleanly into the context window, so the LLM responds accurately to *that specific player's* scenario.

**17. What latency overhead did Gemini introduce to the lifeline workflow, and how did you mitigate it for a smooth UX?**
*Hint:* Discuss streaming responses (Server-Sent Events / WebSocket chunking) so the UI types out the response in real-time rather than blocking the UI thread for 3 seconds.

## Advanced & Behavioral Questions

**18. If your Vercel Edge-hosted frontend is constantly polling the Node.js server to bypass WebSocket protections, how would you design a Rate Limiting algorithm?**
*Hint:* Token Bucket or Leaky Bucket algorithm using Redis Lua scripts for atomic incrementing.

**19. How did you maintain strict "Zero-Space" Git branch discipline across a team while managing rapid iteration cycles for the ML pipeline?**
*Hint:* Using Husky pre-commit hooks, strict PR review structures, automated CI/CD pipeline actions that fail if code style or Git commit styling differs from the standardized conventional commit.

**20. Walk me through a time when the backend API failed during a high-stakes question. How did your architecture fail gracefully?**
*Hint:* Discuss fallback HTTP protocols if WebSockets crash, caching the last valid state in local storage, and idempotent resolution handling that guarantees a user isn't financially penalized for a 500 Server Error.
