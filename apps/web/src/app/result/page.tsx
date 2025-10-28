"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { FortuneResult } from "@/types/fortune";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFortune = async () => {
      const answersStr = sessionStorage.getItem("fortuneAnswers");
      if (!answersStr) {
        router.push("/");
        return;
      }

      const answers = JSON.parse(answersStr);
      const response = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      const data = await response.json();
      setResult(data);
      setLoading(false);
    };

    fetchFortune();
  }, [router]);

  if (loading) {
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

  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#10b981"; // green
    if (score >= 40) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full bg-black/60 backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 p-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-cyan-300 mb-2 animate-flicker">
            Your Fortune
          </h1>
        </motion.div>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-6"
        >
          <div
            className="text-5xl font-bold mb-2"
            style={{ color: getScoreColor(result.score) }}
          >
            {result.score}
          </div>
          <div className="text-sm text-cyan-400">AI Resilience Score</div>
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <p className="text-base text-gray-300 leading-relaxed whitespace-pre-line">
            {result.narrative}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center space-y-4"
        >
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400 text-cyan-300 font-semibold rounded transition-all"
          >
            Take Another Reading
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}

