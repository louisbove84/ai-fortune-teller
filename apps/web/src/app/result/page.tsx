"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { FortuneResult, QuizAnswers } from "@/types/fortune";

interface AutomationTier {
  name: string;
  description: string;
  color: string;
  bgColor: string;
  emoji: string;
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full space-y-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-cyan-300 mb-2 animate-flicker">
            Your Fortune
          </h1>
          <p className="text-cyan-400 text-sm">The crystal ball has spoken...</p>
        </motion.div>

        {/* Automation Risk Card - Main Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${automationTier.bgColor} backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 p-6`}
        >
          <div className="text-center">
            <div className="text-5xl mb-3">{automationTier.emoji}</div>
            <h2 className={`text-xl font-bold ${automationTier.color} mb-2`}>
              {automationTier.name}
            </h2>
            <p className="text-gray-300 text-sm mb-3">{automationTier.description}</p>
            <div className="text-4xl font-bold text-cyan-300">
              {automationRisk}% Automation Risk
            </div>
          </div>
        </motion.div>

        {/* Consolidated Stats & Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black/60 backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 p-5"
        >
          {/* Job Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-xl font-bold text-cyan-400">{result.job_data.growth_projection}%</div>
              <div className="text-xs text-gray-400">Growth</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">{answers.location}</div>
              <div className="text-xs text-gray-400">Location</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-400">{answers.experience}</div>
              <div className="text-xs text-gray-400">Experience</div>
            </div>
          </div>

          {/* Narrative */}
          <div className="border-t border-cyan-500/20 pt-4">
            <h3 className="text-lg font-bold text-cyan-300 mb-3 text-center">The Prophecy</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {result.narrative}
            </p>
            {result.data_source === "fallback" && (
              <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-xs text-center">
                ⚠️ Using fallback calculation
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
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

