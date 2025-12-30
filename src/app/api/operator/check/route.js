import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let operator;

    // For demo operator, find the seeded operator profile
    if (session.user.id.startsWith("demo-")) {
      operator = await Operator.findOne({
        stationName: "Demo Charging Station",
      });

      if (!operator) {
        // Return true with default demo profile if not seeded
        return Response.json({
          exists: true,
          id: "demo-operator-profile",
          userId: session.user.id,
          stationName: "Demo Charging Station",
          stationAddress: "123 Main Street, Demo City",
          chargerPower: 7.4,
          ratePerKwh: 12,
          totalEnergyDelivered: 0,
          totalRevenue: 0,
        });
      }
    } else {
      // Validate ObjectId before querying
      if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
        return Response.json({ exists: false });
      }

      // Check if operator exists for this user
      operator = await Operator.findOne({ userId: session.user.id });

      if (!operator) {
        return Response.json({ exists: false });
      }
    }

    return Response.json({
      exists: true,
      id: operator._id.toString(),
      userId: operator.userId.toString(),
      stationName: operator.stationName,
      stationAddress: operator.stationAddress,
      chargerPower: operator.chargerPower,
      ratePerKwh: operator.ratePerKwh,
      totalEnergyDelivered: operator.totalEnergyDelivered,
      totalRevenue: operator.totalRevenue,
    });
  } catch (error) {
    console.error("Operator check error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
