/**
 * Deploy RupeeFlow Contract to Polygon Amoy
 * Run with: node deploy.js
 */

const ethers = require("ethers");
const fs = require("fs");
const path = require("path");

// Read contract from .sol file
const contractPath = path.join(__dirname, "contracts", "RupeeFlow.sol");
const contractSource = fs.readFileSync(contractPath, "utf8");

// RupeeFlow contract bytecode (compiled)
// This is a simplified deployment - you'll need to compile the contract first
// For now, using the Solidity code

const POLYGON_RPC_URL = "https://rpc-amoy.polygon.technology";
const CHAIN_ID = 80002;

async function deploy() {
  try {
    console.log("🚀 Deploying RupeeFlow Contract to Polygon Amoy...");

    // Check if you have a private key in environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error("❌ Error: Set PRIVATE_KEY environment variable");
      console.log("   Or manually deploy using Remix or Hardhat");
      console.log("\n📋 Deployment Steps:");
      console.log("1. Go to https://remix.ethereum.org");
      console.log("2. Create new file and paste RupeeFlow.sol code");
      console.log("3. Compile with Solidity 0.8.19");
      console.log("4. Deploy to Polygon Amoy (ChainID: 80002)");
      console.log("5. Copy deployed contract address");
      console.log("6. Set NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");
      return;
    }

    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`📍 Deploying from: ${wallet.address}`);
    console.log(`🌐 Network: Polygon Amoy (ChainID: ${CHAIN_ID})`);

    // Get account balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInMatic = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceInMatic} MATIC`);

    if (parseFloat(balanceInMatic) < 0.1) {
      console.error(
        "❌ Insufficient MATIC balance. Need at least 0.1 MATIC for deployment."
      );
      console.log("   Get test MATIC from: https://faucet.polygon.technology/");
      return;
    }

    console.log("\n📝 Note: Automated deployment requires compiled contract.");
    console.log("   Falling back to manual deployment steps...\n");
  } catch (error) {
    console.error("❌ Deployment error:", error.message);
  }
}

deploy().catch(console.error);
