import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import Operator from "@/models/Operator";
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
        stationName: "Demo Charging Station",
      });

      if (!operator) {
        return Response.json({
          id: "demo-operator-profile",
          userId: session.user.id,
          stationName: "Demo Charging Station",
          stationAddress: "123 Main Street, Demo City",
          chargerPower: 7.4,
          ratePerKwh: 12,
          totalEnergyDelivered: 0,
          totalRevenue: 0,
          chargingSessions: [],
        });
      }
    } else {
      if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
        return Response.json(
          { error: "Invalid user ID format" },
          { status: 400 }
        );
      }

      operator = await Operator.findOne({ userId: session.user.id });

      if (!operator) {
        return Response.json(
          { error: "Operator profile not found" },
          { status: 404 }
        );
      }
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

    // Demo users cannot update profiles via API
    if (session.user.id.startsWith("demo-")) {
      return Response.json(
        { error: "Demo accounts cannot update profiles via API" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return Response.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

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
