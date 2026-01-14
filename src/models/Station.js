import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      required: true,
    },
    stationName: {
      type: String,
      required: true,
    },
    stationAddress: String,
    chargerPower: {
      type: Number,
      required: true,
      default: 7.4,
    },
    ratePerKwh: {
      type: Number,
      required: true,
      default: 12,
    },
    totalEnergyDelivered: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    chargingSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChargingSession",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Station ||
  mongoose.model("Station", stationSchema);
