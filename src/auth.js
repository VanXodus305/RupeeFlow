import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";

// Import User model at the top level but wrapped to avoid issues
let User = null;

async function getUser() {
  if (!User) {
    User = (await import("./models/User.js")).default;
  }
  return User;
}

// Temporary user database for credentials provider demo
const demoUsers = [
  {
    id: "demo-1",
    email: "owner@example.com",
    password: "password123",
    name: "EV Owner",
    role: "owner",
  },
  {
    id: "demo-2",
    email: "operator@example.com",
    password: "password123",
    name: "Station Operator",
    role: "operator",
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      async authorize(credentials) {
        try {
          // Only accept demo credentials
          const demoUser = demoUsers.find(
            (u) =>
              u.email === credentials.email &&
              u.password === credentials.password
          );

          if (demoUser) {
            return {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              role: demoUser.role,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
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
          const UserModel = await getUser();
          await connectDB();

          let dbUser = await UserModel.findOne({ email: user.email });
          let isNewUser = false;

          if (!dbUser) {
            // First-time Google login - create new user with isFirstLogin = true
            dbUser = await UserModel.create({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: profile?.sub,
              role: "owner",
              isFirstLogin: true,
            });
            isNewUser = true;
          } else if (!dbUser.googleId) {
            // Existing user linking Google account
            dbUser.googleId = profile?.sub;
            await dbUser.save();
          }

          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.googleId = dbUser.googleId;
          user.isFirstLogin = isNewUser || dbUser.isFirstLogin;
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.googleId = user.googleId;
        token.isFirstLogin = user.isFirstLogin;
      } else {
        // On subsequent calls (not initial sign in), fetch fresh data from DB
        if (token.id && !token.id.startsWith("demo-")) {
          try {
            const UserModel = await getUser();
            await connectDB();
            const dbUser = await UserModel.findById(token.id).lean();

            if (dbUser) {
              token.role = dbUser.role;
              token.isFirstLogin = dbUser.isFirstLogin;
              token.googleId = dbUser.googleId;
            }
          } catch (error) {
            console.warn("JWT callback DB fetch failed:", error.message);
            // Use existing token values on error
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      try {
        // Fallback for demo users
        if (token.id?.startsWith("demo-")) {
          session.user.id = token.id;
          session.user.role = token.role;
          session.user.isFirstLogin = false;
          return session;
        }

        // For Google users, fetch fresh data from MongoDB
        const UserModel = await getUser();
        await connectDB();
        const user = await UserModel.findById(token.id).lean();

        if (user) {
          console.log("Fetched user from DB:", {
            id: user._id,
            isFirstLogin: user.isFirstLogin,
            role: user.role,
          });
          session.user.id = user._id.toString();
          session.user.role = user.role;
          session.user.googleId = user.googleId;
          session.user.vehicleReg = user.vehicleReg;
          session.user.batteryCapacity = user.batteryCapacity;
          session.user.isFirstLogin = user.isFirstLogin;
        } else {
          // Fallback if user not found
          session.user.id = token.id;
          session.user.role = token.role;
          session.user.isFirstLogin = token.isFirstLogin || false;
        }
      } catch (error) {
        console.error("Session callback error:", error);
        // Fallback to token data on error
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isFirstLogin = token.isFirstLogin || false;
      }

      return session;
    },
  },
});
