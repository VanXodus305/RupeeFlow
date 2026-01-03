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
        if (
          credentials.email === "owner@example.com" ||
          credentials.email === "operator@example.com"
        ) {
          try {
            const response = await fetch(
              `${process.env.NEXTAUTH_URL}/api/auth/credentials-signin`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: credentials.email,
                  password: credentials.password,
                }),
              }
            );

            if (!response.ok) {
              return null;
            }

            const user = await response.json();
            return user;
          } catch (error) {
            console.error("Credentials signin error:", error);
            return null;
          }
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
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.googleId = user.googleId;
        token.isDemo = user.isDemo || false;
      }

      if (trigger === "update" && session?.user?.role) {
        token.role = session.user.role;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.googleId = token.googleId;
      session.user.isDemo = token.isDemo || false;

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
        }
      }

      return session;
    },

    async redirect({ url, baseUrl }) {

      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
});
