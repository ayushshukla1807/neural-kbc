# Resume & Portfolio Integration Playbook

### Project Details for Resume
**Title:** Neural-KBC: Real-Time AI-Augmented Distributed Gaming Engine
**Timeline:** September 2025 – April 2026
**Live Hosted URL:** `https://neural-kbc-engine.vercel.app` *(Run `npx vercel --prod` to claim this or similar namespace)*
**Codebase URL:** `https://github.com/yourusername/neural-kbc` *(Push the generated `mock-repo` to your GitHub)*

**Description (Keyword Optimized):**
Architected "Neural-KBC", a massively multiplayer real-time Play Along platform simulating KBC. Engineered a robust **Backend Engineering** architecture utilizing **Node JS** for real-time WebSocket synchronization and **Python** (FastAPI) microservices. Implemented complex **Data Structures & Algorithms (DSA)** including **Dynamic Programming** matrices for Risk/Reward Probability and **Backtracking** algorithms for logical hint generation. Integrated **Machine Learning** pipelines tracking user behavior via **Hadoop** & **Spark**, visualizing outputs in a **ReactJS** **Responsive Web Design**. Optimized deep search queries and **Arrays/Dictionary** state management across **PostgreSQL** ledgers and **MongoDB** question banks. Devised **UI/UX** using Framer Motion 3D rendering. Bridged **Mathematics for AI** and **Maths for CS** by coupling an XGBoost difficulty predictor with Gemini RAG, achieving sub-100ms API latency while managing vast user states via Redis.

### Comprehensive Interview Q&A (Expanded)
**1. How did you utilize Mathematics for AI and Machine Learning?**
*Answer:* I applied regression models via XGBoost to calculate probability densities of success per question, optimizing the `p-value` of player win propensities to actively calibrate the money ladder structure.
**2. Where did you implement Dynamic Programming?**
*Answer:* In the risk-assessment API. I modeled the game session as a Markov Decision Process, utilizing Value Iteration arrays to memoize backward-stepping $EV$ equations to instantly advise players on their mathematical odds.
**3. How is File Handling and Big Data represented?**
*Answer:* Offline batch pipelines. The Node cluster streams binary logs of answer vectors which are ingested by PySpark scripts (simulating Hadoop clusters), reducing petabytes of game logs into CSV data visualizations.
**4. How does the architecture scale for 100k+ concurrents?**
*Answer:* Node.js handles the Socket.io instances scaling horizontally behind an API Gateway, coordinating live states strictly via Redis Sorted Sets to bypass PostgreSQL disk latency during live gameplay.

### Vercel Deployment Instructions
Inside your project directory, execute the following commands to initialize the Vercel deployment and host it globally:
```bash
npm i -g vercel
vercel login
vercel --prod
```
