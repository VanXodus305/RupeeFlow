import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Import models
import User from "./src/models/User.js";

async function seedDemoOwner() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/rupeeflow";

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Check if demo owner user already exists
    let user = await User.findOne({ email: "owner@example.com" });

    if (!user) {
      console.log("Creating demo owner user...");
      user = await User.create({
        email: "owner@example.com",
        name: "EV Owner",
        role: "owner",
        vehicleReg: "MH-01-AB-1234",
        batteryCapacity: 60,
      });
      console.log("Demo owner user created:", user._id);
    } else {
      console.log("Demo owner user already exists:", user._id);
    }

    console.log("\n✅ Demo owner setup complete!");
    console.log("Use these credentials to login:");
    console.log("  Email: owner@example.com");
    console.log("  Password: password123");
    console.log(`  User ID: ${user._id}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding demo owner:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDemoOwner();
