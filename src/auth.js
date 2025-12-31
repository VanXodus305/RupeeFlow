export const runtime = "nodejs";

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      async authorize(credentials) {
        const demoUser = demoUsers.find(
          (u) =>
            u.email === credentials.email && u.password === credentials.password
        );

        if (demoUser) {
          // Fetch the real MongoDB user to get their actual ObjectId
          try {
            const { default: connectDB } = await import("@/lib/mongodb");
            const { default: User } = await import("@/models/User");

            await connectDB();

            const dbUser = await User.findOne({ email: demoUser.email });
            if (dbUser) {
              return {
                id: dbUser._id.toString(), // Use real MongoDB ObjectId
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role,
                isDemo: true, // Mark as demo user
              };
            }
          } catch (error) {
            console.error("Error fetching demo user from DB:", error);
          }

          // Fallback to hardcoded user if DB fetch fails
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            isDemo: true, // Mark as demo user
          };
        }
        return null;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const { default: connectDB } = await import("@/lib/mongodb");
          const { default: User } = await import("@/models/User");

          await connectDB();

          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            // New Google user - create with role: null
            dbUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: profile?.sub,
              role: null, // No role selected yet
            });
          } else if (!dbUser.googleId) {
            // Existing user linking Google account
            dbUser.googleId = profile?.sub;
            await dbUser.save();
          }

          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.googleId = dbUser.googleId;
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.googleId = user.googleId;
        token.isDemo = user.isDemo || false;
      }

      // Handle update trigger from client-side update() call
      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }

      return token;
    },

    async session({ session, token }) {
      // Use token data for session
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.googleId = token.googleId;
      session.user.isDemo = token.isDemo || false;

      // Try to fetch additional fields from database (vehicleReg, batteryCapacity)
      // but don't fail if it doesn't work
      if (!token.isDemo) {
        try {
          const { default: connectDB } = await import("@/lib/mongodb");
          const { default: User } = await import("@/models/User");

          await connectDB();
          const user = await User.findById(token.id).lean();

          if (user) {
            session.user.vehicleReg = user.vehicleReg;
            session.user.batteryCapacity = user.batteryCapacity;
          }
        } catch (error) {
          // It's okay if we can't fetch additional fields
          // The essential fields (id, email, role) come from the token
        }
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // After OAuth, redirect to home page
      // Middleware will then check the user's role and redirect to appropriate page
      // This ensures middleware has a chance to check the fresh session data
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Redirect to root, let middleware handle the routing
      return baseUrl;
    },
  },
});
