"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Card,
  CardBody,
} from "@heroui/react";
import { FiCheck, FiDownload, FiCopy } from "react-icons/fi";
import { generateQRCode, generateRandomUPI } from "@/utils/qr-generator";
import jsPDF from "jspdf";

export default function UPIPaymentModal({
  isOpen,
  onClose,
  totalCost,
  totalKwh,
  duration,
  vehicleReg,
  stationName,
  sessionId,
  operatorWalletAddress,
  transactionHash,
  onConfirmPayment,
}) {
  const [stage, setStage] = useState("input"); // input, qr, completed, receipt, error
  const [qrCode, setQrCode] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [timeLeft, setTimeLeft] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settlementHash, setSettlementHash] = useState(null);
  const [settlementError, setSettlementError] = useState(null);

  useEffect(() => {
    if (isOpen && stage === "input") {
      setUpiId("");
      setQrCode(null);
      setTimeLeft(10);
    }
  }, [isOpen, stage]);

  useEffect(() => {
    if (stage !== "qr" || !isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handlePaymentComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, isOpen]);

  const handleGenerateQR = () => {
    // Use user-entered UPI ID or generate a random one
    const finalUpiId = upiId.trim() || generateRandomUPI();
    setUpiId(finalUpiId);
    setQrCode(generateQRCode(finalUpiId));
    setTimeLeft(10);
    setStage("qr");
  };

  const handleDirectUPISubmit = async (e) => {
    if (e.key === "Enter") {
      if (!upiId.trim()) {
        setSettlementError("Please enter your UPI ID");
        return;
      }
      setSettlementError(null);
      await handlePaymentComplete();
    }
  };

  const handlePaymentComplete = async () => {
    setIsProcessing(true);
    setStage("completed");
    setSettlementError(null);

    try {
      // Call UPI settlement API
      const response = await fetch("/api/charging/settle-upi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          totalCost,
          totalKwh,
          duration,
          stationAddress: operatorWalletAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process UPI settlement");
      }

      const data = await response.json();

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSettlementHash(data.transactionHash);
      setStage("receipt");

      if (onConfirmPayment && data.transactionHash) {
        onConfirmPayment(data.transactionHash);
      }
    } catch (error) {
      console.error("UPI settlement error:", error);
      setSettlementError(error.message);
      setStage("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUPI = () => {
    if (upiId) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadReceipt = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;

      // Background color
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Header
      doc.setFontSize(24);
      doc.setTextColor(0, 122, 255);
      doc.setFont("helvetica", "bold");
      doc.text("RupeeFlow", margin, margin + 10);

      // Title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Payment Receipt", margin, margin + 25);

      // Divider
      doc.setDrawColor(0, 122, 255);
      doc.line(margin, margin + 30, pageWidth - margin, margin + 30);

      let yPos = margin + 40;

      // Transaction details
      const details = [
        ["Receipt ID:", upiId],
        ["Date & Time:", new Date().toLocaleString()],
        ["Payment Method:", "UPI (Simulated)"],
        ["Vehicle Registration:", vehicleReg],
        ["Charging Station:", stationName],
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
        ["Energy Used:", `${totalKwh.toFixed(2)} kWh`],
        ["Duration:", `${Math.floor(duration / 60)}m ${duration % 60}s`],
        ["Total Amount:", `Rs. ${totalCost.toFixed(2)}`],
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

      // Blockchain info
      yPos += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Blockchain Record", margin, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Transaction Hash:", margin, yPos);
      yPos += 5;

      // Wrap transaction hash
      const hashLines = doc.splitTextToSize(
        transactionHash,
        pageWidth - 2 * margin - 5,
      );
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      hashLines.forEach((line) => {
        doc.text(line, margin + 2, yPos);
        yPos += 4;
      });

      yPos += 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Status:", margin, yPos);
      doc.setTextColor(0, 200, 0);
      doc.setFont("helvetica", "bold");
      doc.text("✓ Confirmed", margin + 50, yPos);

      // Footer
      doc.setTextColor(128, 128, 128);
      doc.setFontSize(8);
      doc.text(
        "This receipt is an immutable record on the Polygon Amoy blockchain.",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      );

      doc.save(`RupeeFlow_Receipt_${upiId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
      <ModalContent>
        {stage === "input" && (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-primary/20">
              <h2 className="text-xl font-bold text-primary font-conthrax">
                Pay with UPI
              </h2>
              <p className="text-sm text-foreground/60 font-normal">
                Choose your payment method
              </p>
            </ModalHeader>
            <ModalBody className="gap-4 py-4 max-h-[calc(100vh-100px)] overflow-y-auto">
              <div className="flex flex-col gap-3">
                {settlementError && (
                  <div className="bg-danger/15 border border-danger/30 rounded-lg p-3">
                    <p className="text-sm text-danger">{settlementError}</p>
                  </div>
                )}

                {/* Direct UPI Entry */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-foreground">
                    Enter UPI ID Manually
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => {
                        setUpiId(e.target.value);
                        setSettlementError(null);
                      }}
                      placeholder="e.g., yourname@upi"
                      className="flex-1 bg-background-100/50 border border-primary/20 rounded-lg px-4 py-3 text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50 transition"
                      onKeyPress={handleDirectUPISubmit}
                    />
                  </div>
                  <p className="text-xs text-foreground/50">
                    Press Enter to pay with this UPI ID
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-primary/20"></div>
                  <span className="text-sm font-semibold text-foreground/60">
                    OR
                  </span>
                  <div className="flex-1 h-px bg-primary/20"></div>
                </div>

                {/* QR Code Generation */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-foreground">
                    Scan QR Code
                  </label>
                  <Button
                    className="bg-gradient-to-r from-primary to-secondary font-semibold text-black py-3"
                    onPress={handleGenerateQR}
                  >
                    Generate & Scan QR Code
                  </Button>
                  <p className="text-xs text-foreground/50">
                    Generate a QR code and pay using any UPI app
                  </p>
                </div>

                {/* Payment Amount Card */}
                <Card className="w-full bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/20 mt-2">
                  <CardBody className="gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      Payment Amount
                    </p>
                    <p className="text-2xl font-bold text-primary font-conthrax">
                      ₹{totalCost.toFixed(2)}
                    </p>
                  </CardBody>
                </Card>
              </div>
            </ModalBody>
          </>
        )}
        {stage === "qr" && (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-primary/20">
              <h2 className="text-xl font-bold text-primary font-conthrax">
                Scan to Pay with UPI
              </h2>
              <p className="text-sm text-foreground/60 font-normal">
                Payment will be confirmed in {timeLeft} seconds
              </p>
            </ModalHeader>
            <ModalBody className="gap-4 py-4 flex flex-col items-center justify-center min-h-[300px]">
              <div className="flex flex-col items-center gap-4">
                {qrCode && (
                  <div className="bg-white p-3 rounded-lg border-2 border-primary/30">
                    <img src={qrCode} alt="UPI QR Code" className="w-40 h-40" />
                  </div>
                )}

                <Card className="w-full bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/20">
                  <CardBody className="gap-2 text-center">
                    <p className="text-sm font-semibold text-foreground">
                      Payment Amount
                    </p>
                    <p className="text-2xl font-bold text-primary font-conthrax">
                      ₹{totalCost.toFixed(2)}
                    </p>
                  </CardBody>
                </Card>

                <div className="w-full bg-background-100/30 border border-secondary/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-foreground/60 mb-1">
                    Auto-confirming in
                  </p>
                  <p className="text-lg font-bold text-secondary font-conthrax">
                    {timeLeft}s
                  </p>
                </div>
              </div>
            </ModalBody>
          </>
        )}

        {stage === "completed" && (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-primary/20">
              <h2 className="text-xl font-bold text-primary font-conthrax">
                Processing Payment...
              </h2>
            </ModalHeader>
            <ModalBody className="gap-6 py-12 flex items-center justify-center">
              <Spinner size="lg" color="primary" />
              <p className="text-foreground/60 text-center">
                Recording transaction on blockchain...
              </p>
            </ModalBody>
          </>
        )}

        {stage === "receipt" && (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/20 flex items-center justify-center p-2">
                  <FiCheck className="text-primary text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary font-conthrax">
                    Payment Successful!
                  </h2>
                  <p className="text-sm text-foreground/60 font-normal">
                    Transaction recorded on blockchain
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="gap-4 py-6">
              <Card className="bg-primary/10 border border-primary/20">
                <CardBody className="gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Receipt ID: {upiId}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {new Date().toLocaleString()}
                  </p>
                </CardBody>
              </Card>

              <Card className="bg-background-100/50 border border-primary/20">
                <CardBody className="gap-2">
                  <p className="text-xs text-foreground/60 mb-1">
                    Transaction Hash (Blockchain Record)
                  </p>
                  <code className="text-xs font-mono text-primary bg-background-200/30 p-2 rounded break-all">
                    {settlementHash || transactionHash}
                  </code>
                  <Button
                    as="a"
                    href={`https://amoy.polygonscan.com/tx/${settlementHash || transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    className="mt-2 bg-primary/30 hover:bg-primary/50 text-primary font-semibold"
                    startContent={<FiCheck size={14} />}
                  >
                    View on PolygonScan
                  </Button>
                </CardBody>
              </Card>

              <div className="bg-gradient-to-r from-primary/15 to-secondary/15 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-foreground/60 mb-2">Amount Paid</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-primary">₹</span>
                  <p className="text-2xl font-bold text-primary font-conthrax">
                    {totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="border-t border-primary/10 gap-2">
              <Button color="default" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button
                onClick={downloadReceipt}
                className="bg-primary/80 text-background-200 font-semibold hover:bg-primary transition-all"
                startContent={<FiDownload />}
              >
                Download Receipt
              </Button>
            </ModalFooter>
          </>
        )}

        {stage === "error" && (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-red-500/20">
              <h2 className="text-xl font-bold text-red-500 font-conthrax">
                Payment Failed
              </h2>
              <p className="text-sm text-foreground/60 font-normal">
                Unable to process UPI settlement
              </p>
            </ModalHeader>
            <ModalBody className="gap-4 py-6">
              <Card className="bg-red-500/10 border border-red-500/20">
                <CardBody className="gap-2">
                  <p className="text-sm text-red-400 font-semibold">Error</p>
                  <p className="text-xs text-red-400">{settlementError}</p>
                </CardBody>
              </Card>
            </ModalBody>
            <ModalFooter className="border-t border-red-500/10">
              <Button
                onClick={onClose}
                className="w-full bg-red-500/80 text-white font-semibold hover:bg-red-500 transition-all"
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}

        {stage !== "receipt" && stage !== "error" && (
          <ModalFooter className="border-t border-primary/10 gap-2">
            <Button
              color="default"
              variant="light"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
