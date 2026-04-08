# Neural-KBC: Project Deep Dive (Interview Kit)

### System Design & Architecture
**1. How does the system handle real-time concurrency during live game events?**
*Answer:* Node.js event-loop with Socket.io binary payloads for minimal overhead. Redis Pub/Sub scales horizontal WebSocket instances across Edge nodes.
**2. Why microservices?**
*Answer:* Split I/O-heavy WebSocket management (Node.js) from CPU-bound ML inferences/LLM parsing (FastAPI Python).
**3. Database Selection constraints?**
*Answer:* PostgreSQL handles strict ACID requirements for WALLET/Ledger. MongoDB handles flexible schemas for the Question Bank.
**4. Global Leaderboard implementation?**
*Answer:* Redis Sorted Sets (`ZADD`, `ZREVRANGE`) providing $O(\log N)$ updates.
**5. Rate Limiting?**
*Answer:* Redis Token Bucket algorithm evaluating IP/JWT headers on the API Gateway.
**6. How is state recovery managed post-disconnect?**
*Answer:* Absolute monotonic server timestamps; clients re-fetch JWT stateless game projections from Redis cache on reconnect.
**7. Explain Edge deployments via Vercel.**
*Answer:* Next.js Middleware intercepts traffic at Vercel Edge caching CDNs, validating Auth instantly before hitting the core origin server.

### DSA & Logic
**8. How does Risk/Reward Probability work?**
*Answer:* Dynamic Programming (Value Iteration). We model remaining questions as an MDP. State: (Money Matrix, Difficulty Vector, Lifeline Boolean). Solves for `MAX(Quit_Value, Probability * Next_EV)`.
**9. How is Hint Generation handled?**
*Answer:* Backtracking. Given the valid ground truth, it explores logical contradiction trees against the three false options, pruning dead-end logical paths to provide a subtle textual hint.
**10. Optimize the Hint generation if exponential?**
*Answer:* Memoization of generic truth constraints, bounding tree depth to depth=3.
**11. Leaderboard pagination?**
*Answer:* Redis `ZSCAN` combined with cursor states for constant memory pagination.
**12. User Session uniqueness in Socket arrays?**
*Answer:* HashMap binding `socket_id` to `PG_User_UUID` for $O(1)$ disconnections resolution.
**13. Big Data sorting mechanism?**
*Answer:* MapReduce shuffle configuration hashed by `user_id` to prevent cross-node data skew in PySpark.

### AI / ML
**14. Why XGBoost for Difficulty Prediction?**
*Answer:* Tabular structured datastore regarding success rates. XGBoost handles sparse matrices inherently and prevents over-fitting with early stopping regularization better than DNNs for this schema.
**15. Gemini 3.1 Pro setup?**
*Answer:* We utilize RAG by vectorizing the question scope against Wikipedia constraints; we prompt Gemini with few-shot strict JSON formats via LangChain to prevent hallucinations.
**16. Handling LLM Latency?**
*Answer:* Streaming HTTP responses from FastAPI back to Node.js, chunked to the client so UI updates fluidly before the generation ends.
**17. What if XGBoost encounters data drift?**
*Answer:* The PySpark offline pipeline recalculates base Elo ratings nightly, writing new baseline models to an object store.
**18. LLM Guardrails?**
*Answer:* Output parsing via Pydantic validators; if response drifts structurally, fallback to deterministic "50/50" module seamlessly.
**19. Cache management for LLM responses?**
*Answer:* Semantic caching. We hash the question properties; if cache hit via Redis $O(1)$, bypass Gemini inference entirely to save API quota.
**20. Zero-downtime ML deployment?**
*Answer:* Blue-Green deployments on FastAPI pods with Kubernetes readiness probes targeting model warming endpoints.
