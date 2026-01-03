import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(request) {
  try {
    const { email, name, image, googleId } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    let dbUser = await User.findOne({ email });

    if (!dbUser) {
      dbUser = await User.create({
        email,
        name,
        image,
        googleId,
        role: null,
      });
    } else if (!dbUser.googleId) {
      dbUser.googleId = googleId;
      await dbUser.save();
    }

    return Response.json({
      id: dbUser._id.toString(),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      googleId: dbUser.googleId,
    });
  } catch (error) {
    console.error("Google signIn API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
