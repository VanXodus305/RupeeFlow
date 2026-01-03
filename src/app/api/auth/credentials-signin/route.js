import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (
      (email !== "owner@example.com" && email !== "operator@example.com") ||
      password !== "password123"
    ) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await connectDB();
    const dbUser = await User.findOne({ email });

    if (!dbUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      id: dbUser._id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      isDemo: true,
    });
  } catch (error) {
    console.error("Credentials signin API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
