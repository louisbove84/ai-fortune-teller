"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";
import { config } from "@/lib/wagmi";
import { useState, type ReactNode } from "react";
import "@coinbase/onchainkit/styles.css";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

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

