import connectDB from "@/lib/mongodb";
import ChargingSession from "@/models/ChargingSession";
import { auth } from "@/auth";

export async function GET(req) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Find charging sessions that are either active or completed but not settled
    const pendingSessions = await ChargingSession.find({
      evOwnerId: session.user.id,
      status: { $in: ["active", "completed"] },
    }).sort({ updatedAt: -1 });

    return new Response(
      JSON.stringify({
        success: true,
        sessions: pendingSessions,
        hasPending: pendingSessions.length > 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pending sessions:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
