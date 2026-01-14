import mongoose from "mongoose";

const operatorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    totalEnergyDelivered: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    stations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
      },
    ],
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
