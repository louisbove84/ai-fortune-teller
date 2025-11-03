"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { motion } from "framer-motion";
import { useEffect } from "react";

/**
 * Wallet Connect Component
 * Button to connect/disconnect wallet
 */
export default function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const chainIdFromHook = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const isOnBase = chainId === base.id || chainIdFromHook === base.id;

  // Auto-switch to Base when wallet connects
  useEffect(() => {
    if (isConnected && !isOnBase && switchChain) {
      console.log("🔄 Auto-switching to Base network...");
      switchChain({ chainId: base.id }).catch((err) => {
        console.warn("Failed to auto-switch to Base:", err);
      });
    }
  }, [isConnected, isOnBase, switchChain]);

  if (isConnected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-end gap-1.5"
      >
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 border rounded text-xs ${
            isOnBase 
              ? "bg-green-500/20 border-green-400 text-green-300" 
              : "bg-yellow-500/20 border-yellow-400 text-yellow-300"
          }`}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          {!isOnBase && (
            <button
              onClick={() => switchChain({ chainId: base.id })}
              className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-400/30 border border-yellow-400 text-yellow-300 rounded text-xs transition-all"
            >
              Switch to Base
            </button>
          )}
          <button
            onClick={() => disconnect()}
            className="px-3 py-1.5 bg-red-500/20 hover:bg-red-400/30 border border-red-400 text-red-300 rounded text-xs transition-all"
          >
            Disconnect
          </button>
        </div>
        {!isOnBase && (
          <p className="text-yellow-400 text-xs">Not on Base network</p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {connectors.map((connector) => (
        <motion.button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-400/30 border border-purple-400 text-purple-300 text-sm rounded transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isPending ? 1 : 1.05 }}
          whileTap={{ scale: isPending ? 1 : 0.95 }}
        >
          {isPending
            ? "Connecting..."
            : `Connect ${connector.name === "Injected" ? "Wallet" : connector.name}`}
        </motion.button>
      ))}
    </div>
  );
}

