"use client";

import React, { memo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Progress,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import {
  FiLogOut,
  FiZap,
  FiTrendingUp,
  FiBattery,
  FiClock,
  FiActivity,
  FiCheck,
} from "react-icons/fi";

const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center py-16 mt-20">
    <Spinner label="Loading dashboard..." color="primary" />
  </div>
));

export default function StationDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const socketRef = useRef(null);

  const [operatorData, setOperatorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settlements, setSettlements] = useState([]);
  const [ongoingSessions, setOngoingSessions] = useState([]);
  const [totalKwh, setTotalKwh] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      router.push("/login");
      setIsLoading(false);
      return;
    }

    if (session.user?.role === "owner") {
      router.push("/ev-owner-dashboard");
      setIsLoading(false);
      return;
    }

    const fetchOperatorProfile = async () => {
      try {
        const response = await fetch("/api/operator/check");
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Operator check failed:", errorData);
          router.push("/login");
          return;
        }

        const data = await response.json();

        if (!data.exists) {
          router.push("/operator-onboarding");
          return;
        }

        setOperatorData(data);

        const historyResponse = await fetch("/api/charging/history");
        const historyData = await historyResponse.json();

        if (historyResponse.ok) {
          setSettlements(historyData.sessions || []);
          setTotalKwh(historyData.totalKwh || 0);
          setTotalRevenue(historyData.totalRevenue || 0);
        }

        setIsLoading(false);

        if (!socketRef.current) {
          socketRef.current = io(
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
            {
              reconnection: true,
              reconnectionDelay: 1000,
              reconnectionDelayMax: 5000,
              reconnectionAttempts: 5,
              transports: ["websocket", "polling"],
            }
          );

          socketRef.current.on("connect", () => {
            const operatorProfileId = data.id;
            socketRef.current.emit("register-operator", {
              operatorId: operatorProfileId,
            });
          });

          socketRef.current.on("meter-reading", (meterData) => {
            setOngoingSessions((prev) => {
              const sessionExists = prev.some(
                (s) => s.sessionId === meterData.sessionId
              );

              if (!sessionExists) {
                return [
                  {
                    sessionId: meterData.sessionId,
                    vehicleReg: meterData.vehicleReg,
                    stationName: meterData.stationName,
                    totalKwh: meterData.totalKwh || 0,
                    totalCost: meterData.totalCost || 0,
                    duration: meterData.secondsElapsed || 0,
                    chargePercentage: meterData.chargePercentage || 0,
                    initialBatteryPercent: meterData.initialBatteryPercent || 0,
                    currentPower: meterData.currentPower || 0,
                  },
                  ...prev,
                ];
              }

              const updated = prev.map((session) => {
                if (session.sessionId === meterData.sessionId) {
                  return {
                    ...session,
                    totalKwh: meterData.totalKwh,
                    totalCost: meterData.totalCost,
                    duration: meterData.secondsElapsed,
                    chargePercentage: meterData.chargePercentage,
                    initialBatteryPercent: meterData.initialBatteryPercent,
                    currentPower: meterData.currentPower,
                  };
                }
                return session;
              });
              return updated;
            });
          });

          socketRef.current.on("session-completed", (completedSession) => {
            console.log("Session completed:", completedSession);
            setOngoingSessions((prev) =>
              prev.filter((s) => s.sessionId !== completedSession.sessionId)
            );
            setSettlements((prev) => [
              { ...completedSession, status: "completed" },
              ...prev,
            ]);
          });

          socketRef.current.on("disconnect", () => {
            console.log("WebSocket disconnected");
          });

          socketRef.current.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
          });
        }
      } catch (error) {
        console.error("Error fetching operator profile:", error);
        router.push("/operator-onboarding");
      }
    };

    fetchOperatorProfile();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [session, status, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!operatorData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-200 to-background-100/20">
      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 py-8 max-w-7xl mx-auto mt-16">
        {/* Stations Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiZap className="text-primary text-lg" />
            <h2 className="text-2xl font-bold text-primary font-conthrax">
              Your Charging Stations
            </h2>
            {operatorData?.stations?.length > 0 && (
              <Chip
                className="bg-primary/20 text-primary font-semibold"
                size="sm"
              >
                {operatorData.stations.length} Total
              </Chip>
            )}
          </div>

          {!operatorData?.stations || operatorData.stations.length === 0 ? (
            <Card className="bg-background-100/30 border border-primary/20">
              <CardBody className="py-16 text-center">
                <p className="text-foreground/60">No charging stations found</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {operatorData.stations.map((station) => (
                <Card
                  key={station._id}
                  className="bg-gradient-to-br from-background-100/50 to-background-200/30 border border-primary/20"
                >
                  <CardHeader className="flex gap-2 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <h3 className="text-lg font-bold text-primary font-conthrax">
                        {station.stationName}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-foreground/60">Address</p>
                      <p className="text-foreground">
                        {station.stationAddress || "Not provided"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">
                          Charger Power
                        </p>
                        <p className="text-lg font-semibold text-secondary font-conthrax">
                          {station.chargerPower} kW
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">
                          Rate per kWh
                        </p>
                        <p className="text-lg font-semibold text-secondary font-conthrax">
                          ₹{station.ratePerKwh}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Energy Delivered */}
          <Card className="bg-gradient-to-br from-primary/15 to-secondary/10 border border-primary/30">
            <CardBody className="gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
                    Total Energy Delivered
                  </p>
                  <p className="text-4xl font-bold text-primary font-conthrax">
                    {(totalKwh || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-foreground/70 mt-1">kWh</p>
                </div>
                <FiZap className="text-primary/30 text-5xl" />
              </div>
            </CardBody>
          </Card>

          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-secondary/15 to-primary/10 border border-secondary/30">
            <CardBody className="gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60 uppercase tracking-wide mb-2">
                    Total Revenue
                  </p>
                  <p className="text-4xl font-bold text-secondary font-conthrax">
                    ₹{(totalRevenue || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-foreground/70 mt-1">INR</p>
                </div>
                <FiTrendingUp className="text-secondary/30 text-5xl" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Ongoing Sessions Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-primary text-lg" />
            <h2 className="text-2xl font-bold text-primary font-conthrax">
              Live Charging Sessions
            </h2>
            {ongoingSessions.length > 0 && (
              <Chip
                className="bg-primary/20 text-primary font-semibold"
                size="sm"
              >
                {ongoingSessions.length} Active
              </Chip>
            )}
          </div>

          {ongoingSessions.length === 0 ? (
            <Card className="bg-background-100/30 border border-primary/20">
              <CardBody className="py-16 text-center">
                <p className="text-foreground/60">
                  No active charging sessions
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ongoingSessions.map((session) => (
                <Card
                  key={session.sessionId}
                  className="bg-background-100/30 border-2 border-primary/40 hover:border-primary/60 transition-colors"
                >
                  <CardBody className="gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-foreground/60 uppercase tracking-wide">
                          Vehicle
                        </p>
                        <p className="text-lg font-bold text-primary font-conthrax">
                          {session.vehicleReg || "Unknown"}
                        </p>
                      </div>
                      <Chip
                        className="bg-primary/20 text-primary text-xs"
                        size="sm"
                      >
                        LIVE
                      </Chip>
                    </div>

                    {/* Station Name */}
                    {session.stationName && (
                      <div className="bg-secondary/10 rounded-lg p-3 border border-secondary/20">
                        <p className="text-xs text-foreground/60 mb-1">
                          Station
                        </p>
                        <p className="text-sm font-semibold text-secondary font-conthrax">
                          {session.stationName}
                        </p>
                      </div>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background-100/50 rounded-lg p-3">
                        <p className="text-xs text-foreground/60 mb-1">
                          Duration
                        </p>
                        <p className="text-sm font-semibold text-secondary font-conthrax">
                          {Math.floor((session.duration || 0) / 60)}m{" "}
                          {(session.duration || 0) % 60}s
                        </p>
                      </div>
                      <div className="bg-background-100/50 rounded-lg p-3">
                        <p className="text-xs text-foreground/60 mb-1">
                          Energy
                        </p>
                        <p className="text-sm font-semibold text-secondary font-conthrax">
                          {(session.totalKwh || 0).toFixed(2)} kWh
                        </p>
                      </div>
                      <div className="bg-background-100/50 rounded-lg p-3">
                        <p className="text-xs text-foreground/60 mb-1">Cost</p>
                        <p className="text-sm font-semibold text-primary font-conthrax">
                          ₹{(session.totalCost || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-background-100/50 rounded-lg p-3">
                        <p className="text-xs text-foreground/60 mb-1">Power</p>
                        <p className="text-sm font-semibold text-secondary font-conthrax">
                          {(session.currentPower || 0).toFixed(1)} kW
                        </p>
                      </div>
                    </div>

                    {/* Charge Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-foreground/60">Battery</p>
                        <p className="text-xs font-semibold text-primary font-conthrax">
                          {Math.min(
                            100,
                            (session.initialBatteryPercent || 0) +
                              (session.chargePercentage || 0)
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (session.initialBatteryPercent || 0) +
                            (session.chargePercentage || 0)
                        )}
                        className="h-2"
                        color="primary"
                      />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Previous Sessions Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiCheck className="text-primary text-lg" />
            <h2 className="text-2xl font-bold text-primary font-conthrax">
              Settlement History
            </h2>
            {settlements.length > 0 && (
              <Chip
                className="bg-secondary/20 text-secondary font-semibold"
                size="sm"
              >
                {settlements.length} Sessions
              </Chip>
            )}
          </div>

          {settlements.length === 0 ? (
            <Card className="bg-background-100/30 border border-primary/20">
              <CardBody className="py-16 text-center">
                <p className="text-foreground/60">No charging sessions yet</p>
              </CardBody>
            </Card>
          ) : (
            <Card className="bg-background-100/30 border border-primary/20">
              <CardBody className="gap-0 p-0">
                <div className="overflow-x-auto">
                  <Table
                    removeWrapper
                    aria-label="Charging history table"
                    classNames={{
                      table: "text-sm",
                      th: "bg-primary/10 text-primary font-semibold border-b border-primary/20 px-4 py-3 text-base",
                      td: "border-b border-primary/10 px-4 py-3",
                      tr: "hover:bg-primary/5 transition-colors",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>Vehicle Reg</TableColumn>
                      <TableColumn>Station</TableColumn>
                      <TableColumn>Energy (kWh)</TableColumn>
                      <TableColumn>Amount (₹)</TableColumn>
                      <TableColumn>Duration (min)</TableColumn>
                      <TableColumn>Date</TableColumn>
                      <TableColumn>Status</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {settlements.map((settlement) => (
                        <TableRow
                          key={settlement.id}
                          className="text-foreground"
                        >
                          <TableCell>
                            <p className="font-semibold text-primary">
                              {settlement.vehicleReg}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-secondary">
                              {settlement.stationName}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold font-conthrax text-secondary">
                              {(
                                settlement.totalKwh ||
                                settlement.kwh ||
                                0
                              ).toFixed(2)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold font-conthrax text-secondary">
                              ₹
                              {(
                                settlement.totalCost ||
                                settlement.amount ||
                                0
                              ).toFixed(2)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold font-conthrax">
                              {Math.floor((settlement.duration || 0) / 60)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-foreground/70">
                              {settlement.createdAt
                                ? new Date(settlement.createdAt).toLocaleString(
                                    "en-IN",
                                    {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "N/A"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              className={
                                settlement.status === "completed"
                                  ? "bg-primary/20 text-primary"
                                  : settlement.status === "settled"
                                  ? "bg-secondary/20 text-secondary"
                                  : "bg-foreground/10 text-foreground"
                              }
                            >
                              <span className="capitalize font-semibold">
                                {settlement.status || "pending"}
                              </span>
                            </Chip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
