import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config, corsOptions } from "./config.js";
import { initializeSocketHandlers } from "./socket-handlers.js";
import routes from "./routes.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Socket.io handlers
initializeSocketHandlers(io);

// REST API Routes
app.use(routes);

// Start server
server.listen(config.PORT, () => {
  console.log(`\n⚡ RupeeFlow Backend running on port ${config.PORT}`);
  console.log(`📊 WebSocket enabled for real-time meter readings`);
  console.log(`🔗 CORS origin: ${config.CORS_ORIGIN}\n`);
});
