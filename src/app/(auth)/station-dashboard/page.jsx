"use client";

import React, { memo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import jsPDF from "jspdf";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import {
  FiLogOut,
  FiZap,
  FiTrendingUp,
  FiBattery,
  FiClock,
  FiActivity,
  FiCheck,
  FiEdit2,
  FiPlus,
  FiX,
  FiDownload,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStationId, setEditingStationId] = useState(null);
  const [formData, setFormData] = useState({
    stationName: "",
    stationAddress: "",
    chargerPower: "",
    ratePerKwh: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        }

        // Use operator's totals from the check endpoint
        setTotalKwh(data.totalEnergyDelivered || 0);
        setTotalRevenue(data.totalRevenue || 0);

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
            },
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
                (s) => s.sessionId === meterData.sessionId,
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
              prev.filter((s) => s.sessionId !== completedSession.sessionId),
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

  const downloadReceiptOperator = (sessionData) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Header
      doc.setTextColor(0, 122, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("RUPEEFLOW", pageWidth / 2, margin + 10, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Receipt", margin, margin + 25);

      // Divider
      doc.setDrawColor(0, 122, 255);
      doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

      let yPos = margin + 40;

      // Transaction details
      const details = [
        ["Receipt ID:", sessionData.sessionId],
        [
          "Date & Time:",
          new Date(sessionData.createdAt).toLocaleString("en-IN"),
        ],
        [
          "Payment Method:",
          sessionData.transactionHash ? "Crypto/MetaMask" : "UPI",
        ],
        ["Vehicle Registration:", sessionData.vehicleReg],
        ["Charging Station:", sessionData.stationName],
      ];

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      details.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 50, yPos);
        yPos += 8;
      });

      // Divider
      yPos += 5;
      doc.setDrawColor(0, 122, 255);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      // Charges breakdown
      yPos += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Charges Breakdown", margin, yPos);
      yPos += 8;

      const charges = [
        ["Energy Delivered:", `${sessionData.totalKwh.toFixed(2)} kWh`],
        [
          "Duration:",
          `${Math.floor((sessionData.duration || 0) / 60)}m ${(sessionData.duration || 0) % 60}s`,
        ],
        ["Revenue Earned:", `Rs. ${sessionData.totalCost.toFixed(2)}`],
      ];

      doc.setFontSize(10);
      charges.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 50, yPos);
        yPos += 7;
      });

      // Divider
      yPos += 5;
      doc.setDrawColor(0, 122, 255);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      // Blockchain info (if available)
      if (sessionData.transactionHash) {
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Blockchain Details", margin, yPos);
        yPos += 7;
        doc.setFont("helvetica", "bold");
        doc.text("Transaction Hash:", margin, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(sessionData.transactionHash, margin, yPos, {
          maxWidth: pageWidth - 2 * margin,
        });
      }

      // Footer
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(8);
      doc.text(
        "This receipt is an immutable record on the Polygon Amoy blockchain.",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      );

      doc.save(`RupeeFlow_Receipt_${sessionData.sessionId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const openAddModal = () => {
    setEditingStationId(null);
    setFormData({
      stationName: "",
      stationAddress: "",
      chargerPower: "",
      ratePerKwh: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (station) => {
    setEditingStationId(station._id);
    setFormData({
      stationName: station.stationName,
      stationAddress: station.stationAddress,
      chargerPower: station.chargerPower.toString(),
      ratePerKwh: station.ratePerKwh.toString(),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStationId(null);
    setFormData({
      stationName: "",
      stationAddress: "",
      chargerPower: "",
      ratePerKwh: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveStation = async () => {
    if (
      !formData.stationName ||
      !formData.stationAddress ||
      !formData.chargerPower ||
      !formData.ratePerKwh
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = editingStationId
        ? `/api/operator/update-station/${editingStationId}`
        : "/api/operator/add-station";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stationName: formData.stationName,
          stationAddress: formData.stationAddress,
          chargerPower: parseFloat(formData.chargerPower),
          ratePerKwh: parseFloat(formData.ratePerKwh),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOperatorData(data.operator);
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save station");
      }
    } catch (error) {
      console.error("Error saving station:", error);
      alert("Error saving station");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <p className="text-foreground/60 mb-4">
                  No charging stations found
                </p>
                <Button
                  color="primary"
                  onClick={openAddModal}
                  startContent={<FiPlus />}
                >
                  Add Your First Station
                </Button>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {operatorData.stations.map((station) => (
                <Card
                  key={station._id}
                  className="bg-gradient-to-br from-background-100/50 to-background-200/30 border border-primary/20 relative group"
                >
                  <CardHeader className="flex items-center justify-between border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <h3 className="text-lg font-bold text-primary font-conthrax">
                        {station.stationName}
                      </h3>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      className="bg-primary/20 hover:bg-primary/30 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openEditModal(station)}
                    >
                      <FiEdit2 size={16} />
                    </Button>
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

              {/* Add New Station Card */}
              <button
                onClick={openAddModal}
                className="bg-gradient-to-br from-background-100/50 to-background-200/30 border-2 border-dashed border-primary/40 hover:border-primary/60 transition-colors cursor-pointer flex items-center justify-center rounded-lg p-6 hover:bg-gradient-to-br hover:from-background-100/70 hover:to-background-200/50"
              >
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <FiPlus size={24} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary font-conthrax mb-1">
                      Add New Station
                    </h3>
                    <p className="text-sm text-foreground/60">
                      Create a new charging station
                    </p>
                  </div>
                </div>
              </button>
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
                              (session.chargePercentage || 0),
                          ).toFixed(0)}
                          %
                        </p>
                      </div>
                      <Progress
                        value={Math.min(
                          100,
                          (session.initialBatteryPercent || 0) +
                            (session.chargePercentage || 0),
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
                      <TableColumn>Action</TableColumn>
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
                                    },
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
                          <TableCell>
                            <Button
                              isIconOnly
                              size="sm"
                              className="bg-primary/20 hover:bg-primary/40 text-primary"
                              onClick={() =>
                                downloadReceiptOperator(settlement)
                              }
                              title="Download Receipt"
                            >
                              <FiDownload size={16} />
                            </Button>
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

      {/* Add/Edit Station Modal */}
      <Modal
        isOpen={isModalOpen}
        onOpenChange={handleCloseModal}
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-background/80 backdrop-opacity-40",
          base: "bg-background-100 border border-primary/20",
          closeButton: "text-foreground/60 hover:text-foreground",
        }}
      >
        <ModalContent>
          <ModalHeader className="border-b border-primary/10">
            <div className="flex items-center gap-2">
              {editingStationId ? (
                <>
                  <FiEdit2 className="text-primary" />
                  <span className="font-conthrax">Edit Station</span>
                </>
              ) : (
                <>
                  <FiPlus className="text-primary" />
                  <span className="font-conthrax">Add New Station</span>
                </>
              )}
            </div>
          </ModalHeader>
          <ModalBody className="gap-4 py-6">
            <Input
              label="Station Name"
              placeholder="e.g., Station 1"
              name="stationName"
              value={formData.stationName}
              onChange={handleInputChange}
              variant="bordered"
              className="text-foreground"
              classNames={{
                input: "bg-background-200/30 text-foreground",
                label: "text-foreground/70",
              }}
            />
            <Input
              label="Station Address"
              placeholder="e.g., 34, Park Street"
              name="stationAddress"
              value={formData.stationAddress}
              onChange={handleInputChange}
              variant="bordered"
              className="text-foreground"
              classNames={{
                input: "bg-background-200/30 text-foreground",
                label: "text-foreground/70",
              }}
            />
            <Input
              label="Charger Power (kW)"
              placeholder="e.g., 7.4"
              name="chargerPower"
              type="number"
              step="0.1"
              value={formData.chargerPower}
              onChange={handleInputChange}
              variant="bordered"
              className="text-foreground"
              classNames={{
                input: "bg-background-200/30 text-foreground",
                label: "text-foreground/70",
              }}
            />
            <Input
              label="Rate per kWh (₹)"
              placeholder="e.g., 12"
              name="ratePerKwh"
              type="number"
              step="0.1"
              value={formData.ratePerKwh}
              onChange={handleInputChange}
              variant="bordered"
              className="text-foreground"
              classNames={{
                input: "bg-background-200/30 text-foreground",
                label: "text-foreground/70",
              }}
            />
          </ModalBody>
          <ModalFooter className="border-t border-primary/10">
            <Button
              color="default"
              variant="light"
              onPress={handleCloseModal}
              className="text-foreground"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSaveStation}
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {editingStationId ? "Update Station" : "Add Station"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
