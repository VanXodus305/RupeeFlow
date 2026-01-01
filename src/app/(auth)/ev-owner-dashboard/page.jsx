"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCharging } from "@/hooks/useCharging";
import { useState } from "react";
import ChargingTimer from "@/components/ChargingTimer";
import ChargingSettlement from "@/components/ChargingSettlement";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { FiLogOut } from "react-icons/fi";

export default function EVOwnerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    isCharging,
    startCharging,
    stopCharging,
    resumeCharging,
    sessionId,
    operatorId: savedOperatorId,
    saveSession,
    ...chargingData
  } = useCharging();
  const [vehicleReg, setVehicleReg] = useState("MH-01-AB-1234");
  const [batteryCapacity, setBatteryCapacity] = useState(60);
  const [initialBatteryPercent, setInitialBatteryPercent] = useState(20);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionSettled, setSessionSettled] = useState(false);
  const [operatorId, setOperatorId] = useState(null);
  const [ratePerKwh, setRatePerKwh] = useState(12);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [chargingHistory, setChargingHistory] = useState([]);
  const [pendingSession, setPendingSession] = useState(null);
  const [loadingPending, setLoadingPending] = useState(true);
  const [isSettling, setIsSettling] = useState(false);

  // Redirect operators to station dashboard
  useEffect(() => {
    if (session && session.user?.role === "operator") {
      router.push("/station-dashboard");
    }
  }, [session, router]);

  // Fetch available operators
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const res = await fetch("/api/operator/list");
        if (res.ok) {
          const data = await res.json();
          setAvailableOperators(data);
          // Set first operator as default if available
          if (data.length > 0) {
            setOperatorId(data[0]._id);
            setRatePerKwh(data[0].ratePerKwh || 12);
          }
        }
      } catch (err) {
        console.error("Failed to fetch operators:", err);
      }
    };

    if (session) {
      fetchOperators();
    }
  }, [session]);

  // Fetch charging history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/charging/history");
        if (res.ok) {
          const data = await res.json();
          setChargingHistory(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to fetch charging history:", err);
      }
    };

    if (session) {
      fetchHistory();
    }
  }, [session]);

  // Check for pending settlements on load
  useEffect(() => {
    const checkPendingSettlement = async () => {
      try {
        setLoadingPending(true);
        const res = await fetch("/api/charging/pending-settlement");
        if (res.ok) {
          const data = await res.json();
          if (data.hasPending && data.sessions.length > 0) {
            // Get the most recent pending session
            setPendingSession(data.sessions[0]);
            setShowSettlement(true);
          }
        }
      } catch (err) {
        console.error("Failed to check pending settlement:", err);
      } finally {
        setLoadingPending(false);
      }
    };

    if (session) {
      checkPendingSettlement();
    }
  }, [session]);

  const handleStartCharging = async () => {
    if (!operatorId) {
      alert("Please select a charging station");
      return;
    }
    await startCharging(
      session.user.id,
      vehicleReg,
      batteryCapacity,
      ratePerKwh,
      7.4,
      operatorId,
      session.user.name
    );
  };

  const handleSettlementComplete = async () => {
    // Refresh pending settlements
    try {
      const res = await fetch("/api/charging/pending-settlement");
      if (res.ok) {
        const data = await res.json();
        if (!data.hasPending) {
          setPendingSession(null);
          // Don't hide settlement screen - keep it visible so user can see the success and click "Back to Dashboard"
        }
      }
    } catch (err) {
      console.error("Failed to refresh pending settlements:", err);
    }
    setSessionSettled(true);
  };

  const handleStopCharging = async () => {
    await stopCharging();
    setShowSettlement(true);
    setSessionSettled(false);
  };

  const handleContinueCharging = async () => {
    // Resume charging on the same charging session
    resumeCharging();
    setShowSettlement(false);
    setSessionSettled(false);
  };

  const handleBackToDashboard = () => {
    setShowSettlement(false);
    setShowHistory(false);
    setSessionSettled(false);
    // Reset charging state for next session
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-200 via-background-100/20 to-background-200 mt-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!isCharging && !showSettlement && (
          <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-3 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h2 className="text-2xl font-bold text-foreground font-conthrax">
                  Start Charging Session
                </h2>
              </div>
            </CardHeader>
            <CardBody className="gap-6 py-6">
              <Select
                label="Charging Station"
                placeholder="Select a station"
                selectedKeys={operatorId ? new Set([operatorId]) : new Set()}
                onSelectionChange={(keys) => {
                  const selectedId = Array.from(keys)[0];
                  if (selectedId) {
                    setOperatorId(selectedId);
                    const selected = availableOperators.find(
                      (op) => op._id === selectedId
                    );
                    if (selected) {
                      setRatePerKwh(selected.ratePerKwh || 12);
                    }
                  }
                }}
                className="w-full"
                classNames={{
                  trigger:
                    "bg-background-200/50 border border-primary/20 hover:bg-background-100/50 text-foreground",
                  popoverContent: "bg-background-100 border border-primary/20",
                  value: "text-foreground font-semibold",
                  innerWrapper: "text-foreground",
                }}
              >
                {availableOperators.map((op) => (
                  <SelectItem
                    key={op._id}
                    value={op._id}
                    textValue={op.stationName}
                  >
                    {op.stationName} - ₹{op.ratePerKwh}/kWh ({op.chargerPower}
                    kW)
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Vehicle Registration"
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                className="w-full"
                classNames={{
                  input:
                    "bg-background-200/50 text-foreground placeholder-foreground/50",
                  inputWrapper:
                    "bg-background-200/50 border border-primary/20 hover:bg-background-100/50",
                }}
              />

              <Input
                type="number"
                label="Battery Capacity (kWh)"
                value={batteryCapacity.toString()}
                onChange={(e) => setBatteryCapacity(parseFloat(e.target.value))}
                className="w-full"
                classNames={{
                  input:
                    "bg-background-200/50 text-foreground placeholder-foreground/50",
                  inputWrapper:
                    "bg-background-200/50 border border-primary/20 hover:bg-background-100/50",
                }}
              />

              <div className="space-y-2">
                <Input
                  type="number"
                  label="Current Battery Percentage (%)"
                  min="0"
                  max="100"
                  value={initialBatteryPercent.toString()}
                  onChange={(e) =>
                    setInitialBatteryPercent(
                      Math.min(100, Math.max(0, parseFloat(e.target.value)))
                    )
                  }
                  className="w-full"
                  classNames={{
                    input:
                      "bg-background-200/50 text-foreground placeholder-foreground/50",
                    inputWrapper:
                      "bg-background-200/50 border border-primary/20 hover:bg-background-100/50",
                  }}
                />
                <p className="text-xs text-foreground/60">
                  Progress will be shown from {initialBatteryPercent.toFixed(1)}
                  % to 100%
                </p>
              </div>

              <Button
                onClick={handleStartCharging}
                disabled={pendingSession !== null}
                className="w-full bg-gradient-to-r from-primary to-secondary text-background-200 font-semibold py-6 text-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                {pendingSession
                  ? "⚠️ Complete pending settlement first"
                  : "Start Charging ⚡"}
              </Button>

              {pendingSession && (
                <Card className="bg-red-500/10 border border-red-500/30">
                  <CardBody className="py-3">
                    <p className="text-sm text-red-400">
                      You have a pending charging session that needs to be
                      settled before starting a new one.
                    </p>
                  </CardBody>
                </Card>
              )}
            </CardBody>
          </Card>
        )}

        {isCharging && !showSettlement && (
          <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-sm">
            <CardBody className="gap-6">
              <ChargingTimer
                {...chargingData}
                initialBatteryPercent={initialBatteryPercent}
              />
              <Button
                onClick={handleStopCharging}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-6 text-lg hover:shadow-lg hover:shadow-red-500/50 transition-all font-conthrax"
              >
                Stop Charging
              </Button>
            </CardBody>
          </Card>
        )}

        {showSettlement && (
          <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-sm">
            <CardBody className="gap-6">
              <ChargingSettlement
                {...chargingData}
                sessionId={pendingSession?.sessionId || sessionId}
                operatorId={
                  pendingSession?.operatorId || savedOperatorId || operatorId
                }
                vehicleReg={pendingSession?.vehicleReg || vehicleReg}
                batteryCapacity={
                  pendingSession?.batteryCapacity || batteryCapacity
                }
                ratePerKwh={pendingSession?.ratePerKwh || ratePerKwh}
                totalCost={pendingSession?.totalCost || chargingData.totalCost}
                totalKwh={pendingSession?.totalKwh || chargingData.totalKwh}
                duration={pendingSession?.duration || chargingData.duration}
                saveSession={saveSession}
                onSettled={handleSettlementComplete}
                isPendingSettlement={pendingSession !== null}
                onSettlingChange={setIsSettling}
              />

              <div className="flex gap-3 flex-wrap">
                {!sessionSettled && pendingSession === null && (
                  <Button
                    onClick={handleContinueCharging}
                    disabled={isSettling}
                    className="flex-1 min-w-[150px] bg-gradient-to-r from-secondary to-secondary/80 text-background-200 font-semibold hover:shadow-lg hover:shadow-secondary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSettling
                      ? "Settling Transaction..."
                      : "Continue Charging ⚡"}
                  </Button>
                )}
                {sessionSettled && (
                  <Button
                    onClick={handleBackToDashboard}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 text-background-200 font-semibold py-6 text-lg hover:shadow-lg hover:shadow-primary/50 transition-all"
                  >
                    Back to Dashboard
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {!isCharging && !showSettlement && (
          <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-sm mt-8">
            <CardHeader className="flex flex-col gap-3 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <h2 className="text-2xl font-bold text-foreground font-conthrax">
                  Charging History
                </h2>
              </div>
            </CardHeader>
            <CardBody className="gap-4">
              {chargingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-foreground/60">No charging sessions yet</p>
                </div>
              ) : (
                <Table
                  aria-label="Charging history"
                  className="bg-transparent"
                  classNames={{
                    table: "bg-transparent",
                    th: "bg-background-100/30 text-primary font-semibold border-b border-primary/20",
                    td: "border-b border-primary/10 text-foreground/80",
                    tr: "hover:bg-background-100/20 transition-colors",
                  }}
                >
                  <TableHeader>
                    <TableColumn className="text-primary">
                      Vehicle Reg
                    </TableColumn>
                    <TableColumn className="text-primary">
                      Energy (kWh)
                    </TableColumn>
                    <TableColumn className="text-primary">
                      Amount (₹)
                    </TableColumn>
                    <TableColumn className="text-primary">Duration</TableColumn>
                    <TableColumn className="text-primary">
                      Date & Time
                    </TableColumn>
                    <TableColumn className="text-primary">Status</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {chargingHistory.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.vehicleReg}</TableCell>
                        <TableCell>{session.totalKwh.toFixed(2)} kWh</TableCell>
                        <TableCell>₹{session.totalCost.toFixed(2)}</TableCell>
                        <TableCell>
                          {Math.floor((session.duration || 0) / 60)} min
                        </TableCell>
                        <TableCell>
                          {session.createdAt
                            ? new Date(session.createdAt).toLocaleString(
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
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            className={
                              session.status === "settled"
                                ? "bg-primary/20 text-primary"
                                : session.status === "completed"
                                ? "bg-secondary/20 text-secondary"
                                : "bg-foreground/20 text-foreground"
                            }
                          >
                            {session.status || "pending"}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardBody>
          </Card>
        )}

        {chargingData.error && (
          <Card className="bg-red-500/10 border border-red-500/30 mt-8">
            <CardBody>
              <p className="text-red-400">Error: {chargingData.error}</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
