import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AI Fortune Teller - Peer into Your Career Fate",
  description: "Quiz your job's future against AI disruption. Unlock strategies & personalized NFTs.",
  openGraph: {
    title: "AI Fortune Teller",
    description: "Assess your career resilience against AI disruption",
    type: "website",
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

