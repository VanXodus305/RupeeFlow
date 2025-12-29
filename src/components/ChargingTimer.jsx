"use client";

export default function ChargingTimer({
  secondsUsed,
  totalKwh,
  totalCost,
  currentPower,
  chargePercentage,
}) {
  const minutes = Math.floor(secondsUsed / 60);
  const seconds = secondsUsed % 60;

  return (
    <div
      style={{
        border: "1px solid #4CAF50",
        padding: "20px",
        borderRadius: "8px",
        backgroundColor: "#f1f8f4",
      }}
    >
      <h2>Charging in Progress</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            Duration
          </p>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: "5px 0" }}>
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </p>
        </div>

        <div>
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            Energy Used
          </p>
          <p
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              margin: "5px 0",
              color: "#2196F3",
            }}
          >
            {totalKwh.toFixed(2)} kWh
          </p>
        </div>

        <div>
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Cost</p>
          <p
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              margin: "5px 0",
              color: "#4CAF50",
            }}
          >
            ₹{totalCost.toFixed(2)}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#666" }}>
          Battery Charge
        </p>
        <div
          style={{
            width: "100%",
            height: "30px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${chargePercentage}%`,
              height: "100%",
              backgroundColor: "#4CAF50",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {chargePercentage > 10 && `${chargePercentage.toFixed(0)}%`}
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Power</p>
          <p style={{ fontSize: "18px", fontWeight: "bold", margin: "5px 0" }}>
            {currentPower.toFixed(1)} kW
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Rate</p>
          <p style={{ fontSize: "18px", fontWeight: "bold", margin: "5px 0" }}>
            ₹12/kWh
          </p>
        </div>
      </div>
    </div>
  );
}
