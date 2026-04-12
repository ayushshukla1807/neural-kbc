# ⚡ Neural KBC — Web3 Play Along Quiz Engine

> An ultra-high-performance quiz gaming platform featuring AI-driven question generation, real-time Web3 styling, procedural audio synthesis, and a neural-human interface.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js_15-000000?logo=next.js)](https://nextjs.org)
[![LangChain](https://img.shields.io/badge/AI_Engine-LangChain-121212?logo=langchain)](https://langchain.com)
[![FastAPI](https://img.shields.io/badge/Microservice-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Framer Motion](https://img.shields.io/badge/UI_Animations-Framer_Motion-FF0055?logo=framer)](https://framer.com/motion)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## 🎓 Technical Alignment (Year 2: Achieve)

Built as part of an **Advanced Industry-First Curriculum**, Neural KBC showcases mastery in complex distributed architectures and data analytics:

- **Big Data & Spark**: End-to-end ETL pipeline using **Apache Spark** ([spark_analytics.py](file:///spark_analytics.py)) for real-time gameplay pattern analysis.
- **Mathematics for AI**: Implements **XGBoost-based difficulty prediction** algorithms to assess question complexity in real-time.
- **Advanced Programming**: High-performance game engine utilizing asynchronous proctored state management.
- **Systems Engineering**: Procedural audio synthesis using raw Web Audio API oscillators, eliminating the need for static assets.

---

## 🏗️ Neural Architecture

Neural KBC is not just a quiz app; it's a **"Play Along" ecosystem** built for the decentralized era:

1.  **Orchestration Layer (Next.js 15):** The central hub managing game state, real-time proctoring, and UI rendering.
2.  **AI Reasoning (Gemini + LangChain):** Dynamically generates adaptive difficulty questions across 9 complex domains (Quantum Mechanics, Cryptography, etc.).
3.  **Real-time Services (Socket.io):** Powers the peer-to-peer "Duel Mode" and global leaderboard synchronization.
4.  **Audio Engine (Procedural):** Uses raw Web Audio API oscillators to generate real-time atmospheric SFX without external assets.
5.  **Analytics Layer (XGBoost):** Predicts win probabilities and assesses question difficulty in real-time.

---

## ✨ Flagship Features

| Feature | Technical Implementation |
|---|---|
| 🎙️ **Voice Synthesis** | Indian-localized VoiceEngine using Web Speech API for immersive hosting. |
| 🔈 **Procedural Synth** | Real-time oscillator-based SFX (Sine/Square/Sawtooth) for high-fidelity engagement. |
| 🤖 **AI Lifelines** | **Oracle** (LLM expert), **Cluster** (Predictive hints), and **Split** (Algorithmic 50/50). |
| 💎 **ETH Prize Ladder** | Real-time progress tracking with automated ETH-denominated rewards (0.05 to 10,000 ETH). |
| 👁️ **Proctoring Engine** | Real-time violation tracking (tab switching, focus loss) with shaking screen penalties. |
| 📈 **Dynamic Search** | High-performance search interface for exploring knowledge domains. |

---

## 🛠️ Modern Tech Stack

- **Core:** React 19, Next.js 15, TypeScript
- **AI/LLM:** Google Gemini AI, LangChain (Core & Google GenAI)
- **Backend:** FastAPI (Python), Node.js (Realtime Service)
- **Animations:** Framer Motion (Cyberpunk/Glassmorphism theme)
- **Audio:** Web Audio API (Master-Tier Audio Synth)
- **Deployment:** Vercel (Edge Runtime ready)

---

## 📂 Project Structure

```bash
├── web/                # Next.js 15 App (UI, Game Engine, Audio, Voice)
├── ai-service/         # FastAPI Python service (Difficulty Prediction, Hints)
├── realtime-service/   # Node.js WebSocket server for Multi-mode & Leaderboards
├── docs/               # Architecture and Deployment specifications
└── spark_analytics.py  # Data processing for game performance insights
```

---

## 🚀 Deployment Mode

The application is architected for **Vercel Edge Runtime** to minimize latency during AI question generation.

```bash
# Start the Web Engine
cd web
npm install
npm run dev

# Launch AI Microservice
cd ai-service
pip install -r requirements.txt
python main.py
```

---

## 👨‍💻 Vision
**Ayush Shukla** — [github.com/ayushshukla1807](https://github.com/ayushshukla1807)

---

## 📄 License
MIT License
