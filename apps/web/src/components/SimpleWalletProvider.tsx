'use client';

import { useState, useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';
import { OnchainKitProvider } from '@coinbase/onchainkit';

// Create a query client
const queryClient = new QueryClient();

// Simple wallet config without WalletConnect
let config: any = null;

if (typeof window !== 'undefined') {
  try {
    config = createConfig({
      chains: [base, baseSepolia],
      connectors: [
        coinbaseWallet({
          appName: 'AI Fortune Teller',
          appLogoUrl: 'https://fortune.beuxbunk.com/fortune-teller-bg.png',
        }),
        injected(), // For MetaMask and other injected wallets
      ],
      transports: {
        [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org', {
          retryCount: 3,
          retryDelay: 1000,
        }),
        [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org', {
          retryCount: 3,
          retryDelay: 1000,
        }),
      },
      ssr: true,
    });
  } catch (error) {
    console.warn('Failed to create wallet config:', error);
  }
}

interface SimpleWalletProviderProps {
  children: React.ReactNode;
}

export function SimpleWalletProvider({ children }: SimpleWalletProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !config) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              name: "AI Fortune Teller",
              logo: "/fortune-teller-bg.png",
              mode: "dark",
              theme: "default",
            },
            wallet: {
              display: "modal",
              termsUrl: "https://fortune.beuxbunk.com",
              privacyUrl: "https://fortune.beuxbunk.com",
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

