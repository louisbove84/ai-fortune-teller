"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizAnswers } from "@/types/fortune";

const questions = [
  {
    id: "role",
    question: "What is your primary occupation?",
    options: [
      { value: "accountant", label: "💼 Accountant / Financial Analyst", score: -40 },
      { value: "developer", label: "💻 Software Developer", score: 10 },
      { value: "electrician", label: "⚡ Electrician / Skilled Trades", score: 35 },
      { value: "designer", label: "🎨 Designer / Creative", score: 20 },
      { value: "healthcare", label: "🏥 Healthcare Worker", score: 30 },
      { value: "teacher", label: "📚 Teacher / Educator", score: 25 },
    ],
  },
  {
    id: "experience",
    question: "How long have you been in your field?",
    options: [
      { value: "recent-grad", label: "👶 Recent grad (0-2 years)", score: -20 },
      { value: "early-career", label: "🌱 Early career (3-5 years)", score: 0 },
      { value: "mid-career", label: "🌳 Mid-career (6-15 years)", score: 15 },
      { value: "veteran", label: "🏆 Veteran (15+ years)", score: 10 },
    ],
  },
  {
    id: "skills",
    question: "Which tech skills do you have? (Select all that apply)",
    multiple: true,
    options: [
      { value: "none", label: "None / Basic computer use", score: -10 },
      { value: "ml", label: "Machine Learning / AI", score: 30 },
      { value: "programming", label: "Programming / Coding", score: 20 },
      { value: "automation", label: "Process Automation", score: 15 },
      { value: "data-analysis", label: "Data Analysis", score: 15 },
      { value: "blockchain", label: "Blockchain / Web3", score: 25 },
    ],
  },
  {
    id: "industry",
    question: "What industry do you work in?",
    options: [
      { value: "finance", label: "💰 Finance / Banking", score: -30 },
      { value: "tech", label: "🚀 Technology", score: 20 },
      { value: "construction", label: "🏗️ Construction / Trades", score: 35 },
      { value: "healthcare", label: "🏥 Healthcare", score: 30 },
      { value: "education", label: "🎓 Education", score: 25 },
      { value: "creative", label: "🎭 Arts / Entertainment", score: 15 },
    ],
  },
  {
    id: "age",
    question: "What's your age range?",
    options: [
      { value: "18-25", label: "18-25", score: 10 },
      { value: "26-35", label: "26-35", score: 5 },
      { value: "36-45", label: "36-45", score: 0 },
      { value: "46-55", label: "46-55", score: -5 },
      { value: "56+", label: "56+", score: -10 },
    ],
  },
];

interface QuizFormProps {
  onComplete: (answers: QuizAnswers) => void;
}

export default function QuizForm({ onComplete }: QuizFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (!isLastQuestion) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      onComplete(newAnswers as QuizAnswers);
    }
  };

  const handleMultipleChoice = (value: string) => {
    const newSkills = selectedSkills.includes(value)
      ? selectedSkills.filter((s) => s !== value)
      : [...selectedSkills, value];
    setSelectedSkills(newSkills);
  };

  const handleMultipleNext = () => {
    const newAnswers = { ...answers, skills: selectedSkills };
    setAnswers(newAnswers);

    if (!isLastQuestion) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(newAnswers as QuizAnswers);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-fortune-gold">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-mystic-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-fortune-purple to-fortune-gold h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-mystic-900/80 backdrop-blur-lg rounded-2xl p-8 mystic-shadow"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-fortune-gold mb-6 text-center">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option) => (
              <motion.button
                key={option.value}
                onClick={() =>
                  question.multiple ? handleMultipleChoice(option.value) : handleAnswer(option.value)
                }
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                  question.multiple && selectedSkills.includes(option.value)
                    ? "bg-fortune-purple text-white mystic-shadow"
                    : "bg-mystic-800/50 hover:bg-mystic-700 text-gray-200"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  {question.multiple && (
                    <div
                      className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                        selectedSkills.includes(option.value)
                          ? "border-fortune-gold bg-fortune-gold"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedSkills.includes(option.value) && <span className="text-xs">✓</span>}
                    </div>
                  )}
                  <span className="text-lg">{option.label}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {question.multiple && (
            <motion.button
              onClick={handleMultipleNext}
              disabled={selectedSkills.length === 0}
              className="mt-6 w-full px-6 py-3 bg-fortune-gold hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-mystic-950 font-bold rounded-lg transition-all duration-300"
              whileHover={{ scale: selectedSkills.length > 0 ? 1.02 : 1 }}
              whileTap={{ scale: selectedSkills.length > 0 ? 0.98 : 1 }}
            >
              {isLastQuestion ? "Reveal My Fortune" : "Next Question"}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {currentQuestion > 0 && (
        <button
          onClick={() => setCurrentQuestion(currentQuestion - 1)}
          className="mt-4 text-gray-400 hover:text-white transition-colors"
        >
          ← Previous Question
        </button>
      )}
    </motion.div>
  );
}

