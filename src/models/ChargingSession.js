import mongoose from "mongoose";

const chargingSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    evOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    vehicleReg: String,
    batteryCapacity: Number,
    totalKwh: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    chargePercentage: {
      type: Number,
      default: 0,
    },
    chargerPower: {
      type: Number,
      default: 7.4,
    },
    ratePerKwh: {
      type: Number,
      required: true,
      default: 12,
    },
    status: {
      type: String,
      enum: ["active", "completed", "settled"],
      default: "active",
    },
    transactionHash: String,
  },
  { timestamps: true }
);

export default mongoose.models.ChargingSession ||
  mongoose.model("ChargingSession", chargingSessionSchema);
