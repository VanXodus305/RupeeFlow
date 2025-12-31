import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(id).lean();

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      id: user._id.toString(),
      vehicleReg: user.vehicleReg,
      batteryCapacity: user.batteryCapacity,
    });
  } catch (error) {
    console.error("User profile API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
