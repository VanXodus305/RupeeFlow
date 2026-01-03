import { config } from "./config.js";

// In-memory charging session store
const activeChargingSessions = new Map();

/**
 * Create a new charging session
 */
export function createSession(data) {
  const sessionId = `charging_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const session = {
    id: sessionId,
    userId: data.userId,
    vehicleReg: data.vehicleReg,
    batteryCapacity: data.batteryCapacity,
    initialBatteryPercent: data.initialBatteryPercent || 0,
    ratePerKwh: data.ratePerKwh || config.RATE_PER_KWH,
    chargerPower: data.chargerPower || config.CHARGER_POWER_KW,
    startTime: Date.now(),
    secondsElapsed: 0,
    totalKwh: 0,
    totalCost: 0,
    currentPower: data.chargerPower || config.CHARGER_POWER_KW,
    socketId: data.socketId || null,
    interval: null,
  };

  activeChargingSessions.set(sessionId, session);
  return session;
}

/**
 * Get a session by ID
 */
export function getSession(sessionId) {
  return activeChargingSessions.get(sessionId);
}

/**
 * Update session with meter reading
 */
export function updateMeterReading(sessionId) {
  const session = activeChargingSessions.get(sessionId);
  if (!session) return null;

  session.secondsElapsed += config.METER_UPDATE_INTERVAL / 1000;

  // Calculate kWh: (Power kW × Time seconds) / 3600
  const meterIntervalKwh =
    (session.chargerPower * (config.METER_UPDATE_INTERVAL / 1000)) / 3600;
  session.totalKwh += meterIntervalKwh;
  session.totalCost = session.totalKwh * session.ratePerKwh;

  // Battery percentage increase from charging
  const chargePercentage = Math.min(
    (session.totalKwh / session.batteryCapacity) * 100,
    100
  );

  return {
    sessionId,
    secondsElapsed: Math.floor(session.secondsElapsed),
    totalKwh: parseFloat(session.totalKwh.toFixed(2)),
    totalCost: parseFloat(session.totalCost.toFixed(2)),
    currentPower: session.currentPower,
    chargePercentage: parseFloat(chargePercentage.toFixed(1)),
    initialBatteryPercent: session.initialBatteryPercent,
  };
}

/**
 * Stop a charging session
 */
export function stopSession(sessionId) {
  const session = activeChargingSessions.get(sessionId);
  if (!session) return null;

  if (session.interval) {
    clearInterval(session.interval);
    session.interval = null; // Clear but keep session
  }

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
    initialBatteryPercent: session.initialBatteryPercent,
    startTime: new Date(session.startTime).toISOString(),
  };

  // DO NOT delete the session - keep it in memory for resuming
  return response;
}

/**
 * Resume a paused charging session
 */
export function resumeSession(sessionId) {
  const session = activeChargingSessions.get(sessionId);
  if (!session) return null;

  return session;
}

/**
 * Delete a session
 */
export function deleteSession(sessionId) {
  const session = activeChargingSessions.get(sessionId);
  if (session && session.interval) {
    clearInterval(session.interval);
  }
  activeChargingSessions.delete(sessionId);
}

/**
 * Get all active sessions
 */
export function getAllActiveSessions() {
  return Array.from(activeChargingSessions.values());
}

/**
 * Get active sessions count
 */
export function getActiveSessionsCount() {
  return activeChargingSessions.size;
}

/**
 * Clean up sessions for a disconnected socket
 */
export function cleanupSocketSessions(socketId) {
  activeChargingSessions.forEach((session, sessionId) => {
    if (session.socketId === socketId) {
      deleteSession(sessionId);
    }
  });
}
