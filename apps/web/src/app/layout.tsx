import type { Metadata } from "next";
import "./globals.css";
import { SimpleWalletProvider } from "@/components/SimpleWalletProvider";

export const metadata: Metadata = {
  title: "AI Fortune Teller - Career Resilience in the AI Age",
  description: "Discover your career fate in the age of AI. Connect your wallet and get AI-powered career insights based on real job market data.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://fortune.beuxbunk.com"),
  openGraph: {
    title: "AI Fortune Teller",
    description: "Discover your career fate in the age of AI. Connect your wallet and get AI-powered career insights.",
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
  return (
    <html lang="en">
      <body className="antialiased">
        <SimpleWalletProvider>
          {children}
        </SimpleWalletProvider>
      </body>
    </html>
  );
}

