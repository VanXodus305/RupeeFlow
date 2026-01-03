import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";
import mongoose from "mongoose";

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
    const {
      stationName,
      stationAddress,
      chargerPower,
      ratePerKwh,
      walletAddress,
    } = body;

    // Demo users cannot create profiles via API
    if (session.user.isDemo) {
      return Response.json(
        {
          error:
            "Demo accounts cannot create profiles via API. Use seed:operator command instead.",
        },
        { status: 403 }
      );
    }

    await connectDB();

    // Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return Response.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

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
      walletAddress,
      chargerPower: chargerPower || 7.4,
      ratePerKwh: ratePerKwh || 12,
    });

    return Response.json({
      id: operator._id.toString(),
      userId: operator.userId.toString(),
      stationName: operator.stationName,
      stationAddress: operator.stationAddress,
      walletAddress: operator.walletAddress,
      chargerPower: operator.chargerPower,
      ratePerKwh: operator.ratePerKwh,
      totalEnergyDelivered: operator.totalEnergyDelivered,
      totalRevenue: operator.totalRevenue,
    });
  } catch (error) {
    console.error("Operator create error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      return Response.json({ error: messages }, { status: 400 });
    }

    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
