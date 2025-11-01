import type { Metadata } from "next";
import "./globals.css";
import FarcasterProvider from "@/components/FarcasterProvider";

export const metadata: Metadata = {
  title: "AI Fortune Teller - Career Resilience in the AI Age",
  description: "Discover your career fate in the age of AI. Get AI-powered career insights based on real job market data.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://fortune.beuxbunk.com"),
  openGraph: {
    title: "AI Fortune Teller",
    description: "Discover your career fate in the age of AI. Get AI-powered career insights.",
    type: "website",
    url: "https://fortune.beuxbunk.com",
    images: [
      {
        url: "/fortune-teller-bg.png",
        width: 1200,
        height: 630,
        alt: "AI Fortune Teller",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Fortune Teller",
    description: "Peer into your career's future in the age of AI",
    images: ["/fortune-teller-bg.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Farcaster Mini App embed metadata
  const miniappEmbed = {
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

  // Also include fc:frame for backward compatibility
  const frameEmbed = {
    ...miniappEmbed,
    button: {
      ...miniappEmbed.button,
      action: {
        ...miniappEmbed.button.action,
        type: "launch_frame",
      },
    },
  };

  const embedContent = JSON.stringify(miniappEmbed);
  const frameContent = JSON.stringify(frameEmbed);

  return (
    <html lang="en">
      <head
        dangerouslySetInnerHTML={{
          __html: `
            <meta name="fc:miniapp" content='${embedContent.replace(/'/g, "&#39;")}' />
            <meta name="fc:frame" content='${frameContent.replace(/'/g, "&#39;")}' />
          `,
        }}
      />
      <body className="antialiased">
        <FarcasterProvider />
        {children}
      </body>
    </html>
  );
}

