const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- Distributed Match Engine Simulation (V2 Revolution) ---
class DistributedMatchEngine {
  constructor() {
    this.rooms = new Map(); // Arena instances
    this.globalLeaderboard = []; // Simulated Redis ZSET
    this.shardId = `SHARD-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    console.log(`[CORE] Shard ${this.shardId} online.`);
  }

  createArena(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        players: new Set(),
        status: "WAITING",
        events: []
      });
      console.log(`[MATCH] Arena ${roomId} provisioned.`);
    }
  }

  updateLeaderboard(userId, score) {
    // Simulated Redis ZADD logic
    const idx = this.globalLeaderboard.findIndex(p => p.userId === userId);
    if (idx !== -1) {
      this.globalLeaderboard[idx].score += score;
    } else {
      this.globalLeaderboard.push({ userId, score });
    }
    this.globalLeaderboard.sort((a, b) => b.score - a.score);
    return this.globalLeaderboard.slice(0, 10);
  }
}

const engine = new DistributedMatchEngine();

app.post("/api/wallet/credit", async (req, res) => {
  const { userId, amount } = req.body;
  console.log(`[LEDGER] Crediting ${amount} to user ${userId}`);
  res.json({ success: true, balance: 10000 + (amount || 0), txHash: `0x${Math.random().toString(16).substr(2, 32)}` });
});

app.get("/api/leaderboard", (req, res) => {
  res.json(engine.globalLeaderboard);
});

io.on("connection", (socket) => {
  console.log(`[NETWORK] New node connected: ${socket.id}`);

  socket.on("join_match", async (userId, roomId = "GLOBAL_MAIN") => {
    engine.createArena(roomId);
    socket.join(roomId);
    engine.rooms.get(roomId).players.add(userId);
    
    console.log(`[MATCH] User ${userId} linked to Arena ${roomId}`);
    io.to(roomId).emit("player_joined", { 
      userId, 
      timestamp: Date.now(),
      shard: engine.shardId,
      arenaCount: engine.rooms.get(roomId).players.size
    });
  });

  socket.on("submit_answer", async ({ userId, roomId = "GLOBAL_MAIN", timeTaken, scoreDelta }) => {
    console.log(`[ENGINE] Processing answer from ${userId} in ${roomId}`);
    
    // Update distributed state
    const top10 = engine.updateLeaderboard(userId, scoreDelta);
    
    // Broadcast Analytics (Simulating Real-time Dashboard)
    io.to(roomId).emit("analytics_update", {
      avgLatency: timeTaken + (Math.random() * 20),
      activeNodes: engine.rooms.get(roomId).players.size,
      throughput: "1.2k events/sec"
    });

    // Broadcast leaderboard update (Pub/Sub Simulation)
    io.to(roomId).emit("leaderboard_update", top10);
    
    socket.emit("answer_ack", { 
      status: "verified", 
      newScore: scoreDelta,
      txId: Math.random().toString(36).substr(2, 9)
    });
  });

  socket.on("disconnect", () => {
    console.log(`[NETWORK] Node disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[CORE] Neural-KBC Realtime Service listening on port ${PORT}`);
});
