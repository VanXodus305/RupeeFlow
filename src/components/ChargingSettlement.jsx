"use client";

import { useState, useEffect } from "react";
import {
  settleChargingDirect,
  checkWalletBalance,
  estimateGasFees,
  checkTransactionStatus,
  listenToSettlementEvents,
  getNetworkInfo,
} from "@/utils/contract-interactions";

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

  // Get network info and setup event listener on mount
  useEffect(() => {
    const initNetwork = async () => {
      const networkData = await getNetworkInfo();
      if (networkData.success) {
        setNetworkInfo(networkData);
      }
    };

    initNetwork();

    // Listen for settlement events
    listenToSettlementEvents((event) => {
      console.log("Settlement event detected:", event);
    });
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
    // First save to database if not already saved
    if (!sessionSaved && saveSession) {
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

      console.log("Settlement successful:", {
        sessionId,
        totalKwh,
        totalCost,
        txHash: settlementResult.transactionHash,
        blockNumber: settlementResult.blockNumber,
      });

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
      setError(err.message);
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

          {sessionSaved && (
            <div
              style={{
                backgroundColor: "#e3f2fd",
                border: "2px solid #2196F3",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                ✅ Session Saved to Database
              </p>
              <p style={{ fontSize: "12px", color: "#666", margin: "0" }}>
                Your charging session has been recorded in the system.
              </p>
            </div>
          )}

          {/* Network Info */}
          {networkInfo && (
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "10px",
                borderRadius: "4px",
                marginBottom: "15px",
                fontSize: "12px",
                color: "#666",
              }}
            >
              <p style={{ margin: "0" }}>
                <strong>Network:</strong> {networkInfo.network} (Chain ID:{" "}
                {networkInfo.chainId})
              </p>
            </div>
          )}

          {/* Wallet Balance Section */}
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          >
            <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
              💰 Wallet Balance
            </p>
            {walletBalance ? (
              <div>
                <p style={{ margin: "5px 0", fontSize: "12px" }}>
                  <strong>Balance:</strong> {walletBalance.balance} MATIC
                </p>
              </div>
            ) : (
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                Click "Check Wallet" to verify your balance before settlement
              </p>
            )}
            <button
              onClick={handleCheckWallet}
              disabled={isCheckingBalance}
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                backgroundColor: "#ffc107",
                color: "black",
                border: "none",
                borderRadius: "4px",
                cursor: isCheckingBalance ? "not-allowed" : "pointer",
              }}
            >
              {isCheckingBalance ? "Checking..." : "Check Wallet Balance"}
            </button>
          </div>

          {/* Gas Estimate Section */}
          <div
            style={{
              backgroundColor: "#e8f4f8",
              border: "1px solid #0288d1",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          >
            <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
              ⛽ Gas Estimation
            </p>
            {gasEstimate ? (
              <div>
                <p style={{ margin: "5px 0", fontSize: "12px" }}>
                  <strong>Gas Price:</strong> {gasEstimate.gasPrice} GWEI
                </p>
                <p style={{ margin: "5px 0", fontSize: "12px" }}>
                  <strong>Estimated Cost:</strong>{" "}
                  {gasEstimate.estimatedGasCostMatic} MATIC (~₹
                  {(parseFloat(gasEstimate.estimatedGasCostMatic) * 50).toFixed(
                    2
                  )}
                  )
                </p>
              </div>
            ) : (
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
                Click "Estimate Gas" to see transaction cost
              </p>
            )}
            <button
              onClick={handleEstimateGas}
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                backgroundColor: "#0288d1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Estimate Gas Fees
            </button>
          </div>

          {/* Transaction Status Section */}
          {txStatus && (
            <div
              style={{
                backgroundColor: "#e8f5e9",
                border: "1px solid #4CAF50",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "15px",
              }}
            >
              <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
                📊 Transaction Status
              </p>
              <p style={{ margin: "5px 0", fontSize: "12px" }}>
                <strong>Status:</strong>{" "}
                {txStatus.status === "confirmed"
                  ? "✅ Confirmed"
                  : "⏳ Pending"}
              </p>
              {txStatus.blockNumber && (
                <p style={{ margin: "5px 0", fontSize: "12px" }}>
                  <strong>Block:</strong> {txStatus.blockNumber}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleSettle}
            disabled={isSettling || isSaving}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: isSettling || isSaving ? "#ccc" : "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isSettling || isSaving ? "not-allowed" : "pointer",
            }}
          >
            {isSaving
              ? "Saving to Database... 💾"
              : isSettling
              ? "Settling on Blockchain... ⛓️"
              : "Complete & Settle ✅"}
          </button>

          <p
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            This will save your session and record on Polygon Amoy testnet using
            your wallet
          </p>
        </>
      )}
    </div>
  );
}
