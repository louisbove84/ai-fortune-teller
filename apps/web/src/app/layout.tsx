import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AI Fortune Teller - Peer into Your Career Fate",
  description: "Quiz your job's future against AI disruption. Unlock strategies & personalized NFTs.",
  manifest: "/manifest.json",
  openGraph: {
    title: "AI Fortune Teller",
    description: "Assess your career resilience against AI disruption",
    type: "website",
    images: ["/fortune-teller-bg.png"],
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

