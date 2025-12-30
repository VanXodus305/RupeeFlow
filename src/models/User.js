import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: String,
    role: {
      type: String,
      enum: ["owner", "operator", null],
      default: null,
    },
    googleId: String,
    vehicleReg: String,
    batteryCapacity: Number,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
