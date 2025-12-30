import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import ChargingSession from "@/models/ChargingSession";
import Operator from "@/models/Operator";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let sessions;
    let totalKwh = 0;
    let totalRevenue = 0;

    if (session.user.role === "operator") {
      // Operator: Get charging history for their station
      let operator;

      // For demo operator, try to find the seeded operator profile
      if (session.user.id.startsWith("demo-")) {
        operator = await Operator.findOne({
          stationName: "Demo Charging Station",
        });
      } else {
        // For real operators, validate ObjectId first
        if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
          return Response.json({ sessions: [], totalKwh: 0, totalRevenue: 0 });
        }
        operator = await Operator.findOne({ userId: session.user.id });
      }

      if (!operator) {
        return Response.json({
          sessions: [],
          totalKwh: 0,
          totalRevenue: 0,
        });
      }

      sessions = await ChargingSession.find({ operatorId: operator._id })
        .sort({ createdAt: -1 })
        .lean();

      // Calculate totals from sessions
      totalKwh = sessions.reduce((sum, s) => sum + (s.totalKwh || 0), 0);
      totalRevenue = sessions.reduce((sum, s) => sum + (s.totalCost || 0), 0);
    } else {
      // EV Owner: Get their own charging sessions
      if (session.user.id.startsWith("demo-")) {
        // Demo users have no sessions
        sessions = [];
      } else {
        // Validate ObjectId for real users
        if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
          sessions = [];
        } else {
          sessions = await ChargingSession.find({
            evOwnerId: session.user.id,
          }).sort({ createdAt: -1 });

          // Calculate totals from sessions
          totalKwh = sessions.reduce((sum, s) => sum + (s.totalKwh || 0), 0);
          totalRevenue = sessions.reduce(
            (sum, s) => sum + (s.totalCost || 0),
            0
          );
        }
      }
    }

    // Format sessions for display
    const formattedSessions = sessions.map((s) => ({
      id: s._id.toString(),
      sessionId: s.sessionId || s._id.toString(),
      vehicleReg: s.vehicleReg || "N/A",
      totalKwh: parseFloat((s.totalKwh || 0).toFixed(2)),
      totalCost: parseFloat((s.totalCost || 0).toFixed(2)),
      duration: s.duration || 0,
      chargePercentage: parseFloat((s.chargePercentage || 0).toFixed(1)),
      status: s.status,
      createdAt: s.createdAt,
    }));

    return Response.json({
      sessions: formattedSessions,
      totalKwh: parseFloat(totalKwh.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
