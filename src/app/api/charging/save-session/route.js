import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import ChargingSession from "@/models/ChargingSession";
import Operator from "@/models/Operator";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      sessionId,
      operatorId,
      totalKwh,
      totalCost,
      duration,
      chargePercentage,
      vehicleReg,
      batteryCapacity,
      ratePerKwh,
    } = body;

    await connectDB();

    // Save charging session
    const chargingSession = await ChargingSession.create({
      sessionId,
      evOwnerId: session.user.id,
      operatorId,
      vehicleReg,
      batteryCapacity,
      totalKwh,
      totalCost,
      duration,
      chargePercentage,
      ratePerKwh,
      status: "completed",
    });

    // Update operator stats
    const operator = await Operator.findByIdAndUpdate(
      operatorId,
      {
        $inc: {
          totalEnergyDelivered: totalKwh,
          totalRevenue: totalCost,
        },
        $push: {
          chargingSessions: chargingSession._id,
        },
      },
      { new: true }
    );

    return Response.json({
      sessionId: chargingSession._id.toString(),
      status: "completed",
      operatorStats: {
        totalEnergyDelivered: operator.totalEnergyDelivered,
        totalRevenue: operator.totalRevenue,
      },
    });
  } catch (error) {
    console.error("Save session error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
