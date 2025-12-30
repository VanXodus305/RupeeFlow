import { auth } from "@/auth";
import { Contract, JsonRpcProvider } from "ethers";

const POLYGON_RPC =
  process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology";
const CONTRACT_ADDRESS =
  process.env.RUPEEFLOW_CONTRACT_ADDRESS ||
  "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// RupeeFlow contract ABI (minimal settlement function)
const CONTRACT_ABI = [
  {
    inputs: [
      { name: "_evOwner", type: "address" },
      { name: "_station", type: "address" },
      { name: "_energyKwh", type: "uint256" },
      { name: "_amountPaid", type: "uint256" },
      { name: "_duration", type: "uint256" },
    ],
    name: "settleCharging",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export async function POST(req) {
  try {
    const session = await auth();

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, totalKwh, totalCost, duration } = await req.json();

    if (!sessionId || !totalKwh || !totalCost || !duration) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For demo/testing, just return a fake transaction hash if no private key is set
    if (!PRIVATE_KEY) {
      console.log(
        "[Settle] Demo mode - no PRIVATE_KEY set. Returning fake tx hash."
      );
      return Response.json({
        transactionHash: "0xdemo_" + sessionId.substring(0, 40),
        message:
          "Demo mode - set PRIVATE_KEY and contract address to enable real blockchain settlements",
      });
    }

    // Submit real transaction to blockchain
    const provider = new JsonRpcProvider(POLYGON_RPC);
    const wallet = provider.getSigner(PRIVATE_KEY);
    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    // Convert values to appropriate format for blockchain
    const energyKwhWei = BigInt(Math.floor(totalKwh * 1000)); // Store with 3 decimal places
    const amountPaidWei = BigInt(Math.floor(totalCost * 100)); // Store with 2 decimal places
    const durationSeconds = BigInt(Math.floor(duration));

    // Call settlement function
    const tx = await contract.settleCharging(
      session.user.id, // EV owner address (using user ID as placeholder)
      "0x0000000000000000000000000000000000000000", // Station address (placeholder)
      energyKwhWei,
      amountPaidWei,
      durationSeconds
    );

    // Wait for confirmation
    const receipt = await tx.wait();

    console.log(`[Settle] Transaction confirmed: ${receipt.hash}`);

    return Response.json({
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      message: `Settlement recorded on Polygon Amoy. TX: ${receipt.hash}`,
    });
  } catch (error) {
    console.error("[Settle] Error:", error);
    return Response.json(
      { error: error.message || "Settlement failed" },
      { status: 500 }
    );
  }
}
