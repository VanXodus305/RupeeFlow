"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCharging } from "@/hooks/useCharging";
import { useState } from "react";
import ChargingTimer from "@/components/ChargingTimer";
import ChargingSettlement from "@/components/ChargingSettlement";

export default function EVOwnerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    isCharging,
    startCharging,
    stopCharging,
    sessionId,
    operatorId: savedOperatorId,
    saveSession,
    ...chargingData
  } = useCharging();
  const [vehicleReg, setVehicleReg] = useState("MH-01-AB-1234");
  const [batteryCapacity, setBatteryCapacity] = useState(60);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [operatorId, setOperatorId] = useState(null);
  const [ratePerKwh, setRatePerKwh] = useState(12);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [chargingHistory, setChargingHistory] = useState([]);

  // Redirect operators to station dashboard
  useEffect(() => {
    if (session && session.user?.role === "operator") {
      router.push("/station-dashboard");
    }
  }, [session, router]);

  // Fetch available operators
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await fetch("/api/operator/list");
        if (res.ok) {
          const data = await res.json();
          setAvailableOperators(data);
          // Set first operator as default if available
          if (data.length > 0) {
            setOperatorId(data[0]._id);
            setRatePerKwh(data[0].ratePerKwh || 12);
          }
        }
      } catch (err) {
        console.error("Failed to fetch operators:", err);
      }
    };

    if (session) {
      fetchOperators();
    }
  }, [session]);

  // Fetch charging history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/charging/history");
        if (res.ok) {
          const data = await res.json();
          setChargingHistory(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to fetch charging history:", err);
      }
    };

    if (session) {
      fetchHistory();
    }
  }, [session]);

  const handleStartCharging = async () => {
    if (!operatorId) {
      alert("Please select a charging station");
      return;
    }
    await startCharging(
      session.user.id,
      vehicleReg,
      batteryCapacity,
      ratePerKwh,
      7.4,
      operatorId
    );
  };

  const handleStopCharging = async () => {
    await stopCharging();
    setShowSettlement(true);
  };

  const handleContinueCharging = async () => {
    // Reset settlement view and continue charging
    setShowSettlement(false);
    await startCharging(
      session.user.id,
      vehicleReg,
      batteryCapacity,
      ratePerKwh,
      7.4,
      operatorId
    );
  };

  const handleBackToDashboard = () => {
    setShowSettlement(false);
    setShowHistory(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>EV Owner Dashboard</h1>
        <button
          onClick={() => signOut({ redirectTo: "/login" })}
          style={{ padding: "10px 20px" }}
        >
          Logout
        </button>
      </div>

      <p>Welcome, {session?.user?.name}</p>

      {!isCharging && !showSettlement && (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>Start Charging</h2>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "500" }}>Charging Station:</label>
            {availableOperators.length === 0 ? (
              <p style={{ color: "#666", marginTop: "5px" }}>
                No charging stations available
              </p>
            ) : (
              <select
                value={operatorId || ""}
                onChange={(e) => {
                  setOperatorId(e.target.value);
                  const selected = availableOperators.find(
                    (op) => op._id === e.target.value
                  );
                  if (selected) {
                    setRatePerKwh(selected.ratePerKwh || 12);
                  }
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  marginTop: "5px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              >
                <option value="">Select a station</option>
                {availableOperators.map((op) => (
                  <option key={op._id} value={op._id}>
                    {op.stationName} ({op.stationAddress}) - ₹{op.ratePerKwh}
                    /kWh - {op.chargerPower}kW
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "500" }}>Vehicle Registration:</label>
            <input
              type="text"
              value={vehicleReg}
              onChange={(e) => setVehicleReg(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Battery Capacity (kWh):</label>
            <input
              type="number"
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(parseFloat(e.target.value))}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>

          <button
            onClick={handleStartCharging}
            style={{ width: "100%", padding: "10px", fontSize: "16px" }}
          >
            Start Charging ⚡
          </button>
        </div>
      )}

      {isCharging && !showSettlement && (
        <div>
          <ChargingTimer {...chargingData} />
          <button
            onClick={handleStopCharging}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "20px",
              fontSize: "16px",
              backgroundColor: "#ff6b6b",
            }}
          >
            Stop Charging
          </button>
        </div>
      )}

      {showSettlement && (
        <div>
          <ChargingSettlement
            {...chargingData}
            sessionId={sessionId}
            operatorId={savedOperatorId || operatorId}
            vehicleReg={vehicleReg}
            batteryCapacity={batteryCapacity}
            ratePerKwh={ratePerKwh}
            saveSession={saveSession}
          />
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleContinueCharging}
              style={{
                flex: 1,
                minWidth: "150px",
                padding: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Continue Charging ⚡
            </button>
            <button
              onClick={handleBackToDashboard}
              style={{
                flex: 1,
                minWidth: "150px",
                padding: "10px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {!isCharging && !showSettlement && (
        <div style={{ marginTop: "40px" }}>
          <h2>Charging History</h2>
          {chargingHistory.length === 0 ? (
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
                    Date & Time
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
                {chargingHistory.map((session) => (
                  <tr key={session.id}>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {session.vehicleReg}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {session.totalKwh}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      ₹{session.totalCost.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {Math.floor((session.duration || 0) / 60)}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {session.createdAt
                        ? new Date(session.createdAt).toLocaleString("en-IN", {
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
                            session.status === "completed"
                              ? "#d4edda"
                              : session.status === "settled"
                              ? "#cfe2ff"
                              : "#fff3cd",
                          color:
                            session.status === "completed"
                              ? "#155724"
                              : session.status === "settled"
                              ? "#084298"
                              : "#856404",
                        }}
                      >
                        {session.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {chargingData.error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          Error: {chargingData.error}
        </p>
      )}
    </div>
  );
}
