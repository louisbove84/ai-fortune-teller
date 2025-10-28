"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { FortuneResult, QuizAnswers } from "@/types/fortune";

interface AutomationTier {
  name: string;
  description: string;
  color: string;
  bgColor: string;
  emoji: string;
}

interface NPCTier {
  level: number;
  name: string;
  description: string;
  color: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const automationTiers: AutomationTier[] = [
    {
      name: "Indestructible Career",
      description: "You're basically a unicorn. AI fears YOU.",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      emoji: "🦄"
    },
    {
      name: "Safe & Sound",
      description: "Sleep well tonight, you're good for decades.",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      emoji: "😴"
    },
    {
      name: "Safe for a While",
      description: "You've got time, but maybe learn some new tricks.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      emoji: "⏰"
    },
    {
      name: "The Clock is Ticking",
      description: "Start planning your escape route now.",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      emoji: "⏰"
    },
    {
      name: "Terminator is at Your Front Door",
      description: "RIP. It was nice knowing you.",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      emoji: "🤖"
    }
  ];

  const npcTiers: NPCTier[] = [
    { level: 1, name: "Main Character", description: "You're the protagonist of your own story", color: "text-purple-400" },
    { level: 2, name: "Supporting Cast", description: "Important but not the star", color: "text-blue-400" },
    { level: 3, name: "Background Character", description: "You exist, that's something", color: "text-yellow-400" },
    { level: 4, name: "NPC", description: "Generic dialogue options", color: "text-orange-400" },
    { level: 5, name: "Ultimate NPC", description: "You are the Wojak", color: "text-red-400" }
  ];

  useEffect(() => {
    const fetchFortune = async () => {
      const answersStr = sessionStorage.getItem("fortuneAnswers");
      if (!answersStr) {
        router.push("/");
        return;
      }

      const parsedAnswers = JSON.parse(answersStr);
      setAnswers(parsedAnswers);

      try {
        const response = await fetch("/api/fortune", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedAnswers),
        });

        const data = await response.json();
        
        if (data.error && data.fallback) {
          // Python backend unavailable, create fallback result
          setResult(createFallbackResult(parsedAnswers));
        } else {
          setResult(data);
        }
      } catch (err) {
        console.error("Fortune fetch error:", err);
        setResult(createFallbackResult(parsedAnswers));
      }
      
      setLoading(false);
    };

    fetchFortune();
  }, [router]);

  const createFallbackResult = (answers: QuizAnswers): FortuneResult => {
    // Calculate basic automation risk based on job title and AI skills
    const automationRisk = calculateAutomationRisk(answers.job_title, answers.ai_skills);
    const score = Math.max(10, 100 - automationRisk);
    
    return {
      score,
      narrative: `Based on your role as a ${answers.job_title} with ${answers.ai_skills} AI skills, you have a ${automationRisk}% automation risk. ${getAutomationAdvice(automationRisk)}`,
      riskLevel: automationRisk > 60 ? "high" : automationRisk > 30 ? "medium" : "low",
      outlook: automationRisk > 60 ? "concerning" : automationRisk > 30 ? "neutral" : "positive",
      factors: {
        automation_risk: automationRisk,
        growth_projection: 5, // Default growth
        skills_adaptation: "Medium",
        salary_trend: 0,
      },
      salary_analysis: {
        current: 0,
        projected: 0,
        change_percent: 0,
        user_comparison: {
          user_salary_range: answers.current_salary,
          market_median: 0,
          percentile: 50,
        },
      },
      job_data: {
        automation_risk: automationRisk,
        growth_projection: 5,
        skills_needed: "Unknown",
        industry: "Unknown",
        location: answers.location,
      },
      data_source: "fallback",
      tier: "free",
    };
  };

  const calculateAutomationRisk = (jobTitle: string, aiSkills: string): number => {
    const title = jobTitle.toLowerCase();
    let risk = 30; // Base risk
    
    // Job title risk factors
    if (title.includes('data entry') || title.includes('cashier') || title.includes('receptionist')) risk += 40;
    else if (title.includes('analyst') || title.includes('accountant') || title.includes('bookkeeper')) risk += 25;
    else if (title.includes('developer') || title.includes('engineer') || title.includes('designer')) risk += 15;
    else if (title.includes('manager') || title.includes('director') || title.includes('executive')) risk += 5;
    else if (title.includes('teacher') || title.includes('nurse') || title.includes('therapist')) risk += 10;
    
    // AI skills adjustment
    if (aiSkills === 'expert') risk -= 20;
    else if (aiSkills === 'intermediate') risk -= 10;
    else if (aiSkills === 'beginner') risk -= 5;
    
    return Math.max(5, Math.min(95, risk));
  };

  const getAutomationAdvice = (risk: number): string => {
    if (risk > 70) return "Consider upskilling in AI-resistant areas like creativity, emotional intelligence, or complex problem-solving.";
    if (risk > 40) return "You're in a moderate risk zone. Focus on developing complementary AI skills.";
    return "You're in a relatively safe position. Keep learning to stay ahead!";
  };

  const getAutomationTier = (risk: number): AutomationTier => {
    if (risk <= 20) return automationTiers[0];
    if (risk <= 40) return automationTiers[1];
    if (risk <= 60) return automationTiers[2];
    if (risk <= 80) return automationTiers[3];
    return automationTiers[4];
  };

  const getNPCTier = (risk: number): NPCTier => {
    if (risk <= 20) return npcTiers[0];
    if (risk <= 40) return npcTiers[1];
    if (risk <= 60) return npcTiers[2];
    if (risk <= 80) return npcTiers[3];
    return npcTiers[4];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl text-cyan-400"
        >
          🔮
        </motion.div>
      </div>
    );
  }

  if (!result || !answers) return null;

  const automationRisk = result.factors.automation_risk;
  const automationTier = getAutomationTier(automationRisk);
  const npcTier = getNPCTier(automationRisk);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full space-y-6"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-cyan-300 mb-2 animate-flicker">
            Your Fortune
          </h1>
          <p className="text-cyan-400">The crystal ball has spoken...</p>
        </motion.div>

        {/* Main Results Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Automation Tier Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${automationTier.bgColor} backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 p-6`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{automationTier.emoji}</div>
              <h2 className={`text-2xl font-bold ${automationTier.color} mb-2`}>
                {automationTier.name}
              </h2>
              <p className="text-gray-300 mb-4">{automationTier.description}</p>
              <div className="text-3xl font-bold text-cyan-300">
                {automationRisk}% Automation Risk
              </div>
            </div>
          </motion.div>

          {/* NPC Tier Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-black/60 backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 p-6"
          >
            <div className="text-center">
              <div className="mb-4">
                <Image
                  src="/NPC_wojak_meme.png"
                  alt="NPC Wojak"
                  width={120}
                  height={120}
                  className="mx-auto rounded-lg"
                />
              </div>
              <h2 className={`text-2xl font-bold ${npcTier.color} mb-2`}>
                NPC Level {npcTier.level}
              </h2>
              <p className="text-gray-300 mb-2">{npcTier.name}</p>
              <p className="text-sm text-gray-400">{npcTier.description}</p>
            </div>
          </motion.div>
        </div>

        {/* Job Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-black/60 backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 p-6"
        >
          <h3 className="text-xl font-bold text-cyan-300 mb-4 text-center">Job Market Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{result.job_data.growth_projection}%</div>
              <div className="text-sm text-gray-400">Projected Growth</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{automationRisk}%</div>
              <div className="text-sm text-gray-400">AI Risk</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{answers.location}</div>
              <div className="text-sm text-gray-400">Location</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{answers.experience}</div>
              <div className="text-sm text-gray-400">Experience</div>
            </div>
          </div>
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="bg-black/60 backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 p-6"
        >
          <h3 className="text-xl font-bold text-cyan-300 mb-4 text-center">The Prophecy</h3>
          <p className="text-base text-gray-300 leading-relaxed whitespace-pre-line">
            {result.narrative}
          </p>
          {result.data_source === "fallback" && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-sm">
              ⚠️ Using fallback calculation (Python backend unavailable)
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center space-y-4"
        >
          <button
            onClick={() => router.push("/")}
            className="w-full px-6 py-3 bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400 text-cyan-300 font-semibold rounded transition-all hover:scale-105"
          >
            Take Another Reading
          </button>
        </motion.div>
      </motion.div>
    </main>
  );
}

