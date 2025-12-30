"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OperatorOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    stationName: "",
    stationAddress: "",
    chargerPower: 7.4,
    ratePerKwh: 12,
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "stationName" || name === "stationAddress"
          ? value
          : parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/operator/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/station-dashboard");
      } else {
        alert("Failed to create operator profile");
      }
    } catch (error) {
      console.error("Operator creation error:", error);
      alert("Error creating operator profile");
    }

    setIsLoading(false);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "100px auto", padding: "20px" }}>
      <h1>Setup Your Charging Station</h1>
      <p>
        Complete the details below to start operating your charging station.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Station Name: *</label>
          <input
            type="text"
            name="stationName"
            value={formData.stationName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Station Address:</label>
          <input
            type="text"
            name="stationAddress"
            value={formData.stationAddress}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Charger Power (kW):</label>
          <input
            type="number"
            name="chargerPower"
            value={formData.chargerPower}
            onChange={handleChange}
            step="0.1"
            min="0.1"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Rate per kWh (₹):</label>
          <input
            type="number"
            name="ratePerKwh"
            value={formData.ratePerKwh}
            onChange={handleChange}
            step="0.1"
            min="0.1"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {isLoading ? "Creating..." : "Create Station"}
        </button>
      </form>
    </div>
  );
}
