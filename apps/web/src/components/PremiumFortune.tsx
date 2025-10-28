"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { PremiumFortuneResult, QuizAnswers } from "@/types/fortune";

interface PremiumFortuneProps {
  answers: QuizAnswers;
  address: string;
}

export default function PremiumFortune({ answers, address }: PremiumFortuneProps) {
  const [result, setResult] = useState<PremiumFortuneResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [nftMinted, setNftMinted] = useState(false);

  useEffect(() => {
    const fetchPremiumFortune = async () => {
      const response = await fetch("/api/fortune/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, address }),
      });

      const data = await response.json();
      setResult(data);
      setLoading(false);
    };

    fetchPremiumFortune();
  }, [answers, address]);

  const handleMintNFT = async () => {
    if (!result) return;

    setMinting(true);
    try {
      const response = await fetch("/api/nft/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          metadata: result.nftMetadata,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNftMinted(true);
        alert(`NFT minted successfully! Token ID: ${data.tokenId}`);
      } else {
        alert("NFT minting failed: " + data.error);
      }
    } catch (error) {
      console.error("Minting error:", error);
      alert("Failed to mint NFT");
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 relative z-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl w-full space-y-8"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-fortune-gold mb-4 animate-flicker">
            🌟 Your Complete Destiny Revealed 🌟
          </h1>
          <p className="text-xl text-purple-200">Premium Fortune Unlocked</p>
        </motion.div>

        {/* Strategies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-mystic-900/80 backdrop-blur-lg rounded-2xl p-8 mystic-shadow"
        >
          <h2 className="text-3xl font-bold text-fortune-gold mb-6">
            🎯 Your AI-Proof Strategies
          </h2>
          <div className="space-y-6">
            {result.strategies.map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-fortune-cosmic/50 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-fortune-gold mb-3">{strategy.title}</h3>
                <p className="text-gray-200 mb-4">{strategy.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-mystic-800/50 px-3 py-1 rounded">
                    ⏱️ Timeline: {strategy.timeline}
                  </div>
                  <div className="bg-mystic-800/50 px-3 py-1 rounded">
                    📚 Resources: {strategy.resources.join(", ")}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fate Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-mystic-900/80 backdrop-blur-lg rounded-2xl p-8 mystic-shadow"
        >
          <h2 className="text-3xl font-bold text-fortune-gold mb-6">🗺️ Your Career Fate Map</h2>
          <div className="relative h-96 bg-fortune-cosmic/30 rounded-lg overflow-hidden">
            <svg className="w-full h-full">
              {/* Draw connections */}
              {result.fateMap.map((node) =>
                node.connections.map((targetId) => {
                  const target = result.fateMap.find((n) => n.id === targetId);
                  if (!target) return null;
                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${target.x}%`}
                      y2={`${target.y}%`}
                      stroke="#9d4edd"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  );
                })
              )}

              {/* Draw nodes */}
              {result.fateMap.map((node, index) => (
                <g key={node.id}>
                  <motion.circle
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="20"
                    fill={
                      node.type === "current"
                        ? "#ffd700"
                        : node.type === "decision"
                        ? "#9d4edd"
                        : "#10b981"
                    }
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  />
                  <text
                    x={`${node.x}%`}
                    y={`${node.y + 8}%`}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    className="font-bold"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-fortune-gold" />
              <span>Current Position</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-fortune-purple" />
              <span>Decision Point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span>Positive Outcome</span>
            </div>
          </div>
        </motion.div>

        {/* NFT Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-mystic-900/80 backdrop-blur-lg rounded-2xl p-8 mystic-shadow"
        >
          <h2 className="text-3xl font-bold text-fortune-gold mb-6">
            🎨 Your Retirement Prophecy NFT
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="relative aspect-square rounded-lg overflow-hidden mystic-shadow">
                {result.nftMetadata.image ? (
                  <Image
                    src={result.nftMetadata.image}
                    alt={result.nftMetadata.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-fortune-purple to-fortune-darkPurple flex items-center justify-center text-6xl">
                    NFT
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-fortune-gold mb-4">
                {result.nftMetadata.name}
              </h3>
              <p className="text-gray-200 mb-6">{result.nftMetadata.description}</p>
              <div className="space-y-3 mb-6">
                {result.nftMetadata.attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="flex justify-between bg-fortune-cosmic/50 rounded p-3"
                  >
                    <span className="text-gray-300">{attr.trait_type}</span>
                    <span className="text-fortune-gold font-bold">{attr.value}</span>
                  </div>
                ))}
              </div>
              {!nftMinted ? (
                <motion.button
                  onClick={handleMintNFT}
                  disabled={minting}
                  className="w-full px-6 py-4 bg-fortune-gold hover:bg-yellow-500 disabled:bg-gray-600 text-mystic-950 text-xl font-bold rounded-lg transition-all duration-300"
                  whileHover={{ scale: minting ? 1 : 1.02 }}
                  whileTap={{ scale: minting ? 1 : 0.98 }}
                >
                  {minting ? "Minting..." : "Mint Your NFT"}
                </motion.button>
              ) : (
                <div className="text-center p-4 bg-green-900/50 rounded-lg">
                  <p className="text-green-300 font-bold">NFT Minted Successfully!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

