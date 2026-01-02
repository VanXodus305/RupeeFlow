"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

export default function StationDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const socketRef = useRef(null);

  const [operatorData, setOperatorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settlements, setSettlements] = useState([]);
  const [ongoingSessions, setOngoingSessions] = useState([]);
  const [totalKwh, setTotalKwh] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user?.role === "owner") {
      router.push("/ev-owner-dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/operator/check");
        const data = await res.json();

        if (!data.exists) {
          router.push("/operator-onboarding");
          return;
        }

        setOperatorData(data);

        const historyRes = await fetch("/api/charging/history");
        const history = await historyRes.json();

        setSettlements(history.sessions || []);
        setTotalKwh(history.totalKwh || 0);
        setTotalRevenue(history.totalRevenue || 0);

        setIsLoading(false);

        if (!socketRef.current) {
          socketRef.current = io(
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
          );

          socketRef.current.on("connect", () => {
            socketRef.current.emit("register-operator", {
              operatorId: data.id,
            });
          });

          socketRef.current.on("meter-reading", (m) => {
            setOngoingSessions((prev) => {
              const exists = prev.some((s) => s.sessionId === m.sessionId);
              if (!exists) {
                return [
                  {
                    sessionId: m.sessionId,
                    vehicleReg: m.vehicleReg,
                    totalKwh: m.totalKwh || 0,
                    totalCost: m.totalCost || 0,
                    duration: m.secondsElapsed || 0,
                    chargePercentage: m.chargePercentage || 0,
                    currentPower: m.currentPower || 0,
                  },
                  ...prev,
                ];
              }
              return prev.map((s) =>
                s.sessionId === m.sessionId
                  ? { ...s, ...m }
                  : s
              );
            });
          });

          socketRef.current.on("session-completed", (c) => {
            setOngoingSessions((prev) =>
              prev.filter((s) => s.sessionId !== c.sessionId)
            );
            setSettlements((prev) => [{ ...c, status: "completed" }, ...prev]);
          });
        }
      } catch {
        router.push("/operator-onboarding");
      }
    };

    fetchData();
    return () => socketRef.current?.disconnect();
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af" }}>
        Loading dashboard…
      </div>
    );
  }

  if (!operatorData) return null;

  const glassBox = {
    border: "1px solid #1f2937",
    borderRadius: "14px",
    padding: "20px",
    background:
      "linear-gradient(145deg, rgba(15,23,42,0.6), rgba(15,23,42,0.3))",
    backdropFilter: "blur(10px)",
  };

  return (
    <div
      style={{
        padding: "24px",
        paddingTop: "80px",
        maxWidth: "1100px",
        margin: "0 auto",
        color: "#e5e7eb",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "700" }}>
            Welcome, Station Operator
          </h1>
          <p style={{ color: "#9ca3af", marginTop: "4px" }}>
            Monitor sessions and revenue in real time
          </p>
        </div>

        <button
          onClick={() => signOut({ redirectTo: "/login" })}
          style={{
            padding: "10px 18px",
            background: "#0f766e",
            color: "#ecfeff",
            borderRadius: "10px",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>

      {/* Station Details */}
      <div style={{ ...glassBox, marginBottom: "28px" }}>
        <h2 style={{ marginBottom: "14px" }}>Station Details</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <p><strong>Name:</strong> {operatorData.stationName}</p>
            <p><strong>Address:</strong> {operatorData.stationAddress || "N/A"}</p>
          </div>
          <div>
            <p><strong>Power:</strong> {operatorData.chargerPower} kW</p>
            <p><strong>Rate:</strong> ₹{operatorData.ratePerKwh} / kWh</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        <div style={glassBox}>
          <h3 style={{ color: "#9ca3af" }}>Total Energy Delivered</h3>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#5eead4" }}>
            {totalKwh.toFixed(2)} kWh
          </p>
        </div>

        <div style={glassBox}>
          <h3 style={{ color: "#9ca3af" }}>Total Revenue</h3>
          <p style={{ fontSize: "28px", fontWeight: "700", color: "#60a5fa" }}>
            ₹{totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Previous Sessions */}
      <h2 style={{ marginBottom: "12px" }}>Previous Charging Sessions</h2>
      <div style={{ ...glassBox, padding: "0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1f2937" }}>
              {["Vehicle", "Energy", "Amount", "Duration", "Date", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px",
                      textAlign: "left",
                      color: "#9ca3af",
                      fontSize: "13px",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr
                key={s.id}
                style={{
                  borderBottom: "1px solid #1f2937",
                }}
              >
                <td style={{ padding: "14px" }}>{s.vehicleReg}</td>
                <td style={{ padding: "14px" }}>
                  {(s.totalKwh || 0).toFixed(2)}
                </td>
                <td style={{ padding: "14px" }}>
                  ₹{(s.totalCost || 0).toFixed(2)}
                </td>
                <td style={{ padding: "14px" }}>
                  {Math.floor((s.duration || 0) / 60)} min
                </td>
                <td style={{ padding: "14px" }}>
                  {new Date(s.createdAt).toLocaleString("en-IN")}
                </td>
                <td style={{ padding: "14px" }}>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background:
                        s.status === "completed"
                          ? "#064e3b"
                          : "#1e3a8a",
                      color: "#d1fae5",
                    }}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
