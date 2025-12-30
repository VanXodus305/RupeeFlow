"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useCharging() {
  const [sessionId, setSessionId] = useState(null);
  const [operatorId, setOperatorId] = useState(null);
  const [isCharging, setIsCharging] = useState(false);
  const [secondsUsed, setSecondsUsed] = useState(0);
  const [totalKwh, setTotalKwh] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [currentPower, setCurrentPower] = useState(0);
  const [chargePercentage, setChargePercentage] = useState(0);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  // Initialize WebSocket
  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    socketRef.current = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("[Hook] WebSocket connected:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("[Hook] WebSocket error:", err);
      setError("Failed to connect to backend");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const startCharging = async (
    userId,
    vehicleReg,
    batteryCapacity,
    ratePerKwh,
    chargerPower,
    operatorId
  ) => {
    try {
      setError(null);

      const res = await fetch("/api/charging/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          vehicleReg,
          batteryCapacity,
          ratePerKwh,
          chargerPower,
          operatorId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to start charging");
      }

      const data = await res.json();
      const sid = data.sessionId;

      setSessionId(sid);
      setOperatorId(operatorId);
      setIsCharging(true);
      setSecondsUsed(0);
      setTotalKwh(0);
      setTotalCost(0);
      setChargePercentage(0);

      // Remove any existing meter-reading listeners
      socketRef.current.off("meter-reading");
    } catch (err) {
      console.error("[Hook] Error:", err);
      setError(err.message);
      setIsCharging(false);
    }
  };

  const stopCharging = async () => {
    try {
      setError(null);

      if (!sessionId) {
        throw new Error("No active session");
      }

      // Stop listening for meter readings
      socketRef.current.off("meter-reading");

      // Emit stop via WebSocket
      socketRef.current.emit("stop-charging", { sessionId });

      const res = await fetch("/api/charging/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!res.ok) {
        throw new Error("Failed to stop charging");
      }

      const data = await res.json();
      setIsCharging(false);

      console.log("[Hook] Charging stopped:", sessionId);
      return data;
    } catch (err) {
      console.error("[Hook] Error:", err);
      setError(err.message);
      throw err;
    }
  };

  const saveSession = async (
    operatorId,
    vehicleReg,
    batteryCapacity,
    ratePerKwh
  ) => {
    try {
      if (!sessionId) {
        throw new Error("No active session");
      }

      const res = await fetch("/api/charging/save-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          operatorId,
          vehicleReg,
          batteryCapacity,
          totalKwh: parseFloat(totalKwh),
          totalCost: parseFloat(totalCost),
          duration: secondsUsed,
          chargePercentage: parseFloat(chargePercentage),
          ratePerKwh: parseFloat(ratePerKwh),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save session");
      }

      const data = await res.json();
      console.log("[Hook] Session saved to database:", data);
      return data;
    } catch (err) {
      console.error("[Hook] Error saving session:", err);
      setError(err.message);
      throw err;
    }
  };

  return {
    sessionId,
    operatorId,
    isCharging,
    secondsUsed,
    totalKwh,
    totalCost,
    currentPower,
    chargePercentage,
    error,
    startCharging,
    stopCharging,
    saveSession,
  };
}
