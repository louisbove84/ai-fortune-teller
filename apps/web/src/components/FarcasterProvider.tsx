"use client";

import { useEffect } from "react";

/**
 * Farcaster Mini App Provider
 * Calls sdk.actions.ready() when the app is loaded to hide the splash screen
 * See: https://miniapps.farcaster.xyz/docs/guides/loading
 */
export default function FarcasterProvider() {
  useEffect(() => {
    // Dynamically import and initialize Farcaster SDK
    const initFarcaster = async () => {
      try {
        const { sdk } = await import("@farcaster/frame-sdk");
        // Call ready to hide splash screen
        await sdk.actions.ready();
        console.log("✅ Farcaster SDK ready called");
      } catch {
        // SDK not available (running in regular browser), silently continue
        console.log("ℹ️ Running outside Farcaster miniapp context");
      }
    };

    initFarcaster();
  }, []);

  // This component doesn't render anything
  return null;
}

