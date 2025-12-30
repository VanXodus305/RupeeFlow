import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Operator from "@/models/Operator";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "owner") {
      return Response.json(
        { error: "Only owners can create operator profiles" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { stationName, stationAddress, chargerPower, ratePerKwh } = body;

    await connectDB();

    // Update user role to operator
    await User.findByIdAndUpdate(session.user.id, { role: "operator" });

    // Create operator profile
    const operator = await Operator.create({
      userId: session.user.id,
      stationName,
      stationAddress,
      chargerPower: chargerPower || 7.4,
      ratePerKwh: ratePerKwh || 12,
    });

    return Response.json({
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
    console.error("Operator create error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
