"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { PROPHECY_TOKEN_ABI } from "@/lib/contracts";
import { decodeEventLog } from "viem";

interface MintNFTButtonProps {
  tokenURI: string; // IPFS URI with NFT metadata JSON
  score: number; // Resilience score (0-100)
  occupation: string; // User's occupation
  onSuccess?: (tokenId: number, txHash: string) => void;
  onError?: (error: string) => void;
}

/**
 * MintNFTButton Component
 * 
 * Allows users to mint their ProphecyToken NFT after receiving their fortune.
 * Requires the user's wallet address (can be obtained via wallet connection).
 * 
 * Usage:
 * <MintNFTButton
 *   recipient="0x..."
 *   tokenURI="ipfs://..."
 *   score={85}
 *   occupation="Software Engineer"
 *   onSuccess={(tokenId, txHash) => console.log("Minted!", tokenId)}
 * />
 */
export default function MintNFTButton({
  tokenURI,
  score,
  occupation,
  onSuccess,
  onError,
}: MintNFTButtonProps) {
  const { address, isConnected } = useAccount();
  const [minted, setMinted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
    "0xE93dC0A97e1f41bC5Bca56EFaFF7eA3Ced918bC2") as `0x${string}`;

  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      onError?.("Wallet not connected");
      return;
    }

    if (!contractAddress) {
      setError("Contract address not configured");
      onError?.("Contract address not configured");
      return;
    }

    setError(null);

    try {
      writeContract({
        address: contractAddress,
        abi: PROPHECY_TOKEN_ABI,
        functionName: "mintProphecy",
        args: [tokenURI, BigInt(score), occupation],
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mint NFT";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Handle transaction success
  if (isSuccess && hash && !minted) {
    setMinted(true);
    // Try to extract token ID from transaction receipt
    // For now, just pass the hash
    onSuccess?.(0, hash);
  }

  // Handle errors
  if (writeError) {
    const errorMessage = writeError.message || "Transaction failed";
    if (error !== errorMessage) {
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }

  const minting = isWriting || isConfirming;

  if (minted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-6 py-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-semibold rounded transition-all"
      >
        ✅ NFT Minted Successfully!
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={handleMint}
        disabled={minting || !isConnected}
        className={`px-6 py-3 font-semibold rounded transition-all ${
          minting || !isConnected
            ? "bg-gray-500/20 border border-gray-400 text-gray-400 cursor-not-allowed"
            : "bg-purple-500/20 hover:bg-purple-400/30 border border-purple-400 text-purple-300 hover:scale-105"
        }`}
        whileHover={!minting && isConnected ? { scale: 1.05 } : {}}
        whileTap={!minting && isConnected ? { scale: 0.95 } : {}}
      >
        {minting
          ? isConfirming
            ? "Confirming..."
            : "Minting NFT..."
          : "Mint Your Prophecy NFT"}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm text-center max-w-md"
        >
          {error}
        </motion.p>
      )}

      {!isConnected && (
        <p className="text-yellow-400 text-sm text-center">
          Connect your wallet to mint an NFT
        </p>
      )}

      {hash && (
        <a
          href={`https://basescan.org/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 text-xs hover:underline"
        >
          View on BaseScan
        </a>
      )}
    </div>
  );
}

