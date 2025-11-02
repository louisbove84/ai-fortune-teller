"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAccount } from "wagmi";
import type { FortuneResult, QuizAnswers } from "@/types/fortune";
import MintNFTButton from "@/components/MintNFTButton";

interface AutomationTier {
  name: string;
  description: string;
  color: string;
  bgColor: string;
  emoji: string;
}

export default function ResultPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTicket, setShowTicket] = useState(false);
  const [flipTicket, setFlipTicket] = useState(false);
  const [ipfsUri, setIpfsUri] = useState<string | null>(null);

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
    
    return Math.max(10, Math.min(90, risk)); // Lowered minimum from 5% to 10%
  };

  const getAutomationAdvice = (risk: number): string => {
    if (risk > 70) return "Consider upskilling in AI-resistant areas like creativity, emotional intelligence, or complex problem-solving.";
    if (risk > 40) return "You're in a moderate risk zone. Focus on developing complementary AI skills.";
    return "You're in a relatively safe position. Keep learning to stay ahead!";
  };



  const getAutomationTier = (risk: number): AutomationTier => {
    if (risk <= 10) return automationTiers[0];      // Indestructible Career
    if (risk <= 30) return automationTiers[1];      // Safe & Sound
    if (risk <= 50) return automationTiers[2];      // Safe for a While
    if (risk <= 70) return automationTiers[3];      // The Clock is Ticking
    return automationTiers[4];                       // Terminator at Your Door
  };

  const createFallbackResult = useCallback((answers: QuizAnswers): FortuneResult => {
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
        location: "Unknown",
      },
      data_source: "fallback",
      tier: "free",
    };
  }, []);

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
      
      // Start ticket animation sequence
      setShowTicket(true);
      
      // After 1 second, flip the ticket
      setTimeout(() => {
        setFlipTicket(true);
      }, 1000);
    };

    fetchFortune();
  }, [router, createFallbackResult]);

  // Generate IPFS metadata when result is ready
  useEffect(() => {
    if (result && answers) {
      const generateMetadata = async () => {
        try {
          const response = await fetch("/api/ipfs/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              score: result.score,
              occupation: answers.job_title,
              riskLevel: result.riskLevel,
              outlook: result.outlook,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setIpfsUri(data.ipfsUri);
          }
        } catch (error) {
          console.error("Failed to generate IPFS metadata:", error);
        }
      };

      generateMetadata();
    }
  }, [result, answers]);


  if (loading) {
    return null;
  }

  if (!result || !answers) return null;

  const automationRisk = result.factors.automation_risk;
  const automationTier = getAutomationTier(automationRisk);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <AnimatePresence mode="wait">
        {showTicket && (
          <motion.div
            key="ticket"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="relative w-80 h-96 perspective-1000"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="relative w-full h-full transform-style-preserve-3d"
              animate={{ rotateY: flipTicket ? 180 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {/* Ticket Front */}
              <div className="absolute inset-0 w-full h-full backface-hidden">
                <Image
                  src="/fortune_teller_ticket.png"
                  alt="Fortune Teller Ticket"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Ticket Back - Results */}
              <div className="absolute inset-0 w-full h-full backface-hidden transform rotate-y-180 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-lg shadow-2xl border-4 border-yellow-600">
                <div className="p-4 h-full flex flex-col justify-between text-yellow-900">
                  {/* Header */}
                  <div className="text-center mb-3">
                    <h1 className="text-lg font-bold text-yellow-900 mb-1">YOUR AI FORTUNE</h1>
                    <div className="w-full h-0.5 bg-yellow-700"></div>
                  </div>

                  {/* Automation Risk - Main Focus */}
                  <div className="bg-yellow-600 rounded-lg p-3 mb-3">
                    <div className="text-center">
                      <div className="text-3xl mb-1">{automationTier.emoji}</div>
                      <h2 className="text-sm font-bold text-yellow-900 mb-1">
                        {automationTier.name}
                      </h2>
                      <div className="text-2xl font-bold text-yellow-900">
                        {automationRisk}% Risk
                      </div>
                    </div>
                  </div>


                  {/* Prophecy */}
                  <div className="flex-1 mb-6">
                    <h3 className="text-sm font-bold text-yellow-900 mb-2 text-center">PROPHECY</h3>
                    <p className="text-xs text-yellow-900 leading-tight text-center">
                      As a {answers.job_title}, {result.narrative}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT Minting - Only show after ticket flip */}
      {flipTicket && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          {/* NFT Minting Button - Only show if wallet connected */}
          {isConnected && address && ipfsUri && result && answers ? (
            <MintNFTButton
              tokenURI={ipfsUri}
              score={result.score}
              occupation={answers.job_title}
              onSuccess={(tokenId, txHash) => {
                console.log("NFT minted successfully!", { tokenId, txHash });
                // You can show a success message or redirect here
              }}
              onError={(error) => {
                console.error("Minting failed:", error);
              }}
            />
          ) : (
            <p className="text-yellow-400 text-sm text-center">
              Connect your wallet on the home page to mint an NFT
            </p>
          )}

          {/* Action Button */}
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400 text-cyan-300 font-semibold rounded transition-all hover:scale-105"
          >
            Take Another Reading
          </button>
        </motion.div>
      )}
    </main>
  );
}

