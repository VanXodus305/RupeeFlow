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

      if (!socketRef.current || !socketRef.current.connected) {
        throw new Error("WebSocket not connected");
      }

      // Reset state
      setSessionId(null);
      setOperatorId(operatorId);
      setIsCharging(true);
      setSecondsUsed(0);
      setTotalKwh(0);
      setTotalCost(0);
      setChargePercentage(0);

      // Remove any existing meter-reading listeners
      socketRef.current.off("meter-reading");
      socketRef.current.off("charging-started");

      // Listen for session started confirmation
      socketRef.current.once("charging-started", (data) => {
        console.log("[Hook] Charging started with sessionId:", data.sessionId);
        setSessionId(data.sessionId);
      });

      // Listen for meter readings from server
      socketRef.current.on("meter-reading", (meterData) => {
        console.log("[Hook] Meter reading received:", meterData);
        setSecondsUsed(meterData.secondsElapsed);
        setTotalKwh(meterData.totalKwh);
        setTotalCost(meterData.totalCost);
        setCurrentPower(meterData.currentPower);
        setChargePercentage(meterData.chargePercentage);
      });

      // Emit start-charging via WebSocket
      socketRef.current.emit("start-charging", {
        userId,
        vehicleReg,
        batteryCapacity,
        ratePerKwh,
        chargerPower,
        operatorId,
      });

      console.log("[Hook] Start charging event emitted");
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
      socketRef.current.off("charging-stopped");

      let stopData = null;

      // Listen for charging-stopped response
      socketRef.current.once("charging-stopped", (data) => {
        console.log("[Hook] Stop charging response:", data);
        stopData = data;
      });

      // Emit stop via WebSocket
      socketRef.current.emit("stop-charging", { sessionId });

      // Wait a bit for response
      await new Promise((resolve) => setTimeout(resolve, 100));

      setIsCharging(false);
      console.log("[Hook] Charging stopped:", sessionId);
      return stopData;
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

  const resumeCharging = () => {
    try {
      if (!sessionId) {
        throw new Error("No active session to resume");
      }

      console.log("[Hook] Resuming charging session:", sessionId);

      // Remove any existing listeners
      socketRef.current.off("meter-reading");
      socketRef.current.off("charging-resumed");

      // Listen for resume confirmation
      socketRef.current.once("charging-resumed", (data) => {
        console.log("[Hook] Charging resumed with sessionId:", data.sessionId);
      });

      // Re-attach meter-reading listener
      socketRef.current.on("meter-reading", (meterData) => {
        console.log("[Hook] Meter reading received (resumed):", meterData);
        setSecondsUsed(meterData.secondsElapsed);
        setTotalKwh(meterData.totalKwh);
        setTotalCost(meterData.totalCost);
        setCurrentPower(meterData.currentPower);
        setChargePercentage(meterData.chargePercentage);
      });

      // Emit resume-charging via WebSocket to restart meter interval on server
      socketRef.current.emit("resume-charging", { sessionId });

      // Re-enable charging UI
      setIsCharging(true);
      setError(null);

      console.log("[Hook] Resume charging event emitted");
    } catch (err) {
      console.error("[Hook] Error resuming:", err);
      setError(err.message);
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
    resumeCharging,
  };
}
