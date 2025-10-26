"use client";

import { motion } from "framer-motion";

export default function CrystalBall() {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-fortune-purple/30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Crystal ball base */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-12 rounded-[50%] bg-gradient-to-b from-fortune-darkPurple to-fortune-cosmic"
        animate={{
          boxShadow: [
            "0 10px 30px rgba(157, 78, 221, 0.4)",
            "0 10px 50px rgba(157, 78, 221, 0.7)",
            "0 10px 30px rgba(157, 78, 221, 0.4)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Main crystal ball */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2 w-48 h-48 rounded-full crystal-glow"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(157, 78, 221, 0.4), rgba(114, 9, 183, 0.6))",
        }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Inner swirls */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent)",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Mystical particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-fortune-gold rounded-full"
              style={{
                left: `${50 + 30 * Math.cos((i * Math.PI) / 4)}%`,
                top: `${50 + 30 * Math.sin((i * Math.PI) / 4)}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Highlight */}
        <div
          className="absolute top-6 left-6 w-16 h-16 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.9), transparent)",
          }}
        />
      </motion.div>
    </div>
  );
}

