"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function OperatorOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    stationName: "",
    stationAddress: "",
    chargerPower: 7.4,
    ratePerKwh: 12,
  });

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") {
      return;
    }

    // Not authenticated
    if (!session) {
      router.push("/login");
      return;
    }

    // Only operators can access onboarding
    if (session.user?.role !== "operator") {
      router.push("/login");
      return;
    }

    // Check if operator profile already exists
    const checkOperatorExists = async () => {
      try {
        const response = await fetch("/api/operator/check");
        const data = await response.json();

        // If operator profile exists, redirect to dashboard
        if (data.exists) {
          router.push("/station-dashboard");
        }
      } catch (error) {
        console.error("Error checking operator profile:", error);
        // Continue showing onboarding if check fails
      }
    };

    checkOperatorExists();
  }, [session, status, router]);

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
    setError("");

    try {
      const response = await fetch("/api/operator/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create operator profile");
      }

      const data = await response.json();

      // Redirect to station dashboard
      router.push("/station-dashboard");
    } catch (err) {
      console.error("Error creating operator profile:", err);
      setError(err.message || "Failed to create operator profile");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!session || session.user?.role !== "operator") {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        paddingTop: "40px",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            padding: "40px",
          }}
        >
          <h1 style={{ marginBottom: "10px" }}>Setup Your Charging Station</h1>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Complete the details below to start operating your charging station.
          </p>

          {error && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Station Name *
              </label>
              <input
                type="text"
                name="stationName"
                value={formData.stationName}
                onChange={handleChange}
                required
                placeholder="Enter your charging station name"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Station Address
              </label>
              <input
                type="text"
                name="stationAddress"
                value={formData.stationAddress}
                onChange={handleChange}
                placeholder="Enter your station address"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Charger Power (kW)
              </label>
              <input
                type="number"
                name="chargerPower"
                value={formData.chargerPower}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Rate per kWh (₹)
              </label>
              <input
                type="number"
                name="ratePerKwh"
                value={formData.ratePerKwh}
                onChange={handleChange}
                step="0.1"
                min="0.1"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: isLoading ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Creating Station..." : "Create Station"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
