import { auth } from "@/auth";
import ChargingSession from "@/models/ChargingSession";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, totalKwh, totalCost, duration, transactionHash } =
      await req.json();

    if (
      !sessionId ||
      !totalKwh ||
      !totalCost ||
      !duration ||
      !transactionHash
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const chargingSession = await ChargingSession.findByIdAndUpdate(
      sessionId,
      {
        totalKwh,
        totalCost,
        duration,
        settled: true,
        transactionHash,
        settledAt: new Date(),
      },
      { new: true }
    );

    if (!chargingSession) {
      return Response.json(
        { error: "Charging session not found" },
        { status: 404 }
      );
    }

    console.log(`[Settle] Settlement recorded for session ${sessionId}`);

    return Response.json({
      message: "Settlement recorded successfully",
      transactionHash,
      sessionId,
    });
  } catch (error) {
    console.error("[Settle] Error:", error);
    return Response.json(
      { error: error.message || "Settlement failed" },
      { status: 500 }
    );
  }
}
