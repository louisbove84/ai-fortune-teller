"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
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
import QuizForm from "@/components/QuizForm";
import type { QuizAnswers } from "@/types/fortune";

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [showQuiz, setShowQuiz] = useState(false);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = async (answers: QuizAnswers) => {
    // Store answers in sessionStorage and navigate to results
    sessionStorage.setItem("fortuneAnswers", JSON.stringify(answers));
    router.push("/result");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-end p-8 relative">
      {/* Wallet Connection - Top Right */}
      <div className="absolute top-8 right-8 z-50">
        <Wallet>
          <ConnectWallet />
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

      {!showQuiz ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-center mb-16"
        >
          <motion.button
            onClick={handleStartQuiz}
            className="px-12 py-6 bg-cyan-500/30 hover:bg-cyan-400/40 border-2 border-cyan-400 text-cyan-200 text-2xl font-bold rounded-lg shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-md animate-flicker"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Begin Reading
          </motion.button>

          {isConnected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-fortune-gold text-sm"
            >
              Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </motion.p>
          )}
        </motion.div>
      ) : (
        <QuizForm onComplete={handleQuizComplete} />
      )}
    </main>
  );
}

