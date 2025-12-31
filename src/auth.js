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
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            isDemo: true,
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
          // Call API route to handle Google user creation/linking
          // This avoids importing Mongoose in the edge runtime (middleware)
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/auth/google-signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
                googleId: profile?.sub,
              }),
            }
          );

          if (!response.ok) {
            console.error("Google signIn API error:", response.status);
            return false;
          }

          const data = await response.json();
          user.id = data.id;
          user.role = data.role;
          user.googleId = data.googleId;
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

      // For non-demo users, try to fetch additional fields from API
      if (!token.isDemo && token.id) {
        try {
          const response = await fetch(
            `${process.env.NEXTAUTH_URL}/api/user/profile/${token.id}`
          );
          if (response.ok) {
            const data = await response.json();
            session.user.vehicleReg = data.vehicleReg;
            session.user.batteryCapacity = data.batteryCapacity;
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
