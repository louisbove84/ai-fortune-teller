"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Context for Farcaster Mini App detection
 */
interface FarcasterContextType {
  isInMiniApp: boolean | null; // null = still checking, true/false = result
  isLoading: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isInMiniApp: null,
  isLoading: true,
});

/**
 * Hook to detect if app is running in Farcaster Mini App
 * @returns {boolean | null} true if in miniapp, false if in browser, null if still checking
 */
export function useFarcaster() {
  return useContext(FarcasterContext);
}

/**
 * Simple check if we're in an iframe (heuristic for miniapp detection)
 */
function isInIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true; // If we can't access top, we're likely in an iframe
  }
}

/**
 * Provider component that detects Farcaster Mini App context
 */
export function FarcasterContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectContext = async () => {
      // Quick check: if we're not in an iframe, we're definitely not in a miniapp
      if (!isInIframe()) {
        setIsInMiniApp(false);
        setIsLoading(false);
        return;
      }

      try {
        // Try to import the Farcaster SDK
        const frameSdk = await import("@farcaster/frame-sdk");
        // Type-safe access to SDK
        const sdk = (frameSdk as { sdk?: unknown }).sdk || 
                   (frameSdk as { default?: { sdk?: unknown } }).default?.sdk || 
                   (frameSdk as { default?: unknown }).default;

        // Type guard: check if SDK has isInMiniApp method
        const sdkWithDetection = sdk as { isInMiniApp?: () => Promise<boolean>; actions?: { ready?: () => Promise<void> } };
        
        if (sdkWithDetection && typeof sdkWithDetection.isInMiniApp === "function") {
          // Use isInMiniApp if available (preferred method)
          const isMiniApp = await sdkWithDetection.isInMiniApp();
          setIsInMiniApp(isMiniApp);
          setIsLoading(false);

          // If in miniapp, call ready()
          if (isMiniApp && sdkWithDetection.actions?.ready) {
            await sdkWithDetection.actions.ready();
            console.log("✅ Farcaster SDK ready called");
          }
        } else if (sdkWithDetection && sdkWithDetection.actions?.ready) {
          // Fallback: if SDK exists and has ready(), try to call it
          // If it succeeds, we're in miniapp
          try {
            await sdkWithDetection.actions.ready();
            setIsInMiniApp(true);
            console.log("✅ Farcaster SDK ready called - detected miniapp context");
          } catch {
            setIsInMiniApp(false);
            console.log("ℹ️ SDK available but not in miniapp context");
          }
          setIsLoading(false);
        } else {
          // SDK not available or incomplete - check iframe as fallback
          setIsInMiniApp(isInIframe());
          setIsLoading(false);
        }
      } catch {
        // SDK not available - use iframe detection as fallback
        setIsInMiniApp(isInIframe());
        setIsLoading(false);
        console.log("ℹ️ Running outside Farcaster miniapp context");
      }
    };

    detectContext();
  }, []);

  return (
    <FarcasterContext.Provider value={{ isInMiniApp, isLoading }}>
      {children}
    </FarcasterContext.Provider>
  );
}

