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
      stationId,
      totalKwh,
      totalCost,
      duration,
      chargePercentage,
      vehicleReg,
      batteryCapacity,
      ratePerKwh,
    } = body;

    await connectDB();

    const chargingSession = await ChargingSession.create({
      sessionId,
      evOwnerId: session.user.id,
      operatorId,
      stationId,
      vehicleReg,
      batteryCapacity,
      totalKwh,
      totalCost,
      duration,
      chargePercentage,
      ratePerKwh,
      status: "completed",
    });

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
