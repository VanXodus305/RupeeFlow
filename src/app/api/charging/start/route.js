export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, vehicleReg, batteryCapacity, ratePerKwh, chargerPower } =
      body;

    if (!userId || !vehicleReg || !batteryCapacity) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const response = await fetch(`${backendUrl}/api/charging/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        vehicleReg,
        batteryCapacity,
        ratePerKwh,
        chargerPower,
      }),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
