"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      {!showQuiz ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="text-center"
        >
          <motion.button
            onClick={handleStartQuiz}
            className="px-12 py-6 bg-cyan-500/20 hover:bg-cyan-400/30 border-2 border-cyan-400 text-cyan-300 text-2xl font-bold rounded-lg mystic-shadow transition-all duration-300 hover:scale-105 backdrop-blur-sm animate-flicker"
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

