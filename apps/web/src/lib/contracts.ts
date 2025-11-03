/**
 * ProphecyToken Contract Integration
 * Utilities for interacting with the deployed ProphecyToken contract on Base
 */

import { createPublicClient, createWalletClient, http, decodeEventLog } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

// Contract ABI - Only the functions we need
export const PROPHECY_TOKEN_ABI = [
  {
    type: "function",
    name: "mintProphecy",
    inputs: [
      { name: "tokenURI", type: "string" },
      { name: "score", type: "uint256" },
      { name: "occupation", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "mintPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setMintPrice",
    inputs: [{ name: "_mintPrice", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "mintProphecyFor",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" },
      { name: "score", type: "uint256" },
      { name: "occupation", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateProphecy",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "newTokenURI", type: "string" },
      { name: "newScore", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getProphecy",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        components: [
          { name: "resilienceScore", type: "uint256" },
          { name: "occupation", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "updateCount", type: "uint256" },
          { name: "recipient", type: "address" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentTokenId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "ProphecyMinted",
    inputs: [
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "resilienceScore", type: "uint256", indexed: false },
      { name: "occupation", type: "string", indexed: false },
      { name: "tokenURI", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ProphecyUpdated",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "newScore", type: "uint256", indexed: false },
      { name: "newTokenURI", type: "string", indexed: false },
    ],
  },
] as const;

// Contract address from environment
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "") as `0x${string}`;

// Initialize public client for read operations
export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || "https://mainnet.base.org"),
});

/**
 * Get prophecy data for a token ID
 */
export async function getProphecyData(tokenId: bigint) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_NFT_CONTRACT_ADDRESS not set");
  }

  try {
    const data = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: PROPHECY_TOKEN_ABI,
      functionName: "getProphecy",
      args: [tokenId],
    }) as {
      resilienceScore: bigint;
      occupation: string;
      timestamp: bigint;
      updateCount: bigint;
      recipient: `0x${string}`;
    };

    return {
      resilienceScore: Number(data.resilienceScore),
      occupation: data.occupation,
      timestamp: Number(data.timestamp),
      updateCount: Number(data.updateCount),
      recipient: data.recipient,
    };
  } catch (error) {
    console.error("Error reading prophecy:", error);
    throw error;
  }
}

/**
 * Mint a prophecy NFT for a specific address (server-side only, owner function)
 * Requires PRIVATE_KEY environment variable with contract owner's key
 * NOTE: This uses mintProphecyFor which is owner-only
 * For regular users, minting is done client-side via MintNFTButton component
 */
export async function mintProphecyNFT(
  recipient: `0x${string}`,
  tokenURI: string,
  score: number,
  occupation: string
) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_NFT_CONTRACT_ADDRESS not set");
  }

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set - required for owner minting");
  }

  // Validate private key format
  if (!privateKey.startsWith("0x")) {
    throw new Error("PRIVATE_KEY must start with 0x");
  }

  if (privateKey.length !== 66) {
    throw new Error("PRIVATE_KEY must be 66 characters (0x + 64 hex chars)");
  }

  const baseRpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL;
  if (!baseRpcUrl) {
    throw new Error("BASE_RPC_URL or NEXT_PUBLIC_BASE_RPC_URL not set");
  }

  // Initialize wallet client with owner account
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(baseRpcUrl),
  });

  try {
    // Mint the NFT using owner-only function
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: PROPHECY_TOKEN_ABI,
      functionName: "mintProphecyFor",
      args: [recipient, tokenURI, BigInt(score), occupation],
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Extract token ID from event logs
    let tokenId: bigint | null = null;
    if (receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: PROPHECY_TOKEN_ABI,
            data: log.data,
            topics: log.topics,
          });
          if (
            decoded.eventName === "ProphecyMinted" &&
            decoded.args &&
            "tokenId" in decoded.args &&
            decoded.args.tokenId
          ) {
            tokenId = decoded.args.tokenId as bigint;
            break;
          }
        } catch {
          // Skip logs that don't match
        }
      }
    }

    return {
      txHash: hash,
      receipt,
      tokenId: tokenId ? Number(tokenId) : null,
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
}

/**
 * Update an existing prophecy NFT
 */
export async function updateProphecyNFT(
  tokenId: bigint,
  newTokenURI: string,
  newScore: number
) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_NFT_CONTRACT_ADDRESS not set");
  }

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set - required for updating");
  }

  if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
    throw new Error("PRIVATE_KEY format invalid");
  }

  const baseRpcUrl = process.env.BASE_RPC_URL || process.env.NEXT_PUBLIC_BASE_RPC_URL;
  if (!baseRpcUrl) {
    throw new Error("BASE_RPC_URL or NEXT_PUBLIC_BASE_RPC_URL not set");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(baseRpcUrl),
  });

  try {
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: PROPHECY_TOKEN_ABI,
      functionName: "updateProphecy",
      args: [tokenId, newTokenURI, BigInt(newScore)],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return { txHash: hash, receipt };
  } catch (error) {
    console.error("Error updating prophecy:", error);
    throw error;
  }
}

