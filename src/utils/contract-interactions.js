"use client";

import { ethers } from "ethers";

const RUPEEFLOW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const POLYGON_RPC_URL =
  process.env.NEXT_PUBLIC_POLYGON_RPC_URL ||
  "https://rpc-amoy.polygon.technology";

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
      { indexed: false, name: "energyKwh", type: "uint256" },
      { indexed: false, name: "amountPaid", type: "uint256" },
      { indexed: false, name: "duration", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "ChargingSettled",
    type: "event",
  },
];

export async function checkWalletBalance(userAddress) {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const balance = await provider.getBalance(userAddress);
    const balanceInMatic = ethers.formatEther(balance);

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

export async function estimateGasFees() {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);

    const feeData = await provider.getFeeData();

    if (!feeData.gasPrice && !feeData.maxFeePerGas) {
      throw new Error("Unable to fetch gas price from network");
    }

    const gasPrice = feeData.maxFeePerGas || feeData.gasPrice;
    const gasPriceInGwei = ethers.formatUnits(gasPrice, "gwei");

    const estimatedGasUnits = ethers.toBigInt("150000");
    const estimatedGasWei = gasPrice * estimatedGasUnits;
    const estimatedGasInMatic = ethers.formatEther(estimatedGasWei);

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

export async function checkTransactionStatus(txHash) {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        success: true,
        status: "pending",
        message: "Transaction is still pending",
      };
    }

    const status = receipt.status === 1 ? "confirmed" : "failed";

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

export async function listenToSettlementEvents(callback) {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const contract = new ethers.Contract(
      RUPEEFLOW_CONTRACT_ADDRESS,
      RUPEEFLOW_ABI,
      provider
    );

    contract.on("ChargingSettled", (evOwner, station, amount, timestamp) => {
      const amountInMatic = ethers.formatEther(amount);

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

export async function settleChargingDirect(
  totalCost,
  totalKwh,
  duration,
  stationAddress,
  operatorWalletAddress
) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask or other Web3 wallet not found");
    }

    if (!operatorWalletAddress) {
      throw new Error("Operator wallet address is required");
    }

    const trimmedWallet = (operatorWalletAddress || "").trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedWallet)) {
      throw new Error(
        `Invalid operator wallet address format: ${trimmedWallet}`
      );
    }

    const cleanWalletAddress = trimmedWallet;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13882" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
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
      } else {
        throw switchError;
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    const balanceCheck = await checkWalletBalance(userAddress);
    if (!balanceCheck.success) {
      throw new Error(`Balance check failed: ${balanceCheck.error}`);
    }

    const gasEstimate = await estimateGasFees();
    if (!gasEstimate.success) {
      throw new Error(`Gas estimation failed: ${gasEstimate.error}`);
    }

    const contract = new ethers.Contract(
      RUPEEFLOW_CONTRACT_ADDRESS,
      RUPEEFLOW_ABI,
      signer
    );

    const stationEthAddress = cleanWalletAddress;

    if (totalCost <= 0 || totalKwh <= 0 || duration <= 0) {
      throw new Error(
        `Invalid settlement values: cost=${totalCost}, kwh=${totalKwh}, duration=${duration}`
      );
    }

    const amountInWei = BigInt(Math.floor(totalCost * 100));
    const energyInWei = BigInt(Math.floor(totalKwh * 100));
    const durationInSeconds = BigInt(Math.floor(duration));

    const tx = await contract.settleCharging(
      userAddress,
      stationEthAddress,
      energyInWei,
      amountInWei,
      durationInSeconds,
      {
        gasLimit: ethers.toBigInt("500000"),
      }
    );

    const txHash = tx.hash;
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: ethers.formatUnits(receipt.gasUsed, "wei"),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function markSessionAsSettled(sessionId, transactionHash) {
  try {
    const response = await fetch("/api/charging/mark-settled", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        transactionHash,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark session as settled");
    }

    const data = await response.json();
    return {
      success: true,
      message: "Session marked as settled",
      session: data.session,
    };
  } catch (error) {
    console.error("[Ethers] Error marking session as settled:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getNetworkInfo() {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const network = await provider.getNetwork();
    const latestBlock = await provider.getBlockNumber();

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

export function convertUserIdToAddress(userId) {
  const paddedId = userId.toString().padStart(40, "0");
  const address = "0x" + paddedId;

  return address;
}
