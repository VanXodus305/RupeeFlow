import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "operator") {
      return Response.json(
        { error: "Only operators can create operator profiles" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { stationName, stationAddress, chargerPower, ratePerKwh } = body;

    await connectDB();

    // Check if operator profile already exists
    const existingOperator = await Operator.findOne({
      userId: session.user.id,
    });

    if (existingOperator) {
      return Response.json(
        { error: "Operator profile already exists" },
        { status: 400 }
      );
    }

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
