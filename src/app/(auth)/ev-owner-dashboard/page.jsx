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
    ...chargingData
  } = useCharging();
  const [vehicleReg, setVehicleReg] = useState("MH-01-AB-1234");
  const [batteryCapacity, setBatteryCapacity] = useState(60);
  const [showSettlement, setShowSettlement] = useState(false);

  // Redirect operators to station dashboard
  useEffect(() => {
    if (session && session.user?.role === "operator") {
      router.push("/station-dashboard");
    }
  }, [session, router]);

  const handleStartCharging = async () => {
    await startCharging(session.user.id, vehicleReg, batteryCapacity, 12, 7.4);
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
            <label>Vehicle Registration:</label>
            <input
              type="text"
              value={vehicleReg}
              onChange={(e) => setVehicleReg(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
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
        <ChargingSettlement {...chargingData} sessionId={sessionId} />
      )}

      {chargingData.error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          Error: {chargingData.error}
        </p>
      )}
    </div>
  );
}
