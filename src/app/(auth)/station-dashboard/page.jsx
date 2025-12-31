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
    // Wait for session to load
    if (status === "loading") {
      return;
    }

    // Not authenticated
    if (!session) {
      router.push("/login");
      setIsLoading(false);
      return;
    }

    // Owner should not be here
    if (session.user?.role === "owner") {
      router.push("/ev-owner-dashboard");
      setIsLoading(false);
      return;
    }

    // Fetch operator profile
    const fetchOperatorProfile = async () => {
      try {
        const response = await fetch("/api/operator/check");
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Operator check failed:", errorData);
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!data.exists) {
          // No operator profile, redirect to onboarding
          router.push("/operator-onboarding");
          return;
        }

        // Operator exists, display dashboard
        setOperatorData(data);

        // Fetch charging history
        const historyResponse = await fetch("/api/charging/history");
        const historyData = await historyResponse.json();

        if (historyResponse.ok) {
          setSettlements(historyData.sessions || []);
          setTotalKwh(historyData.totalKwh || 0);
          setTotalRevenue(historyData.totalRevenue || 0);
        }

        setIsLoading(false);

        // Setup WebSocket for live updates
        if (!socketRef.current) {
          socketRef.current = io(
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
            {
              reconnection: true,
              reconnectionDelay: 1000,
              reconnectionDelayMax: 5000,
              reconnectionAttempts: 5,
              transports: ["websocket", "polling"],
            }
          );

          socketRef.current.on("connect", () => {
            // Emit operator ID to register for events
            const operatorProfileId = data.id;
            socketRef.current.emit("register-operator", {
              operatorId: operatorProfileId,
            });
          });

          socketRef.current.on("meter-reading", (meterData) => {
            // If this is a new session, add it to ongoing sessions
            setOngoingSessions((prev) => {
              const sessionExists = prev.some(
                (s) => s.sessionId === meterData.sessionId
              );

              if (!sessionExists) {
                // New session, add it
                return [
                  {
                    sessionId: meterData.sessionId,
                    vehicleReg: meterData.vehicleReg,
                    totalKwh: meterData.totalKwh || 0,
                    totalCost: meterData.totalCost || 0,
                    duration: meterData.secondsElapsed || 0,
                    chargePercentage: meterData.chargePercentage || 0,
                    currentPower: meterData.currentPower || 0,
                  },
                  ...prev,
                ];
              }

              // Update existing session
              const updated = prev.map((session) => {
                if (session.sessionId === meterData.sessionId) {
                  return {
                    ...session,
                    totalKwh: meterData.totalKwh,
                    totalCost: meterData.totalCost,
                    duration: meterData.secondsElapsed,
                    chargePercentage: meterData.chargePercentage,
                    currentPower: meterData.currentPower,
                  };
                }
                return session;
              });
              return updated;
            });
          });

          socketRef.current.on("session-completed", (completedSession) => {
            console.log("Session completed:", completedSession);
            // Move completed session from ongoing to settlements
            setOngoingSessions((prev) =>
              prev.filter((s) => s.sessionId !== completedSession.sessionId)
            );
            setSettlements((prev) => [
              { ...completedSession, status: "completed" },
              ...prev,
            ]);
          });

          socketRef.current.on("disconnect", () => {
            console.log("WebSocket disconnected");
          });

          socketRef.current.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
          });
        }
      } catch (error) {
        console.error("Error fetching operator profile:", error);
        // On error, redirect to onboarding to be safe
        router.push("/operator-onboarding");
      }
    };

    fetchOperatorProfile();

    // Cleanup WebSocket on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!operatorData) {
    return null;
  }

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
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          marginBottom: "30px",
        }}
      >
        <h2>Station Details</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <p>
              <strong>Station Name:</strong> {operatorData.stationName}
            </p>
            <p>
              <strong>Address:</strong>{" "}
              {operatorData.stationAddress || "Not provided"}
            </p>
          </div>
          <div>
            <p>
              <strong>Charger Power:</strong> {operatorData.chargerPower} kW
            </p>
            <p>
              <strong>Rate per kWh:</strong> ₹{operatorData.ratePerKwh}
            </p>
          </div>
        </div>
      </div>

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
            {(totalKwh || 0).toFixed(2)} kWh
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
            ₹{(totalRevenue || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <h2>Ongoing Charging Sessions (Live Updates)</h2>
      {ongoingSessions.length === 0 ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "8px",
            color: "#666",
            marginBottom: "30px",
          }}
        >
          <p>No active charging sessions</p>
        </div>
      ) : (
        <div
          style={{
            marginBottom: "30px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "15px",
          }}
        >
          {ongoingSessions.map((session) => (
            <div
              key={session.sessionId}
              style={{
                border: "2px solid #4CAF50",
                padding: "15px",
                borderRadius: "8px",
                backgroundColor: "#f1f8f4",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0" }}>
                {session.ownerName || session.vehicleReg || "Unknown User"}
              </h4>
              <div style={{ fontSize: "13px" }}>
                <p style={{ margin: "5px 0" }}>
                  <strong>Duration:</strong>{" "}
                  {Math.floor((session.duration || 0) / 60)}m{" "}
                  {(session.duration || 0) % 60}s
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Energy:</strong> {(session.totalKwh || 0).toFixed(2)}{" "}
                  kWh
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Cost:</strong> ₹{(session.totalCost || 0).toFixed(2)}
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Power:</strong>{" "}
                  {(session.currentPower || 0).toFixed(1)} kW
                </p>
                <div
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    height: "20px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${session.chargePercentage || 0}%`,
                      height: "100%",
                      backgroundColor: "#4CAF50",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  {(session.chargePercentage || 0).toFixed(0)}% charged
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>Previous Charging Sessions</h2>
      {settlements.length === 0 ? (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "8px",
            color: "#666",
          }}
        >
          <p>No charging sessions yet</p>
        </div>
      ) : (
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
              <th
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  textAlign: "left",
                }}
              >
                Status
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
                  {(settlement.totalKwh || settlement.kwh || 0).toFixed(2)}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  ₹{(settlement.totalCost || settlement.amount || 0).toFixed(2)}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {Math.floor((settlement.duration || 0) / 60)}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {settlement.createdAt
                    ? new Date(settlement.createdAt).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "N/A"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      backgroundColor:
                        settlement.status === "completed"
                          ? "#d4edda"
                          : settlement.status === "settled"
                          ? "#cfe2ff"
                          : "#fff3cd",
                      color:
                        settlement.status === "completed"
                          ? "#155724"
                          : settlement.status === "settled"
                          ? "#084298"
                          : "#856404",
                    }}
                  >
                    {settlement.status || "pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
