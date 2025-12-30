# Deploy RupeeFlow Contract to Polygon Amoy

## Quick Method: Use Remix IDE (Recommended)

### Step 1: Open Remix

Go to: https://remix.ethereum.org

### Step 2: Create New File

- Click "Create New File" in left panel
- Name it: `RupeeFlow.sol`

### Step 3: Copy Contract Code

Copy the entire content from `contracts/RupeeFlow.sol` and paste it into Remix.

### Step 4: Compile Contract

1. Click **Solidity Compiler** (left sidebar, looks like document icon)
2. Set compiler version: `0.8.19`
3. Click **Compile RupeeFlow.sol**
4. Wait for green checkmark

### Step 5: Deploy Contract

1. Click **Deploy & Run Transactions** (left sidebar, looks like rocket icon)
2. Set environment to: **Injected Provider - MetaMask**
3. **IMPORTANT: Switch MetaMask to Polygon Amoy first!**
   - Open MetaMask
   - Click network dropdown
   - Add Polygon Amoy if not present:
     - Chain ID: 80002
     - RPC URL: https://rpc-amoy.polygon.technology
     - Currency: MATIC
   - Switch to Polygon Amoy
4. Back in Remix, click **Deploy** button
5. Confirm transaction in MetaMask popup

### Step 6: Copy Deployed Address

After deployment, the contract address appears in "Deployed Contracts" section.
Copy the address (starts with 0x)

### Step 7: Update Environment

1. Open `.env.local` in your project
2. Find or add: `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...`
3. Paste the deployed address
4. Save file

Example:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
```

### Step 8: Restart Development Server

```bash
npm run dev
```

### Step 9: Test Settlement

1. Open app in browser
2. Complete a charging session
3. Click "Complete & Settle"
4. MetaMask will show transaction with new contract address
5. Confirm and wait for success

---

## Current Issue

Your app is currently set to deploy to:

```
0x8ba1f109551bD432803012645Ac136ddd64DBA72
```

This address doesn't have the `settleCharging` function, causing the transaction to fail with "Internal JSON-RPC error".

**After deploying via Remix, update `.env.local` with the new contract address above.**

---

## Get Test MATIC

If you need test MATIC tokens:
https://faucet.polygon.technology/

1. Connect wallet to faucet
2. Select "Polygon Amoy"
3. Claim 0.5 MATIC
4. Wait a few seconds for funds

---

## Verify Deployment

After updating the contract address:

1. Go to https://amoy.polygonscan.com
2. Search for your contract address
3. Click "Contract" tab to verify code is there
4. See "settleCharging" function in contract interface
