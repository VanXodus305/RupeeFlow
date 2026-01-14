import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";
import Station from "@/models/Station";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let operator;

    if (session.user.isDemo) {
      operator = await Operator.findOne({
        userId: session.user.id,
      }).populate("stations");

      if (!operator) {
        return Response.json({
          exists: true,
          id: "demo-operator-profile",
          userId: session.user.id,
          walletAddress: "0x" + "0".repeat(40),
          stations: [
            {
              _id: "demo-station-1",
              stationName: "Demo Charging Station",
              stationAddress: "123 Main Street, Demo City",
              chargerPower: 7.4,
              ratePerKwh: 12,
            },
          ],
          totalEnergyDelivered: 0,
          totalRevenue: 0,
        });
      }
    } else {
      if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
        return Response.json({ exists: false });
      }

      operator = await Operator.findOne({ userId: session.user.id }).populate(
        "stations"
      );

      if (!operator) {
        return Response.json({ exists: false });
      }
    }

    return Response.json({
      exists: true,
      id: operator._id.toString(),
      userId: operator.userId ? operator.userId.toString() : operator.userId,
      walletAddress: operator.walletAddress,
      stations: operator.stations || [],
      totalEnergyDelivered: operator.totalEnergyDelivered || 0,
      totalRevenue: operator.totalRevenue || 0,
    });
  } catch (error) {
    console.error("Operator check error:", error);
    return Response.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
