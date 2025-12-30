import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import "./globals.css";

export const metadata = {
  title: "RupeeFlow - EV Charging Payment",
  description:
    "Real-time pay-as-you-use EV charging with blockchain settlement",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
