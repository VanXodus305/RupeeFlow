import express from "express";
import {
  createSession,
  getSession,
  stopSession,
  getActiveSessionsCount,
} from "./charging-manager.js";
import { config } from "./config.js";

const router = express.Router();

router.post("/api/charging/start", (req, res) => {
  const { userId, vehicleReg, batteryCapacity, ratePerKwh, chargerPower } =
    req.body;

  if (!userId || !vehicleReg || !batteryCapacity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const session = createSession({
    userId,
    vehicleReg,
    batteryCapacity,
    ratePerKwh,
    chargerPower,
  });

  const interval = setInterval(() => {
    const meterData = getSession(session.id);
    if (!meterData) {
      clearInterval(interval);
      return;
    }

    meterData.secondsElapsed += config.METER_UPDATE_INTERVAL / 1000;
    const meterIntervalKwh =
      (meterData.chargerPower * (config.METER_UPDATE_INTERVAL / 1000)) / 3600;
    meterData.totalKwh += meterIntervalKwh;
    meterData.totalCost = meterData.totalKwh * meterData.ratePerKwh;
  }, config.METER_UPDATE_INTERVAL);

  session.interval = interval;

  console.log(`[REST] Charging started: ${session.id}`);
  res.json({ sessionId: session.id });
});

router.post("/api/charging/stop", (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const response = stopSession(sessionId);
  console.log(`[REST] Charging stopped: ${sessionId}`);
  res.json(response);
});

router.get("/api/charging/:sessionId", (req, res) => {
  const session = getSession(req.params.sessionId);

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

router.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    activeChargingSessions: getActiveSessionsCount(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
