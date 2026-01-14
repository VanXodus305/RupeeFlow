import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";
import Station from "@/models/Station";
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
    const { walletAddress, stations } = body;

    if (!walletAddress || !stations || stations.length === 0) {
      return Response.json(
        {
          error: "Wallet address and at least one station are required",
        },
        { status: 400 }
      );
    }

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

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return Response.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const existingOperator = await Operator.findOne({
      userId: session.user.id,
    });

    if (existingOperator) {
      return Response.json(
        { error: "Operator profile already exists" },
        { status: 400 }
      );
    }

    const operator = await Operator.create({
      userId: session.user.id,
      walletAddress,
      stations: [],
    });

    const createdStations = [];
    for (const stationData of stations) {
      const station = await Station.create({
        operatorId: operator._id,
        stationName: stationData.stationName,
        stationAddress: stationData.stationAddress,
        chargerPower: stationData.chargerPower || 7.4,
        ratePerKwh: stationData.ratePerKwh || 12,
        status: "active",
      });
      createdStations.push(station._id);
    }

    operator.stations = createdStations;
    await operator.save();

    return Response.json({
      id: operator._id.toString(),
      userId: operator.userId.toString(),
      walletAddress: operator.walletAddress,
      stations: createdStations.map((s) => s.toString()),
      totalEnergyDelivered: operator.totalEnergyDelivered,
      totalRevenue: operator.totalRevenue,
    });
  } catch (error) {
    console.error("Operator create error:", error);

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
