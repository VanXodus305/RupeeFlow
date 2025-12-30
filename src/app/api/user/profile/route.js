import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      vehicleReg: user.vehicleReg,
      batteryCapacity: user.batteryCapacity,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
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
    const { name, vehicleReg, batteryCapacity, role } = body;

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        ...(name && { name }),
        ...(vehicleReg && { vehicleReg }),
        ...(batteryCapacity && { batteryCapacity }),
        ...(role && { role, isFirstLogin: false }),
      },
      { new: true }
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      vehicleReg: user.vehicleReg,
      batteryCapacity: user.batteryCapacity,
      isFirstLogin: user.isFirstLogin,
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
