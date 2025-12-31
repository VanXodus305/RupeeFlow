import ChargingSession from "@/models/ChargingSession";

export async function GET(request) {
  try {
    // Get userId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get operator's ongoing charging sessions - try both active and completed statuses
    const ongoingSessions = await ChargingSession.find({
      operatorId: userId,
      status: { $in: ["active", "completed"] },
    }).sort({ createdAt: -1 });

    console.log("Fetching sessions for operatorId:", userId);
    console.log("Found sessions:", ongoingSessions.length);

    return new Response(
      JSON.stringify({
        sessions: ongoingSessions || [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching ongoing sessions:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
