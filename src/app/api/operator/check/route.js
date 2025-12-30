import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";

export async function GET(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if operator exists for this user
    const operator = await Operator.findOne({ userId: session.user.id });

    if (!operator) {
      return Response.json({ exists: false });
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
