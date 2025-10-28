import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AI Fortune Teller - Career Resilience in the AI Age",
  description: "Discover your career fate in the age of AI. Get free fortunes from real job market data, or pay for premium AI strategies & collectible NFTs on Base.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://ai-fortune-teller.vercel.app"),
  openGraph: {
    title: "AI Fortune Teller",
    description: "Discover your career fate in the age of AI. Get free fortunes or premium AI strategies & NFTs on Base.",
    type: "website",
    url: "https://ai-fortune-teller.vercel.app",
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

