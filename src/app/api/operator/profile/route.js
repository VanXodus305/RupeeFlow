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
    const operator = await Operator.findOne({ userId: session.user.id });

    if (!operator) {
      return Response.json(
        { error: "Operator profile not found" },
        { status: 404 }
      );
    }

    return Response.json({
      id: operator._id.toString(),
      userId: operator.userId.toString(),
      stationName: operator.stationName,
      stationAddress: operator.stationAddress,
      chargerPower: operator.chargerPower,
      ratePerKwh: operator.ratePerKwh,
      totalEnergyDelivered: operator.totalEnergyDelivered,
      totalRevenue: operator.totalRevenue,
      chargingSessions: operator.chargingSessions,
    });
  } catch (error) {
    console.error("Operator profile GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { stationName, stationAddress, chargerPower, ratePerKwh } = body;

    await connectDB();
    const operator = await Operator.findOneAndUpdate(
      { userId: session.user.id },
      {
        ...(stationName && { stationName }),
        ...(stationAddress && { stationAddress }),
        ...(chargerPower && { chargerPower }),
        ...(ratePerKwh && { ratePerKwh }),
      },
      { new: true }
    );

    if (!operator) {
      return Response.json(
        { error: "Operator profile not found" },
        { status: 404 }
      );
    }

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
    console.error("Operator profile PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
