"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
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
          🔮
        </motion.div>
      </div>
    );
  }

  if (!result) return null;

  const chartData = [
    { name: "AI Resilience", value: result.score },
    { name: "Industry Avg", value: 50 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#10b981"; // green
    if (score >= 40) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full bg-mystic-900/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 mystic-shadow"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-fortune-gold mb-4 animate-flicker">
            ✨ Your Fortune is Revealed ✨
          </h1>
          <p className="text-lg text-purple-200">The crystal ball has spoken...</p>
        </motion.div>

        {/* Score Display */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-center mb-8"
        >
          <div className="inline-block">
            <div
              className="text-7xl md:text-8xl font-bold mb-2"
              style={{ color: getScoreColor(result.score) }}
            >
              {result.score}
            </div>
            <div className="text-xl text-gray-300">AI Resilience Score</div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8 h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #9d4edd" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? getScoreColor(entry.value) : "#6b7280"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-fortune-cosmic/50 rounded-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-fortune-gold mb-4">Your Prophecy</h2>
          <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-line">
            {result.narrative}
          </p>
        </motion.div>

        {/* CTA for Premium */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center"
        >
          <div className="bg-fortune-purple/20 border-2 border-fortune-purple rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-fortune-gold mb-3">
              🌟 Unlock Your Full Destiny 🌟
            </h3>
            <p className="text-gray-300 mb-4">
              Want detailed AI-proof strategies, a visual fate map, and your personalized
              &quot;Retirement Prophecy&quot; NFT?
            </p>
            <ul className="text-left text-gray-300 mb-6 space-y-2 max-w-md mx-auto">
              <li>✨ Actionable pivot strategies tailored to your profile</li>
              <li>🗺️ Interactive career fate map</li>
              <li>🎨 Unique NFT artwork of your AI-proof future self</li>
              <li>🔄 Updatable on-chain metadata as you upskill</li>
            </ul>
            <button
              onClick={() => router.push("/premium")}
              className="px-8 py-4 bg-fortune-gold hover:bg-yellow-500 text-mystic-950 text-xl font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              Get Premium Fortune - $3 in ETH
            </button>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Start Over
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}

