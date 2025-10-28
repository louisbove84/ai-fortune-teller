"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import QuizForm from "@/components/QuizForm";
import type { QuizAnswers } from "@/types/fortune";

// Dynamically import WalletButton to prevent SSR issues
const WalletButton = dynamic(
  () => import("@/components/WalletButton").then((mod) => ({ default: mod.WalletButton })),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
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
      {/* Wallet Connection - Client-side only */}
      <WalletButton />

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
        </motion.div>
      ) : (
        <QuizForm onComplete={handleQuizComplete} />
      )}
    </main>
  );
}

