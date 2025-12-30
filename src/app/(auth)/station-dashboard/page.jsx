"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function StationDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [operatorData, setOperatorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settlements, setSettlements] = useState([]);
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
      } catch (error) {
        console.error("Error fetching operator profile:", error);
        // On error, redirect to onboarding to be safe
        router.push("/operator-onboarding");
      }
    };

    fetchOperatorProfile();
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
                  {settlement.totalKwh || settlement.kwh}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  ₹{(settlement.totalCost || settlement.amount).toFixed(2)}
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
