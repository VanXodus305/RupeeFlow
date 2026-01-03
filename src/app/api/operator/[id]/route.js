import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid operator ID format" },
        { status: 400 }
      );
    }

    const operator = await Operator.findById(id);

    if (!operator) {
      return Response.json({ error: "Operator not found" }, { status: 404 });
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
      walletAddress: operator.walletAddress || "",
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
