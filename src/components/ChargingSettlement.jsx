"use client";

import { useState } from "react";

export default function ChargingSettlement({
  totalCost,
  duration,
  secondsUsed,
  totalKwh,
  chargePercentage,
  sessionId,
}) {
  const [isSettling, setIsSettling] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const handleSettle = async () => {
    try {
      setIsSettling(true);
      setError(null);

      // Call settlement API to record on blockchain
      const response = await fetch("/api/charging/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          totalKwh: parseFloat(totalKwh),
          totalCost: parseFloat(totalCost),
          duration: durationInSeconds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to settle charging");
      }

      const data = await response.json();
      setTxHash(data.transactionHash || data.txHash);

      console.log("Settlement recorded:", {
        sessionId,
        totalKwh,
        totalCost,
        txHash: data.transactionHash,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSettling(false);
    }
  };

  // Use duration if provided, otherwise use secondsUsed
  const durationInSeconds =
    duration !== undefined ? duration : secondsUsed || 0;
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  return (
    <div
      style={{
        border: "2px solid #4CAF50",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#f1f8f4",
      }}
    >
      <h2>Charging Complete ✅</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            Total Cost
          </p>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              margin: "5px 0",
              color: "#4CAF50",
            }}
          >
            ₹{totalCost.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            Energy Used
          </p>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              margin: "5px 0",
              color: "#2196F3",
            }}
          >
            {totalKwh.toFixed(2)} kWh
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            Duration
          </p>
          <p style={{ fontSize: "20px", fontWeight: "bold", margin: "5px 0" }}>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            Battery
          </p>
          <p
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              margin: "5px 0",
              color: "#FF9800",
            }}
          >
            +{chargePercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {txHash ? (
        <div
          style={{
            backgroundColor: "#e8f5e9",
            border: "2px solid #4CAF50",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
            ✅ Settlement Confirmed on Blockchain!
          </p>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
            Transaction Hash:
          </p>
          <p
            style={{
              wordBreak: "break-all",
              fontFamily: "monospace",
              fontSize: "12px",
              marginBottom: "10px",
            }}
          >
            {txHash}
          </p>
          <a
            href={`https://amoy.polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            View on PolygonScan
          </a>
        </div>
      ) : (
        <>
          {error && (
            <p style={{ color: "red", marginBottom: "15px" }}>Error: {error}</p>
          )}

          <button
            onClick={handleSettle}
            disabled={isSettling}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: isSettling ? "#ccc" : "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isSettling ? "not-allowed" : "pointer",
            }}
          >
            {isSettling
              ? "Settling on Blockchain... ⛓️"
              : "Settle on Blockchain ⛓️"}
          </button>

          <p
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            This will record your charging on Polygon Amoy testnet
          </p>
        </>
      )}
    </div>
  );
}
