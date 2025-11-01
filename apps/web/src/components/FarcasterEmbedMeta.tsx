"use client";

import { useEffect } from "react";

/**
 * Farcaster Mini App Embed Meta Tag
 * Adds fc:miniapp meta tag for embed preview
 */
export default function FarcasterEmbedMeta() {
  const embedData = JSON.stringify({
    version: "1",
    imageUrl: "https://fortune.beuxbunk.com/fortune-teller-bg.png",
    button: {
      title: "🔮 Get Your AI Career Fortune",
      action: {
        type: "launch_miniapp",
        url: "https://fortune.beuxbunk.com",
        name: "AI Fortune Teller",
        splashImageUrl: "https://fortune.beuxbunk.com/fortune-teller-bg.png",
        splashBackgroundColor: "#0a0e1a",
      },
    },
  });

  useEffect(() => {
    // Inject meta tag immediately on mount
    if (!document.querySelector('meta[name="fc:miniapp"]')) {
      const metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "fc:miniapp");
      metaTag.setAttribute("content", embedData);
      document.head.insertBefore(metaTag, document.head.firstChild);
    }
  }, [embedData]);

  return null;
}

