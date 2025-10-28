"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  ConnectWallet, 
  WalletDropdown, 
  WalletDropdownDisconnect 
} from "@coinbase/onchainkit/wallet";
import { 
  Avatar, 
  Name, 
  Identity, 
  Address 
} from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import PremiumFortune from "@/components/PremiumFortune";
import type { QuizAnswers } from "@/types/fortune";

export default function PremiumPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const answersStr = sessionStorage.getItem("fortuneAnswers");
    if (!answersStr) {
      router.push("/");
      return;
    }
    setAnswers(JSON.parse(answersStr));
  }, [router]);

  const handlePayment = async () => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Call payment API
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          answers,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setHasPaid(true);
        // Store transaction for NFT minting
        sessionStorage.setItem("paymentTx", data.txHash);
      } else {
        alert("Payment failed: " + data.error);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  if (!answers) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (hasPaid) {
    return <PremiumFortune answers={answers} address={address!} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl w-full bg-mystic-900/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 mystic-shadow"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl font-bold text-fortune-gold mb-6 text-center animate-flicker"
        >
          🌟 Premium Destiny Unlock 🌟
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-fortune-cosmic/50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-fortune-gold mb-4">What You&apos;ll Receive:</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-start">
                <span className="text-2xl mr-3">✨</span>
                <div>
                  <strong>Detailed Pivot Strategies:</strong> Actionable advice tailored to your
                  exact profile, including certifications, skills, and career paths to future-proof
                  yourself against AI.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🗺️</span>
                <div>
                  <strong>Interactive Fate Map:</strong> Visualize your career journey with
                  decision points and potential outcomes.
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🎨</span>
                <div>
                  <strong>Personalized NFT:</strong> Your unique &quot;Retirement Prophecy
                  Token&quot; featuring AI-generated artwork of your AI-proof future self (e.g.,
                  &quot;Mid-life electrician as cyberpunk panda king&quot;).
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-2xl mr-3">🔄</span>
                <div>
                  <strong>Updatable Metadata:</strong> Re-mint after acquiring new skills to track
                  your resilience journey on-chain.
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-fortune-purple/20 border-2 border-fortune-purple rounded-lg p-6 text-center">
            <div className="text-5xl font-bold text-fortune-gold mb-2">$3 USD</div>
            <div className="text-gray-300 mb-4">≈ 0.001 ETH on Base (low gas fees!)</div>
          </div>

          <div className="flex justify-center">
            <Wallet>
              <ConnectWallet className="w-full px-8 py-4 bg-fortune-purple hover:bg-fortune-darkPurple text-white text-xl font-bold rounded-lg mystic-shadow transition-all duration-300 hover:scale-105">
                <span>Connect Wallet</span>
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
          
          {isConnected && (
            <div className="space-y-4">
              <div className="bg-mystic-800/50 rounded-lg p-4 text-center">
                <div className="text-sm text-gray-400 mb-1">Connected:</div>
                <div className="text-fortune-gold font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              </div>

              <motion.button
                onClick={handlePayment}
                className="w-full px-8 py-4 bg-fortune-gold hover:bg-yellow-500 text-mystic-950 text-xl font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                💫 Unlock Full Destiny - Pay $3
              </motion.button>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => router.push("/result")}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Results
            </button>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

