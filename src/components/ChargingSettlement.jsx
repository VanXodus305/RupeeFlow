"use client";

import { useState, useEffect } from "react";
import {
  settleChargingDirect,
  checkWalletBalance,
  estimateGasFees,
  checkTransactionStatus,
  listenToSettlementEvents,
  getNetworkInfo,
  markSessionAsSettled,
} from "@/utils/contract-interactions";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Chip,
  Spinner,
} from "@heroui/react";
import { FiCheck, FiAlertCircle, FiZap, FiTrendingUp } from "react-icons/fi";

export default function ChargingSettlement({
  totalCost,
  duration,
  secondsUsed,
  totalKwh,
  chargePercentage,
  sessionId,
  operatorId,
  vehicleReg,
  batteryCapacity,
  ratePerKwh,
  saveSession,
  onSettled,
  isPendingSettlement = false,
  onSettlingChange,
  walletAvailable = true,
}) {
  const [isSettling, setIsSettling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [sessionSaved, setSessionSaved] = useState(false);

  // Ethers states
  const [walletBalance, setWalletBalance] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);

  // Notify parent when settling state changes
  useEffect(() => {
    if (onSettlingChange) {
      onSettlingChange(isSettling);
    }
  }, [isSettling, onSettlingChange]);

  // Get network info on mount
  useEffect(() => {
    const initNetwork = async () => {
      const networkData = await getNetworkInfo();
      if (networkData.success) {
        setNetworkInfo(networkData);
      }
    };

    initNetwork();
  }, []);

  const handleSaveSession = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (!operatorId) {
        throw new Error("Operator ID not available");
      }

      await saveSession(operatorId, vehicleReg, batteryCapacity, ratePerKwh);
      setSessionSaved(true);

      console.log("Session saved to database:", {
        sessionId,
        operatorId,
        totalKwh,
        totalCost,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckWallet = async () => {
    try {
      setIsCheckingBalance(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Web3 wallet");
      }

      // Request wallet connection and get user address
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No wallet accounts found. Please connect your wallet."
        );
      }

      const userAddress = accounts[0];
      const balanceResult = await checkWalletBalance(userAddress);

      if (balanceResult.success) {
        setWalletBalance(balanceResult);
        console.log("Wallet balance checked:", balanceResult);
      } else {
        throw new Error(balanceResult.error);
      }
    } catch (err) {
      setError(err.message);
      console.error("Wallet check error:", err);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const handleEstimateGas = async () => {
    try {
      setError(null);
      const gasResult = await estimateGasFees();

      if (gasResult.success) {
        setGasEstimate(gasResult);
        console.log("Gas estimated:", gasResult);
      } else {
        throw new Error(gasResult.error);
      }
    } catch (err) {
      setError(err.message);
      console.error("Gas estimation error:", err);
    }
  };

  const handleSettle = async () => {
    // For pending settlements, skip saving since the session is already in database
    // For new settlements, save to database if not already saved
    if (!isPendingSettlement && !sessionSaved && saveSession) {
      await handleSaveSession();
    }

    try {
      setIsSettling(true);
      setError(null);

      // Use direct wallet settlement
      const settlementResult = await settleChargingDirect(
        totalCost,
        totalKwh,
        durationInSeconds,
        operatorId // Station address
      );

      if (!settlementResult.success) {
        throw new Error(settlementResult.error);
      }

      setTxHash(settlementResult.transactionHash);

      // Scroll to top to show the transaction hash
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Mark session as settled in database
      const markResult = await markSessionAsSettled(
        sessionId,
        settlementResult.transactionHash
      );

      if (!markResult.success) {
        console.warn(
          "Failed to mark session as settled in database:",
          markResult.error
        );
      }

      // Check transaction status
      const statusResult = await checkTransactionStatus(
        settlementResult.transactionHash
      );
      if (statusResult.success) {
        setTxStatus(statusResult);
      }

      // Notify parent that settlement is complete
      if (onSettled) {
        onSettled();
      }
    } catch (err) {
      // Provide user-friendly error messages
      let userFriendlyError = err.message;

      if (
        err.message.includes("user rejected") ||
        err.message.includes("User denied")
      ) {
        userFriendlyError =
          "❌ Transaction rejected by user. Please click 'Complete & Settle' again to try again.";
      } else if (err.message.includes("insufficient funds")) {
        userFriendlyError =
          "❌ Insufficient MATIC balance in your wallet. Please add more MATIC and try again.";
      } else if (err.message.includes("Internal JSON-RPC error")) {
        userFriendlyError =
          "❌ Transaction failed. Please try again or contact support.";
      } else if (err.message.includes("Network")) {
        userFriendlyError =
          "❌ Network error. Please check your internet connection and try again.";
      } else if (err.message.includes("MetaMask")) {
        userFriendlyError =
          "❌ MetaMask error. Please make sure you are connected to Polygon Amoy network.";
      }

      setError(userFriendlyError);
      console.error("Settlement error:", err);
    } finally {
      setIsSettling(false);
    }
  };

  // Use duration if provided, otherwise use secondsUsed
  const durationInSeconds =
    duration !== undefined ? duration : secondsUsed || 0;
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;

  // Calculate MATIC equivalent (1 MATIC ≈ 50 INR as approximate rate)
  const maticAmount = (totalCost / 50).toFixed(4);

  return (
    <>
      {txHash ? (
        <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-sm">
          <CardBody className="gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/20 flex items-center justify-center p-3">
                <FiCheck className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary font-conthrax">
                  Settlement Confirmed!
                </h3>
                <p className="text-sm text-foreground/60">
                  Your transaction has been recorded on blockchain
                </p>
              </div>
            </div>

            <Divider className="bg-primary/20" />

            <div className="space-y-3">
              <div>
                <p className="text-xs text-foreground/60 mb-1">
                  Transaction Hash
                </p>
                <p className="text-xs font-mono text-primary break-all bg-background-100/30 p-2 rounded border border-primary/20">
                  {txHash}
                </p>
              </div>

              <Button
                as="a"
                href={`https://amoy.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-primary to-secondary text-background-200 font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
              >
                View on PolygonScan ↗️
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-background-100/50 to-background-200/50 border border-primary/20 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-3 border-b border-primary/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <h2 className="text-2xl font-bold text-foreground font-conthrax">
                {isPendingSettlement
                  ? "Pending Settlement"
                  : "Charging Complete"}{" "}
                ✅
              </h2>
            </div>
          </CardHeader>

          <CardBody className="gap-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-gradient-to-br from-background-200/50 to-background-100/30 border border-primary/20 rounded-lg p-3 md:p-4 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiZap className="text-primary text-xs md:text-sm" />
                  <p className="text-xs text-foreground/60 font-semibold">
                    Total Cost
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-primary font-conthrax">
                  ₹{totalCost.toFixed(2)}
                </p>
                <p className="text-xs text-secondary font-semibold mt-1 font-conthrax">
                  {maticAmount} MATIC
                </p>
              </div>

              <div className="bg-gradient-to-br from-background-200/50 to-background-100/30 border border-secondary/20 rounded-lg p-3 md:p-4 hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp className="text-secondary text-xs md:text-sm" />
                  <p className="text-xs text-foreground/60 font-semibold">
                    Energy Used
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-secondary font-conthrax">
                  {totalKwh.toFixed(2)}
                </p>
                <p className="text-xs text-foreground/50 mt-1">kWh</p>
              </div>

              <div className="bg-gradient-to-br from-background-200/50 to-background-100/30 border border-primary/20 rounded-lg p-3 md:p-4 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiCheck className="text-primary text-xs md:text-sm" />
                  <p className="text-xs text-foreground/60 font-semibold">
                    Duration
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-primary font-conthrax">
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </p>
                <p className="text-xs text-foreground/50 mt-1">mm:ss</p>
              </div>

              <div className="bg-gradient-to-br from-background-200/50 to-background-100/30 border border-secondary/20 rounded-lg p-3 md:p-4 hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiZap className="text-secondary text-xs md:text-sm" />
                  <p className="text-xs text-foreground/60 font-semibold">
                    Battery Gain
                  </p>
                </div>
                <p className="text-xl md:text-2xl font-bold text-secondary font-conthrax">
                  +{chargePercentage.toFixed(1)}
                </p>
                <p className="text-xs text-foreground/50 mt-1">percent</p>
              </div>
            </div>

            {error && (
              <Card className="bg-red-500/10 border border-red-500/30">
                <CardBody className="flex flex-row items-center gap-3 py-3">
                  <FiAlertCircle className="text-red-400 text-lg flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </CardBody>
              </Card>
            )}

            {sessionSaved && (
              <Card className="bg-primary/10 border border-primary/30">
                <CardBody className="flex flex-row items-center gap-3 py-3">
                  <FiCheck className="text-primary text-lg flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      ✅ Session Saved
                    </p>
                    <p className="text-xs text-foreground/60">
                      Your charging session has been recorded in the system
                    </p>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Network Info */}
            {networkInfo && (
              <Card className="bg-gradient-to-r from-primary/15 to-secondary/15 border-2 border-primary/30 backdrop-blur-sm">
                <CardBody className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div>
                      <p className="text-xs text-foreground/60 font-semibold uppercase tracking-wide">
                        Network
                      </p>
                      <p className="text-base font-conthrax text-primary font-semibold mt-1">
                        {networkInfo.network}
                      </p>
                      <p className="text-xs text-foreground/70 mt-1">
                        Chain ID: {networkInfo.chainId}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Wallet Balance and Gas Estimation - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wallet Balance Section */}
              <div className="bg-background-100/30 border border-primary/20 rounded-lg p-4 space-y-3 flex flex-col">
                <div className="flex items-center gap-2">
                  <FiZap className="text-secondary" />
                  <p className="font-semibold text-foreground">
                    Wallet Balance
                  </p>
                </div>

                <div className="flex-1">
                  {walletBalance ? (
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">
                        {walletBalance.balance}
                      </span>{" "}
                      MATIC
                    </p>
                  ) : (
                    <p className="text-xs text-foreground/60">
                      Click to verify your balance before settlement
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleCheckWallet}
                  disabled={isCheckingBalance}
                  className="w-full bg-secondary/80 text-background-200 font-semibold hover:bg-secondary transition-all"
                >
                  {isCheckingBalance ? "Checking..." : "Check Wallet Balance"}
                </Button>
              </div>

              {/* Gas Estimate Section */}
              <div className="bg-background-100/30 border border-primary/20 rounded-lg p-4 space-y-3 flex flex-col">
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="text-primary" />
                  <p className="font-semibold text-foreground">
                    Gas Estimation
                  </p>
                </div>

                <div className="flex-1">
                  {gasEstimate ? (
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground/80">
                        <span className="font-semibold">Gas Price:</span>{" "}
                        {gasEstimate.gasPrice} GWEI
                      </p>
                      <p className="text-foreground/80">
                        <span className="font-semibold">Est. Cost:</span>{" "}
                        {gasEstimate.estimatedGasCostMatic} MATIC (~₹
                        {(
                          parseFloat(gasEstimate.estimatedGasCostMatic) * 50
                        ).toFixed(2)}
                        )
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/60">
                      Click to estimate transaction cost
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleEstimateGas}
                  className="w-full bg-primary/80 text-background-200 font-semibold hover:bg-primary transition-all"
                >
                  Estimate Gas Fees
                </Button>
              </div>
            </div>

            {/* Transaction Status Section */}
            {txStatus && (
              <Card className="bg-primary/10 border border-primary/20">
                <CardBody className="py-4 gap-3">
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-primary" />
                    <p className="font-semibold text-foreground">
                      Transaction Status
                    </p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-foreground/80">
                      <span className="font-semibold">Status:</span>{" "}
                      {txStatus.status === "confirmed" ? (
                        <Chip
                          size="sm"
                          className="bg-primary/20 text-primary ml-2"
                        >
                          ✅ Confirmed
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          className="bg-secondary/20 text-secondary ml-2"
                        >
                          ⏳ Pending
                        </Chip>
                      )}
                    </p>
                    {txStatus.blockNumber && (
                      <p className="text-foreground/70">
                        <span className="font-semibold">Block:</span>{" "}
                        {txStatus.blockNumber}
                      </p>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Settlement Button */}
            <Button
              onClick={handleSettle}
              disabled={isSettling || isSaving || !walletAvailable}
              className="w-full bg-gradient-to-r from-primary to-secondary text-background-200 font-semibold py-6 text-lg hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!walletAvailable ? (
                "❌ MetaMask Required to Settle"
              ) : isSaving ? (
                <>
                  <Spinner size="sm" color="current" />
                  Saving to Database... 💾
                </>
              ) : isSettling ? (
                <>
                  <Spinner size="sm" color="current" />
                  Settling on MetaMask... 🦊
                </>
              ) : (
                "Complete & Settle ✅"
              )}
            </Button>

            <p className="text-xs text-foreground/60 text-center">
              This will save your session and record on Polygon Amoy testnet
              using your wallet
            </p>
          </CardBody>
        </Card>
      )}
    </>
  );
}
