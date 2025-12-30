import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import ChargingSession from "@/models/ChargingSession";

export async function GET(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const sessions = await ChargingSession.find({
      evOwnerId: session.user.id,
    }).sort({ createdAt: -1 });

    return Response.json({
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        sessionId: s.sessionId,
        totalKwh: s.totalKwh,
        totalCost: s.totalCost,
        duration: s.duration,
        chargePercentage: s.chargePercentage,
        status: s.status,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
