"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from "wagmi";
import { PROPHECY_TOKEN_ABI } from "@/lib/contracts";
import { base } from "wagmi/chains";
import { formatEther } from "viem";

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
  const { address, isConnected, chainId } = useAccount();
  const chainIdFromHook = useChainId();
  const { switchChain } = useSwitchChain();
  const [minted, setMinted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsNetworkSwitch, setNeedsNetworkSwitch] = useState(false);

  const contractAddress = (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
    "0xF473d3813A804809dC924936383c7F638b2B696f") as `0x${string}`;

  // Check if user is on Base network (chainId 8453)
  const isOnBase = chainId === base.id || chainIdFromHook === base.id;

  // Flat mint price: 0.001 ETH (1000000000000000 wei)
  const MINT_PRICE = BigInt("1000000000000000"); // 0.001 ETH
  const MINT_PRICE_DISPLAY = "0.001";

  // Prompt user to switch to Base if not already on it
  useEffect(() => {
    if (isConnected && !isOnBase) {
      setNeedsNetworkSwitch(true);
      setError("Please switch to Base network to mint NFTs");
    } else {
      setNeedsNetworkSwitch(false);
      if (error?.includes("switch to Base")) {
        setError(null);
      }
    }
  }, [isConnected, isOnBase, chainId, chainIdFromHook]);

  const {
    writeContract,
    data: hash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    timeout: 120_000, // 2 minutes timeout
    confirmations: 1, // Only need 1 confirmation on Base L2
  });

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: base.id });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to switch network";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      onError?.("Wallet not connected");
      return;
    }

    if (!isOnBase) {
      setError("Please switch to Base network first");
      await handleSwitchNetwork();
      return;
    }

    if (!contractAddress) {
      setError("Contract address not configured");
      onError?.("Contract address not configured");
      return;
    }

    setError(null);

    try {
      // Ensure we're on Base before writing
      if (!isOnBase) {
        throw new Error("Please switch to Base network first");
      }

      console.log("📝 Minting NFT with:", {
        tokenURI,
        score,
        occupation,
        value: formatEther(MINT_PRICE),
      });

      writeContract({
        address: contractAddress,
        abi: PROPHECY_TOKEN_ABI,
        functionName: "mintProphecy",
        args: [tokenURI, BigInt(score), occupation],
        value: MINT_PRICE,
        chain: base, // Explicitly specify Base chain
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to mint NFT";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash && !minted) {
      setMinted(true);
      // Try to extract token ID from transaction receipt
      // For now, just pass the hash
      onSuccess?.(0, hash);
    }
  }, [isSuccess, hash, minted, onSuccess]);

  // Handle receipt errors (timeout, etc.)
  useEffect(() => {
    if (isReceiptError && receiptError && hash) {
      const errorMessage = receiptError.message || "Transaction confirmation timeout";
      setError(`${errorMessage}. Transaction may still be pending. Check BaseScan for status.`);
      onError?.(errorMessage);
    }
  }, [isReceiptError, receiptError, hash, onError]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      const errorMessage = writeError.message || "Transaction failed";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [writeError, onError]);

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
      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-yellow-400 text-sm text-center"
        >
          Connect your wallet to mint an NFT
        </motion.div>
      ) : needsNetworkSwitch || !isOnBase ? (
        <motion.button
          onClick={handleSwitchNetwork}
          className="px-6 py-3 bg-yellow-500/20 hover:bg-yellow-400/30 border border-yellow-400 text-yellow-300 font-semibold rounded transition-all hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Switch to Base Network to Mint
        </motion.button>
      ) : (
        <>
          <motion.button
            onClick={handleMint}
            disabled={minting || !isOnBase}
            className={`px-6 py-3 font-semibold rounded transition-all ${
              minting || !isOnBase
                ? "bg-gray-500/20 border border-gray-400 text-gray-400 cursor-not-allowed"
                : "bg-purple-500/20 hover:bg-purple-400/30 border border-purple-400 text-purple-300 hover:scale-105"
            }`}
            whileHover={!minting && isOnBase ? { scale: 1.05 } : {}}
            whileTap={!minting && isOnBase ? { scale: 0.95 } : {}}
          >
            {minting
              ? isConfirming
                ? "Confirming Transaction..."
                : isWriting
                ? "Please Approve in Wallet..."
                : "Minting NFT..."
              : `Mint Your Prophecy NFT (${MINT_PRICE_DISPLAY} ETH)`}
          </motion.button>
          <p className="text-gray-400 text-xs text-center">
            10% fee goes to platform
          </p>
        </>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm text-center max-w-md"
        >
          {error}
        </motion.p>
      )}

      {hash && (
        <div className="flex flex-col items-center gap-1">
          <a
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 text-xs hover:underline"
          >
            View Transaction on BaseScan
          </a>
          {isConfirming && (
            <p className="text-yellow-400 text-xs text-center">
              Waiting for confirmation... (Base L2 typically confirms in ~2 seconds)
            </p>
          )}
          {!isConfirming && hash && (
            <p className="text-green-400 text-xs text-center">
              Transaction submitted! Click link above to view on BaseScan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

