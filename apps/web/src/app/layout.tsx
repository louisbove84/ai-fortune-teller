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
          <div className="min-h-screen bg-starry-gradient relative overflow-hidden">
            {/* Starry background effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="star"
                  style={{
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

