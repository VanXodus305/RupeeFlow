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

export function initializeSocketHandlers(io) {
  const operatorSockets = new Map();

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

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

      const interval = setInterval(() => {
        const meterData = updateMeterReading(session.id);
        if (!meterData) {
          clearInterval(interval);
          return;
        }

        meterData.ownerName = data.ownerName || "Unknown User";
        meterData.vehicleReg = session.vehicleReg;
        meterData.stationName = data.stationName;

        socket.emit("meter-reading", meterData);

        if (data.operatorId && operatorSockets.has(data.operatorId)) {
          const operatorIds = operatorSockets.get(data.operatorId);
          operatorIds.forEach((opSocketId) => {
            io.to(opSocketId).emit("meter-reading", {
              ...meterData,
              ownerName: data.ownerName || "Unknown User",
              vehicleReg: session.vehicleReg,
              stationName: data.stationName,
            });
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

      const interval = setInterval(() => {
        const meterData = updateMeterReading(session.id);
        if (!meterData) {
          clearInterval(interval);
          return;
        }

        meterData.ownerName = data.ownerName || "Unknown User";
        meterData.vehicleReg = session.vehicleReg;
        meterData.stationName = data.stationName;

        socket.emit("meter-reading", meterData);

        if (data.operatorId && operatorSockets.has(data.operatorId)) {
          const operatorIds = operatorSockets.get(data.operatorId);
          operatorIds.forEach((opSocketId) => {
            io.to(opSocketId).emit("meter-reading", {
              ...meterData,
              ownerName: data.ownerName || "Unknown User",
              vehicleReg: session.vehicleReg,
              stationName: data.stationName,
            });
          });
        }
      }, config.METER_UPDATE_INTERVAL);

      session.interval = interval;
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);

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
