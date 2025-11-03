/**
 * Wagmi Configuration for Base Network
 * Configures wallet connection for Base L2
 */

import { base } from "wagmi/chains";
import { createConfig, http } from "wagmi";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";

// Get RPC URL from environment
const baseRpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.BASE_RPC_URL || "https://mainnet.base.org";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: "AI Fortune Teller",
        url: "https://fortune.beuxbunk.com",
      },
    }),
    coinbaseWallet({
      appName: "AI Fortune Teller",
      appLogoUrl: "https://fortune.beuxbunk.com/fortune-teller-bg.png",
      preference: "all", // Try both WalletLink and SDK
    }),
  ],
  transports: {
    [base.id]: http(baseRpcUrl),
  },
  ssr: true,
  // Reduce WebSocket connection attempts
  multiInjectedProviderDiscovery: false,
});

