"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { motion } from "framer-motion";

/**
 * Wallet Connect Component
 * Button to connect/disconnect wallet
 */
export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <div className="px-4 py-2 bg-green-500/20 border border-green-400 text-green-300 rounded text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-400/30 border border-red-400 text-red-300 rounded text-sm transition-all"
        >
          Disconnect
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {connectors.map((connector) => (
        <motion.button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="px-6 py-3 bg-purple-500/20 hover:bg-purple-400/30 border border-purple-400 text-purple-300 font-semibold rounded transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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

