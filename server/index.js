import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory charging session store
const activeChargingSessions = new Map();

// Constants
const CHARGER_POWER_KW = 7.4;
const METER_UPDATE_INTERVAL = 500; // 0.5 seconds
const RATE_PER_KWH = 12; // ₹12/kWh

// ============ SOCKET.IO ============

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on("start-charging", (data) => {
    console.log(`[Socket] Start charging request:`, data);

    const sessionId = `charging_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const session = {
      id: sessionId,
      userId: data.userId,
      vehicleReg: data.vehicleReg,
      batteryCapacity: data.batteryCapacity,
      ratePerKwh: data.ratePerKwh || RATE_PER_KWH,
      chargerPower: data.chargerPower || CHARGER_POWER_KW,
      startTime: Date.now(),
      secondsElapsed: 0,
      totalKwh: 0,
      totalCost: 0,
      currentPower: data.chargerPower || CHARGER_POWER_KW,
      socketId: socket.id,
      interval: null,
    };

    activeChargingSessions.set(sessionId, session);
    socket.emit("charging-started", { sessionId });
    console.log(`[Socket] Charging session created: ${sessionId}`);

    // Meter reading simulation every 0.5 seconds
    const interval = setInterval(() => {
      if (!activeChargingSessions.has(sessionId)) {
        clearInterval(interval);
        return;
      }

      const current = activeChargingSessions.get(sessionId);
      current.secondsElapsed += METER_UPDATE_INTERVAL / 1000;

      // Calculate kWh: (Power kW × Time seconds) / 3600
      const meterIntervalKwh =
        (current.chargerPower * (METER_UPDATE_INTERVAL / 1000)) / 3600;
      current.totalKwh += meterIntervalKwh;
      current.totalCost = current.totalKwh * current.ratePerKwh;

      // Battery percentage (simplified)
      const chargePercentage = Math.min(
        (current.totalKwh / current.batteryCapacity) * 100,
        100
      );

      socket.emit("meter-reading", {
        secondsElapsed: Math.floor(current.secondsElapsed),
        totalKwh: parseFloat(current.totalKwh.toFixed(2)),
        totalCost: parseFloat(current.totalCost.toFixed(2)),
        currentPower: current.currentPower,
        chargePercentage: parseFloat(chargePercentage.toFixed(1)),
      });
    }, METER_UPDATE_INTERVAL);

    session.interval = interval;
  });

  socket.on("stop-charging", (data) => {
    console.log(`[Socket] Stop charging request: ${data.sessionId}`);

    const session = activeChargingSessions.get(data.sessionId);

    if (session) {
      clearInterval(session.interval);

      const chargePercentage = Math.min(
        (session.totalKwh / session.batteryCapacity) * 100,
        100
      );

      socket.emit("charging-stopped", {
        sessionId: session.id,
        totalKwh: parseFloat(session.totalKwh.toFixed(2)),
        totalCost: parseFloat(session.totalCost.toFixed(2)),
        duration: Math.floor(session.secondsElapsed),
        chargePercentage: parseFloat(chargePercentage.toFixed(1)),
      });

      console.log(`[Socket] Charging stopped: ${data.sessionId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    activeChargingSessions.forEach((session, sessionId) => {
      if (session.socketId === socket.id) {
        clearInterval(session.interval);
        activeChargingSessions.delete(sessionId);
      }
    });
  });
});

// ============ REST API ============

/**
 * POST /api/charging/start
 */
app.post("/api/charging/start", (req, res) => {
  const { userId, vehicleReg, batteryCapacity, ratePerKwh, chargerPower } =
    req.body;

  if (!userId || !vehicleReg || !batteryCapacity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sessionId = `charging_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const session = {
    id: sessionId,
    userId,
    vehicleReg,
    batteryCapacity,
    ratePerKwh: ratePerKwh || RATE_PER_KWH,
    chargerPower: chargerPower || CHARGER_POWER_KW,
    startTime: Date.now(),
    secondsElapsed: 0,
    totalKwh: 0,
    totalCost: 0,
    interval: null,
  };

  activeChargingSessions.set(sessionId, session);

  // Start meter simulation
  const interval = setInterval(() => {
    if (!activeChargingSessions.has(sessionId)) {
      clearInterval(interval);
      return;
    }

    const current = activeChargingSessions.get(sessionId);
    current.secondsElapsed += METER_UPDATE_INTERVAL / 1000;
    const meterIntervalKwh =
      (current.chargerPower * (METER_UPDATE_INTERVAL / 1000)) / 3600;
    current.totalKwh += meterIntervalKwh;
    current.totalCost = current.totalKwh * current.ratePerKwh;
  }, METER_UPDATE_INTERVAL);

  session.interval = interval;

  console.log(`[REST] Charging started: ${sessionId}`);
  res.json({ sessionId });
});

/**
 * POST /api/charging/stop
 */
app.post("/api/charging/stop", (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  const session = activeChargingSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  clearInterval(session.interval);

  const chargePercentage = Math.min(
    (session.totalKwh / session.batteryCapacity) * 100,
    100
  );

  const response = {
    sessionId,
    vehicleReg: session.vehicleReg,
    totalKwh: parseFloat(session.totalKwh.toFixed(2)),
    totalAmount: parseFloat(session.totalCost.toFixed(2)),
    duration: Math.floor(session.secondsElapsed),
    chargePercentage: parseFloat(chargePercentage.toFixed(1)),
    startTime: new Date(session.startTime).toISOString(),
  };

  console.log(`[REST] Charging stopped: ${sessionId}`);
  res.json(response);
});

/**
 * GET /api/charging/:sessionId
 */
app.get("/api/charging/:sessionId", (req, res) => {
  const session = activeChargingSessions.get(req.params.sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  res.json({
    secondsElapsed: Math.floor(session.secondsElapsed),
    totalKwh: parseFloat(session.totalKwh.toFixed(2)),
    totalCost: parseFloat(session.totalCost.toFixed(2)),
    ratePerKwh: session.ratePerKwh,
    currentPower: session.chargerPower,
    vehicleReg: session.vehicleReg,
    isCharging: true,
  });
});

/**
 * GET /api/health
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    activeChargingSessions: activeChargingSessions.size,
    timestamp: new Date().toISOString(),
  });
});

// ============ SERVER START ============

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n⚡ RupeeFlow Backend running on port ${PORT}`);
  console.log(`📊 WebSocket enabled for real-time meter readings`);
  console.log(
    `🔗 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}\n`
  );
});
