"use client";

import { ethers } from "ethers";

// Contract configuration
const RUPEEFLOW_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72";

const POLYGON_RPC_URL =
  process.env.NEXT_PUBLIC_POLYGON_RPC_URL ||
  "https://rpc-amoy.polygon.technology";

// Minimal ABI for settlement
const RUPEEFLOW_ABI = [
  {
    inputs: [
      { name: "evOwner", type: "address" },
      { name: "station", type: "address" },
      { name: "energyKwh", type: "uint256" },
      { name: "amountPaid", type: "uint256" },
      { name: "duration", type: "uint256" },
    ],
    name: "settleCharging",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "evOwner", type: "address" },
      { indexed: true, name: "station", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "ChargingSettled",
    type: "event",
  },
];

/**
 * 1. Check user's wallet balance
 */
export async function checkWalletBalance(userAddress) {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const balance = await provider.getBalance(userAddress);
    const balanceInMatic = ethers.formatEther(balance);

    console.log(
      `[Ethers] Wallet balance for ${userAddress}: ${balanceInMatic} MATIC`
    );

    return {
      success: true,
      balance: balanceInMatic,
      balanceInWei: balance.toString(),
    };
  } catch (error) {
    console.error("[Ethers] Error checking balance:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 2. Estimate gas fees for settlement
 */
export async function estimateGasFees() {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);

    // Get fee data (works with EIP-1559 networks like Polygon)
    const feeData = await provider.getFeeData();

    if (!feeData.gasPrice && !feeData.maxFeePerGas) {
      throw new Error("Unable to fetch gas price from network");
    }

    // Use maxFeePerGas for EIP-1559 or fall back to gasPrice
    const gasPrice = feeData.maxFeePerGas || feeData.gasPrice;
    const gasPriceInGwei = ethers.formatUnits(gasPrice, "gwei");

    // Estimate gas (settlement is typically ~100k-150k gas on Polygon)
    const estimatedGasUnits = ethers.toBigInt("150000");
    const estimatedGasWei = gasPrice * estimatedGasUnits;
    const estimatedGasInMatic = ethers.formatEther(estimatedGasWei);

    console.log(`[Ethers] Gas estimation:`, {
      gasPrice: gasPriceInGwei,
      estimatedGas: estimatedGasUnits.toString(),
      estimatedCost: estimatedGasInMatic,
    });

    return {
      success: true,
      gasPrice: gasPriceInGwei,
      estimatedGasUnits: estimatedGasUnits.toString(),
      estimatedGasCostMatic: estimatedGasInMatic,
      estimatedGasCostWei: estimatedGasWei.toString(),
    };
  } catch (error) {
    console.error("[Ethers] Error estimating gas:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 3. Check transaction status
 */
export async function checkTransactionStatus(txHash) {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);

    console.log(`[Ethers] Checking transaction: ${txHash}`);

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        success: true,
        status: "pending",
        message: "Transaction is still pending",
      };
    }

    const status = receipt.status === 1 ? "confirmed" : "failed";

    console.log(`[Ethers] Transaction ${status}:`, {
      hash: txHash,
      block: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    });

    return {
      success: true,
      status,
      blockNumber: receipt.blockNumber,
      gasUsed: ethers.formatUnits(receipt.gasUsed, "wei"),
      confirmations: receipt.confirmations,
    };
  } catch (error) {
    console.error("[Ethers] Error checking transaction:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 4. Listen to settlement events in real-time
 */
export async function listenToSettlementEvents(callback) {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const contract = new ethers.Contract(
      RUPEEFLOW_CONTRACT_ADDRESS,
      RUPEEFLOW_ABI,
      provider
    );

    console.log("[Ethers] Listening to ChargingSettled events...");

    // Listen for ChargingSettled events
    contract.on("ChargingSettled", (evOwner, station, amount, timestamp) => {
      const amountInMatic = ethers.formatEther(amount);
      console.log("[Ethers] Event received - ChargingSettled:", {
        evOwner,
        station,
        amount: amountInMatic,
        timestamp: timestamp.toString(),
      });

      if (callback) {
        callback({
          evOwner,
          station,
          amount: amountInMatic,
          timestamp: timestamp.toString(),
        });
      }
    });

    return {
      success: true,
      message: "Listening to events",
    };
  } catch (error) {
    console.error("[Ethers] Error setting up event listener:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 5. Direct wallet settlement (User submits transaction themselves)
 */
export async function settleChargingDirect(
  totalCost,
  totalKwh,
  duration,
  stationAddress
) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask or other Web3 wallet not found");
    }

    console.log("[Ethers] Initiating direct wallet settlement...");

    // IMPORTANT: Switch to Polygon Amoy first
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13882" }], // Polygon Amoy chain ID
      });
      console.log("[Ethers] Switched to Polygon Amoy network");
    } catch (switchError) {
      // Chain not added, request to add it
      if (switchError.code === 4902) {
        console.log("[Ethers] Polygon Amoy not found, adding network...");
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13882",
              chainName: "Polygon Amoy",
              rpcUrls: ["https://rpc-amoy.polygon.technology"],
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              blockExplorerUrls: ["https://amoy.polygonscan.com"],
            },
          ],
        });
        console.log("[Ethers] Polygon Amoy network added and switched");
      } else {
        throw switchError;
      }
    }

    // Get provider and signer from user's wallet
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    console.log(`[Ethers] User address: ${userAddress}`);

    // Check balance first
    const balanceCheck = await checkWalletBalance(userAddress);
    if (!balanceCheck.success) {
      throw new Error(`Balance check failed: ${balanceCheck.error}`);
    }

    // Estimate gas
    const gasEstimate = await estimateGasFees();
    if (!gasEstimate.success) {
      throw new Error(`Gas estimation failed: ${gasEstimate.error}`);
    }

    console.log("[Ethers] Balance check passed, gas estimated");

    // Create contract instance with signer
    const contract = new ethers.Contract(
      RUPEEFLOW_CONTRACT_ADDRESS,
      RUPEEFLOW_ABI,
      signer
    );

    // Convert stationAddress to valid Ethereum address format
    // stationAddress is a MongoDB ObjectId, pad to 40 hex characters
    const stationEthAddress = "0x" + stationAddress.toString().padEnd(40, "0");

    // Convert amounts to proper format
    const amountInWei = ethers.parseEther(totalCost.toString());
    const energyInWei = ethers.parseEther(totalKwh.toString());
    const durationInSeconds = Math.floor(duration);

    console.log("[Ethers] Submitting settlement transaction...", {
      evOwner: userAddress,
      station: stationEthAddress,
      energyKwh: totalKwh,
      amountPaid: totalCost,
      duration: durationInSeconds,
    });

    // Submit settlement transaction
    const tx = await contract.settleCharging(
      userAddress,
      stationEthAddress,
      energyInWei,
      amountInWei,
      durationInSeconds,
      {
        gasLimit: ethers.toBigInt("200000"), // Safety margin
      }
    );

    const txHash = tx.hash;
    console.log(`[Ethers] Transaction submitted: ${txHash}`);

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log("[Ethers] Settlement confirmed:", {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    });

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: ethers.formatUnits(receipt.gasUsed, "wei"),
    };
  } catch (error) {
    console.error("[Ethers] Settlement error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get network information
 */
export async function getNetworkInfo() {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const network = await provider.getNetwork();
    const latestBlock = await provider.getBlockNumber();

    console.log("[Ethers] Network info:", {
      name: network.name,
      chainId: network.chainId,
      latestBlock,
    });

    return {
      success: true,
      network: network.name,
      chainId: network.chainId,
      latestBlock,
    };
  } catch (error) {
    console.error("[Ethers] Error getting network info:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Convert user ID to Ethereum address (for backend settlement reference)
 */
export function convertUserIdToAddress(userId) {
  // Pad userId to 40 hex characters (20 bytes)
  const paddedId = userId.toString().padStart(40, "0");
  const address = "0x" + paddedId;

  console.log(`[Ethers] Converted user ID to address:`, {
    userId,
    address,
  });

  return address;
}
