import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Import models
import User from "./src/models/User.js";
import Operator from "./src/models/Operator.js";

async function seedDemoOperator() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/rupeeflow";

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Check if demo operator user already exists
    let user = await User.findOne({ email: "operator@example.com" });

    if (!user) {
      console.log("Creating demo operator user...");
      user = await User.create({
        email: "operator@example.com",
        name: "Station Operator",
        role: "operator",
      });
      console.log("Demo operator user created:", user._id);
    } else {
      console.log("Demo operator user already exists:", user._id);
    }

    // Check if operator profile already exists
    let operator = await Operator.findOne({ userId: user._id });

    if (!operator) {
      console.log("Creating demo operator profile...");
      operator = await Operator.create({
        userId: user._id,
        stationName: "Demo Charging Station",
        stationAddress: "123 Main Street, Demo City",
        chargerPower: 7.4,
        ratePerKwh: 12,
        totalEnergyDelivered: 0,
        totalRevenue: 0,
      });
      console.log("Demo operator profile created:", operator._id);
    } else {
      console.log("Demo operator profile already exists:", operator._id);
    }

    console.log("\n✅ Demo operator setup complete!");
    console.log("Use these credentials to login:");
    console.log("  Email: operator@example.com");
    console.log("  Password: password123");
    console.log(`  Station ID: ${operator._id}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding demo operator:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDemoOperator();
