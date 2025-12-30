"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function StationDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [settlements, setSettlements] = useState([]);

  // Redirect owners to EV owner dashboard
  useEffect(() => {
    if (session && session.user?.role === "owner") {
      router.push("/ev-owner-dashboard");
    }
  }, [session, router]);

  // Simulated settlements data
  useEffect(() => {
    setSettlements([
      {
        id: 1,
        vehicleReg: "MH-01-AB-1234",
        kwh: 3.7,
        amount: 44.4,
        duration: 1800,
        date: "2025-12-29 10:30",
      },
      {
        id: 2,
        vehicleReg: "MH-01-CD-5678",
        kwh: 5.55,
        amount: 66.6,
        duration: 2700,
        date: "2025-12-29 11:15",
      },
    ]);
  }, []);

  const totalKwh = settlements.reduce((sum, s) => sum + s.kwh, 0);
  const totalRevenue = settlements.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Station Dashboard</h1>
        <button
          onClick={() => signOut({ redirectTo: "/login" })}
          style={{ padding: "10px 20px" }}
        >
          Logout
        </button>
      </div>

      <p>Welcome, {session?.user?.name}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <h3>Total Energy Delivered</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>
            {totalKwh.toFixed(2)} kWh
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <h3>Total Revenue</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "10px 0" }}>
            ₹{totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      <h2>Charging History</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5" }}>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              Vehicle Reg
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              Energy (kWh)
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              Amount (₹)
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              Duration (min)
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                textAlign: "left",
              }}
            >
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {settlements.map((settlement) => (
            <tr key={settlement.id}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {settlement.vehicleReg}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {settlement.kwh}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                ₹{settlement.amount.toFixed(2)}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {Math.floor(settlement.duration / 60)}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {settlement.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
