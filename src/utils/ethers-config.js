import { ethers } from "ethers";

export const RUPEEFLOW_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_evOwner", type: "address" },
      { internalType: "address", name: "_station", type: "address" },
      { internalType: "uint256", name: "_energyKwh", type: "uint256" },
      { internalType: "uint256", name: "_amountPaid", type: "uint256" },
      { internalType: "uint256", name: "_duration", type: "uint256" },
    ],
    name: "settleCharging",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const getProvider = () => {
  return new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_RPC_URL);
};

export const getContractInstance = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    RUPEEFLOW_ABI,
    signer
  );

  return contract;
};

export const getEVOwnerAddress = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return await signer.getAddress();
};

export const formatEnergyForBlockchain = (kwh) => {
  return BigInt(Math.floor(kwh * 100));
};

export const formatAmountForBlockchain = (amount) => {
  return BigInt(Math.floor(amount * 100));
};
