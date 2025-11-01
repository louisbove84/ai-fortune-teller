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
    siteName: "AI Fortune Teller",
    images: [
      {
        url: "https://fortune.beuxbunk.com/loading_image.png",
        width: 1024,
        height: 1024,
        alt: "AI Fortune Teller",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Fortune Teller",
    description: "Peer into your career's future in the age of AI",
    images: ["https://fortune.beuxbunk.com/loading_image.png"],
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
        <FarcasterProvider />
        {children}
      </body>
    </html>
  );
}

