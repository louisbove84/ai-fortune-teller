"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface MintNFTButtonProps {
  recipient: string; // User's wallet address
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
  recipient,
  tokenURI,
  score,
  occupation,
  onSuccess,
  onError,
}: MintNFTButtonProps) {
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!recipient || !recipient.startsWith("0x")) {
      setError("Invalid wallet address");
      onError?.("Invalid wallet address");
      return;
    }

    setMinting(true);
    setError(null);

    try {
      const response = await fetch("/api/nft/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient,
          tokenURI,
          score,
          occupation,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to mint NFT");
      }

      setMinted(true);
      onSuccess?.(data.tokenId, data.txHash);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mint NFT";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setMinting(false);
    }
  };

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
        disabled={minting || !recipient}
        className={`px-6 py-3 font-semibold rounded transition-all ${
          minting || !recipient
            ? "bg-gray-500/20 border border-gray-400 text-gray-400 cursor-not-allowed"
            : "bg-purple-500/20 hover:bg-purple-400/30 border border-purple-400 text-purple-300 hover:scale-105"
        }`}
        whileHover={!minting && recipient ? { scale: 1.05 } : {}}
        whileTap={!minting && recipient ? { scale: 0.95 } : {}}
      >
        {minting ? "Minting NFT..." : "Mint Your Prophecy NFT"}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm text-center"
        >
          {error}
        </motion.p>
      )}

      {!recipient && (
        <p className="text-yellow-400 text-sm text-center">
          Connect your wallet to mint an NFT
        </p>
      )}
    </div>
  );
}

