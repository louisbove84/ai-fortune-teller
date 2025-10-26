"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CrystalBall from "@/components/CrystalBall";
import QuizForm from "@/components/QuizForm";

export default function Home() {
  const router = useRouter();
  const [showQuiz, setShowQuiz] = useState(false);

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = async (answers: any) => {
    // Store answers in sessionStorage and navigate to results
    sessionStorage.setItem("fortuneAnswers", JSON.stringify(answers));
    router.push("/result");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center max-w-4xl"
      >
        {!showQuiz ? (
          <>
            {/* Title */}
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 text-fortune-gold animate-flicker"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              🔮 AI Fortune Teller
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl mb-8 text-purple-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Peer into the mystic veil of your career&apos;s future...
            </motion.p>

            {/* Crystal Ball */}
            <div className="my-12">
              <CrystalBall />
            </div>

            <motion.p
              className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Will the rise of AI spell doom for your profession, or will you thrive in the new
              age? Answer a few mystical questions to receive your fortune...
            </motion.p>

            {/* Start Button */}
            <motion.button
              onClick={handleStartQuiz}
              className="px-8 py-4 bg-fortune-purple hover:bg-fortune-darkPurple text-white text-xl font-bold rounded-lg mystic-shadow transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              ✨ Begin Your Reading ✨
            </motion.button>

            <p className="mt-6 text-sm text-gray-400">
              Free basic fortune • Premium strategies & NFT available
            </p>
          </>
        ) : (
          <QuizForm onComplete={handleQuizComplete} />
        )}
      </motion.div>
    </main>
  );
}

