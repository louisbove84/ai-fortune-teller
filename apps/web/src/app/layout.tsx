import type { Metadata } from "next";
import "./globals.css";
import FarcasterProvider from "@/components/FarcasterProvider";
import FarcasterEmbedMeta from "@/components/FarcasterEmbedMeta";

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
  other: {
    "fc:miniapp": JSON.stringify({
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
    }),
    "fc:frame": JSON.stringify({
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
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <FarcasterEmbedMeta />
      </head>
      <body className="antialiased">
        <FarcasterProvider />
        {children}
      </body>
    </html>
  );
}

