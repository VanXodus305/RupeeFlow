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
  const [operatorId, setOperatorId] = useState(null);
  const [ratePerKwh, setRatePerKwh] = useState(12);
  const [availableOperators, setAvailableOperators] = useState([]);

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

    fetchOperators();
  }, []);

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
        <ChargingSettlement
          {...chargingData}
          sessionId={sessionId}
          operatorId={savedOperatorId || operatorId}
          vehicleReg={vehicleReg}
          batteryCapacity={batteryCapacity}
          ratePerKwh={ratePerKwh}
          saveSession={saveSession}
        />
      )}

      {chargingData.error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          Error: {chargingData.error}
        </p>
      )}
    </div>
  );
}
