import connectDB from "@/lib/mongodb";
import ChargingSession from "@/models/ChargingSession";
import { auth } from "@/auth";

export async function POST(req) {
  try {
    await connectDB();
    const session = await auth();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { sessionId, transactionHash } = await req.json();

    if (!sessionId || !transactionHash) {
      return new Response(
        JSON.stringify({
          error: "Missing sessionId or transactionHash",
        }),
        { status: 400 }
      );
    }

    const chargingSession = await ChargingSession.findOne({
      sessionId: sessionId,
      evOwnerId: session.user.id,
    });

    if (!chargingSession) {
      return new Response(
        JSON.stringify({ error: "Charging session not found" }),
        { status: 404 }
      );
    }

    chargingSession.status = "settled";
    chargingSession.transactionHash = transactionHash;
    await chargingSession.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Session marked as settled",
        session: chargingSession,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking session as settled:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
