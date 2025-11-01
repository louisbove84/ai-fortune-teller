/**
 * Farcaster Mini App Embed Meta Tag
 * Adds fc:miniapp and fc:frame meta tags for embed preview
 * According to: https://miniapps.farcaster.xyz/docs/guides/sharing
 * 
 * Minimum requirements:
 * - meta name="fc:miniapp" content="{stringified JSON}"
 * - meta name="fc:frame" content="{stringified JSON}" (for backward compatibility)
 */
export default function FarcasterEmbedMeta() {
  // Embed data matching the exact format from docs
  const embedData = {
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
  };

  // Backward compatible frame embed
  const frameEmbed = {
    version: "1",
    imageUrl: "https://fortune.beuxbunk.com/fortune-teller-bg.png",
    button: {
      title: "🔮 Get Your AI Career Fortune",
      action: {
        type: "launch_frame",
        url: "https://fortune.beuxbunk.com",
        name: "AI Fortune Teller",
        splashImageUrl: "https://fortune.beuxbunk.com/fortune-teller-bg.png",
        splashBackgroundColor: "#0a0e1a",
      },
    },
  };

  const embedContent = JSON.stringify(embedData);
  const frameContent = JSON.stringify(frameEmbed);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            if (typeof document !== 'undefined' && document.head) {
              if (!document.querySelector('meta[name="fc:miniapp"]')) {
                var metaMiniapp = document.createElement('meta');
                metaMiniapp.name = 'fc:miniapp';
                metaMiniapp.content = ${JSON.stringify(embedContent)};
                document.head.insertBefore(metaMiniapp, document.head.firstChild);
              }
              if (!document.querySelector('meta[name="fc:frame"]')) {
                var metaFrame = document.createElement('meta');
                metaFrame.name = 'fc:frame';
                metaFrame.content = ${JSON.stringify(frameContent)};
                document.head.insertBefore(metaFrame, document.head.firstChild);
              }
            }
          })();
        `,
      }}
    />
  );
}

