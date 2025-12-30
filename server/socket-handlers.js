import { config } from "./config.js";
import {
  createSession,
  getSession,
  updateMeterReading,
  stopSession,
  resumeSession,
  deleteSession,
  cleanupSocketSessions,
} from "./charging-manager.js";

/**
 * Initialize Socket.io event handlers
 */
export function initializeSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("start-charging", (data) => {
      console.log(`[Socket] Start charging request:`, data);

      const session = createSession({ ...data, socketId: socket.id });
      socket.emit("charging-started", { sessionId: session.id });
      console.log(`[Socket] Charging session created: ${session.id}`);

      // Meter reading simulation every 0.5 seconds
      const interval = setInterval(() => {
        const meterData = updateMeterReading(session.id);
        if (!meterData) {
          clearInterval(interval);
          return;
        }

        socket.emit("meter-reading", meterData);
      }, config.METER_UPDATE_INTERVAL);

      session.interval = interval;
    });

    socket.on("stop-charging", (data) => {
      console.log(`[Socket] Stop charging request: ${data.sessionId}`);

      const response = stopSession(data.sessionId);
      if (response) {
        socket.emit("charging-stopped", response);
        console.log(`[Socket] Charging stopped: ${data.sessionId}`);
      }
    });

    socket.on("resume-charging", (data) => {
      console.log(`[Socket] Resume charging request: ${data.sessionId}`);

      const session = resumeSession(data.sessionId);
      if (!session) {
        socket.emit("resume-error", { error: "Session not found" });
        return;
      }

      socket.emit("charging-resumed", { sessionId: session.id });
      console.log(`[Socket] Charging resumed: ${session.id}`);

      // Restart meter reading simulation every 0.5 seconds
      const interval = setInterval(() => {
        const meterData = updateMeterReading(session.id);
        if (!meterData) {
          clearInterval(interval);
          return;
        }

        socket.emit("meter-reading", meterData);
      }, config.METER_UPDATE_INTERVAL);

      session.interval = interval;
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      cleanupSocketSessions(socket.id);
    });
  });
}
