'use client';

import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import QuizForm from "@/components/QuizForm";
import type { QuizAnswers } from "@/types/fortune";

interface ConnectedQuizProps {
  onComplete: (answers: QuizAnswers) => void;
}

export function ConnectedQuiz({ onComplete }: ConnectedQuizProps) {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="text-center mb-16 max-w-2xl"
      >
        <motion.div
          className="mb-8 p-8 bg-mystic-900/80 backdrop-blur-lg rounded-2xl mystic-shadow"
        >
          <h2 className="text-3xl font-bold text-fortune-gold mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300 text-lg mb-2">
            To receive your AI career fortune, please connect your wallet using the button in the top-right corner.
          </p>
          <p className="text-gray-400 text-sm">
            Your fortune will be securely stored on-chain for future reference.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return <QuizForm onComplete={onComplete} />;
}

