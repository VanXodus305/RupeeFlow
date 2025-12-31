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
  // Store operator socket IDs by operatorId
  const operatorSockets = new Map();

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Register operator socket
    socket.on("register-operator", (data) => {
      const { operatorId } = data;
      if (!operatorSockets.has(operatorId)) {
        operatorSockets.set(operatorId, []);
      }
      operatorSockets.get(operatorId).push(socket.id);
    });

    socket.on("start-charging", (data) => {
      const session = createSession({ ...data, socketId: socket.id });
      socket.emit("charging-started", { sessionId: session.id });

      // Meter reading simulation every 0.5 seconds
      const interval = setInterval(() => {
        const meterData = updateMeterReading(session.id);
        if (!meterData) {
          clearInterval(interval);
          return;
        }

        // Add owner info to meter data
        meterData.ownerName = data.ownerName || "Unknown User";
        meterData.vehicleReg = session.vehicleReg;

        // Emit to owner socket
        socket.emit("meter-reading", meterData);

        // Also emit to operator socket(s)
        if (data.operatorId && operatorSockets.has(data.operatorId)) {
          const operatorIds = operatorSockets.get(data.operatorId);
          operatorIds.forEach((opSocketId) => {
            io.to(opSocketId).emit("meter-reading", meterData);
          });
        }
      }, config.METER_UPDATE_INTERVAL);

      session.interval = interval;
    });

    socket.on("stop-charging", (data) => {
      const response = stopSession(data.sessionId);
      if (response) {
        socket.emit("charging-stopped", response);
      }
    });

    socket.on("resume-charging", (data) => {
      const session = resumeSession(data.sessionId);
      if (!session) {
        socket.emit("resume-error", { error: "Session not found" });
        return;
      }

      socket.emit("charging-resumed", { sessionId: session.id });

      // Restart meter reading simulation every 0.5 seconds
      const interval = setInterval(() => {
        const meterData = updateMeterReading(session.id);
        if (!meterData) {
          clearInterval(interval);
          return;
        }

        socket.emit("meter-reading", meterData);

        // Also emit to operator socket(s)
        if (data.operatorId && operatorSockets.has(data.operatorId)) {
          const operatorIds = operatorSockets.get(data.operatorId);
          operatorIds.forEach((opSocketId) => {
            io.to(opSocketId).emit("meter-reading", meterData);
          });
        }
      }, config.METER_UPDATE_INTERVAL);

      session.interval = interval;
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);

      // Remove from operator sockets map
      operatorSockets.forEach((sockets, operatorId) => {
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
          if (sockets.length === 0) {
            operatorSockets.delete(operatorId);
          }
        }
      });

      cleanupSocketSessions(socket.id);
    });
  });
}
