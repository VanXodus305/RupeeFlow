import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>RupeeFlow - EV Charging Payment</h1>
        <p>Real-time pay-as-you-use charging with blockchain settlement</p>
        <Link href="/login">
          <button style={{ padding: "10px 20px", fontSize: "16px" }}>
            Login
          </button>
        </Link>
      </div>
    );
  }

  if (session.user.role === "operator") {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Station Dashboard</h1>
        <Link href="/station-dashboard">
          <button style={{ padding: "10px 20px" }}>Go to Dashboard</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>EV Owner Dashboard</h1>
      <Link href="/ev-owner-dashboard">
        <button style={{ padding: "10px 20px" }}>Go to Dashboard</button>
      </Link>
    </div>
  );
}
