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
  const [chargingSettings, setChargingSettings] = useState(null);
  const [autoStopReason, setAutoStopReason] = useState(null);

  const [socketReady, setSocketReady] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

    socketRef.current = io(backendUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      console.log("[Hook] WebSocket connected:", socketRef.current.id);
      setSocketReady(true);
      setError(null);
    });

    socketRef.current.on("disconnect", () => {
      console.warn("[Hook] WebSocket disconnected");
      setSocketReady(false);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("[Hook] WebSocket error:", err.message);
      setSocketReady(false);
      setError("Failed to connect to backend");
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const startCharging = async (
    userId,
    vehicleReg,
    batteryCapacity,
    ratePerKwh,
    chargerPower,
    operatorId,
    ownerName,
    initialBatteryPercent = 0,
    settings = null,
    stationName = null
  ) => {
    try {
      setError(null);

      if (!socketReady || !socketRef.current) {
        setError("Connecting to backend, please wait...");
        return;
      }

      setSessionId(null);
      setOperatorId(operatorId);
      setIsCharging(true);
      setSecondsUsed(0);
      setTotalKwh(0);
      setTotalCost(0);
      setChargePercentage(0);
      setChargingSettings(settings);
      setAutoStopReason(null);

      socketRef.current.off("meter-reading");
      socketRef.current.off("charging-started");

      let currentSessionId = null;

      socketRef.current.once("charging-started", (data) => {
        console.log("[Hook] Charging started:", data.sessionId);
        currentSessionId = data.sessionId;
        setSessionId(data.sessionId);
      });

      socketRef.current.on("meter-reading", (meterData) => {
        setSecondsUsed(meterData.secondsElapsed);
        setTotalKwh(meterData.totalKwh);
        setTotalCost(meterData.totalCost);
        setCurrentPower(meterData.currentPower);
        setChargePercentage(meterData.chargePercentage);

        const totalBatteryPercent =
          initialBatteryPercent + meterData.chargePercentage;

        if (totalBatteryPercent >= 100) {
          setAutoStopReason("Maximum battery capacity (100%) reached");
          socketRef.current.emit("stop-charging", {
            sessionId: currentSessionId,
          });
          setIsCharging(false);
          return;
        }

        if (settings && settings.mode === "percentage") {
          if (totalBatteryPercent >= settings.targetBatteryPercent) {
            setAutoStopReason(
              `Target battery percentage (${settings.targetBatteryPercent}%) reached`
            );
            socketRef.current.emit("stop-charging", {
              sessionId: currentSessionId,
            });
            setIsCharging(false);
          }
        }

        if (settings && settings.mode === "time") {
          const elapsedMinutes = meterData.secondsElapsed / 60;
          if (elapsedMinutes >= settings.durationMinutes) {
            setAutoStopReason(
              `Charging duration (${settings.durationMinutes} min) completed`
            );
            socketRef.current.emit("stop-charging", {
              sessionId: currentSessionId,
            });
            setIsCharging(false);
          }
        }
      });

      socketRef.current.emit("start-charging", {
        userId,
        vehicleReg,
        batteryCapacity,
        ratePerKwh,
        chargerPower,
        operatorId,
        ownerName,
        stationName,
        initialBatteryPercent,
      });

      console.log("[Hook] start-charging emitted");
    } catch (err) {
      console.error("[Hook] Start charging error:", err);
      setError(err.message);
      setIsCharging(false);
    }
  };

  const stopCharging = async () => {
    try {
      setError(null);

      if (!sessionId) {
        setError("No active session");
        return;
      }

      socketRef.current.off("meter-reading");
      socketRef.current.off("charging-stopped");

      socketRef.current.once("charging-stopped", (data) => {
        console.log("[Hook] Charging stopped:", data);
      });

      socketRef.current.emit("stop-charging", { sessionId });

      setIsCharging(false);
    } catch (err) {
      console.error("[Hook] Stop charging error:", err);
      setError(err.message);
    }
  };

  const saveSession = async (
    operatorId,
    vehicleReg,
    batteryCapacity,
    ratePerKwh,
    stationId
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
          stationId,
          vehicleReg,
          batteryCapacity,
          totalKwh: Number(totalKwh),
          totalCost: Number(totalCost),
          duration: secondsUsed,
          chargePercentage: Number(chargePercentage),
          ratePerKwh: Number(ratePerKwh),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save session");
      }

      return await res.json();
    } catch (err) {
      console.error("[Hook] Save session error:", err);
      setError(err.message);
      throw err;
    }
  };

  const resumeCharging = () => {
    try {
      if (!sessionId) {
        setError("No active session to resume");
        return;
      }

      if (!socketReady) {
        setError("Backend not connected");
        return;
      }

      socketRef.current.off("meter-reading");
      socketRef.current.off("charging-resumed");

      socketRef.current.once("charging-resumed", () => {
        console.log("[Hook] Charging resumed");
      });

      socketRef.current.on("meter-reading", (meterData) => {
        setSecondsUsed(meterData.secondsElapsed);
        setTotalKwh(meterData.totalKwh);
        setTotalCost(meterData.totalCost);
        setCurrentPower(meterData.currentPower);
        setChargePercentage(meterData.chargePercentage);
      });

      socketRef.current.emit("resume-charging", { sessionId });
      setIsCharging(true);
      setError(null);
    } catch (err) {
      console.error("[Hook] Resume error:", err);
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
    socketReady,
    startCharging,
    stopCharging,
    saveSession,
    resumeCharging,
    autoStopReason,
    chargingSettings,
  };
}
