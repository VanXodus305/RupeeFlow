import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: process.env.PORT || 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CHARGER_POWER_KW: 7.4,
  METER_UPDATE_INTERVAL: 500, 
  RATE_PER_KWH: 12, // ₹12/kWh
};

export const corsOptions = {
  origin: config.CORS_ORIGIN,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
