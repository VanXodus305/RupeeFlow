import mongoose from "mongoose";

const operatorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stationName: {
      type: String,
      required: true,
    },
    stationAddress: String,
    walletAddress: {
      type: String,
      required: [true, "Wallet address is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message:
          "Invalid Ethereum wallet address format (must be 0x followed by 40 hex characters)",
      },
    },
    chargerPower: {
      type: Number,
      default: 7.4,
    },
    ratePerKwh: {
      type: Number,
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

export default mongoose.models.Operator ||
  mongoose.model("Operator", operatorSchema);
