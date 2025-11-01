"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizAnswers } from "@/types/fortune";

// Enhanced questions leveraging the Kaggle dataset
const questions = [
  {
    id: "job_title",
    question: "What is your current job title or occupation?",
    type: "searchable_dropdown",
    placeholder: "Type to search... (e.g., Software Developer, Accountant)",
    description: "We'll find your exact role in our database of 30,000+ jobs",
    options: [], // Will be populated dynamically
  },
  {
    id: "current_salary",
    question: "What's your current annual salary? (USD)",
    type: "salary_range",
    description: "We'll compare this to market data for your role",
    options: [
      { value: "under-30k", label: "Under $30,000", min: 0, max: 30000 },
      { value: "30k-50k", label: "$30,000 - $50,000", min: 30000, max: 50000 },
      { value: "50k-75k", label: "$50,000 - $75,000", min: 50000, max: 75000 },
      { value: "75k-100k", label: "$75,000 - $100,000", min: 75000, max: 100000 },
      { value: "100k-150k", label: "$100,000 - $150,000", min: 100000, max: 150000 },
      { value: "150k-200k", label: "$150,000 - $200,000", min: 150000, max: 200000 },
      { value: "over-200k", label: "Over $200,000", min: 200000, max: 1000000 },
    ],
  },
  {
    id: "experience",
    question: "How many years of experience do you have in your field?",
    type: "experience",
    description: "Experience level affects AI resilience and career trajectory",
    options: [
      { value: "0-2", label: "0-2 years (Entry Level)", years: 1 },
      { value: "3-5", label: "3-5 years (Early Career)", years: 4 },
      { value: "6-10", label: "6-10 years (Mid Career)", years: 8 },
      { value: "11-15", label: "11-15 years (Senior)", years: 13 },
      { value: "16-20", label: "16-20 years (Expert)", years: 18 },
      { value: "20+", label: "20+ years (Veteran)", years: 25 },
    ],
  },
  {
    id: "education",
    question: "What's your highest level of education?",
    type: "education",
    description: "Education requirements vary by role and affect AI adaptability",
    options: [
      { value: "high-school", label: "High School Diploma" },
      { value: "associate", label: "Associate Degree" },
      { value: "bachelor", label: "Bachelor's Degree" },
      { value: "master", label: "Master's Degree" },
      { value: "phd", label: "PhD / Doctorate" },
      { value: "certification", label: "Professional Certification" },
    ],
  },
  {
    id: "ai_skills",
    question: "How comfortable are you with AI and technology?",
    type: "ai_comfort",
    description: "Your tech comfort level affects AI resilience",
    options: [
      { value: "beginner", label: "🟢 Beginner - Learning basics", score: 10 },
      { value: "intermediate", label: "🟡 Intermediate - Use AI tools regularly", score: 25 },
      { value: "advanced", label: "🟠 Advanced - Build/work with AI systems", score: 40 },
      { value: "expert", label: "🔴 Expert - AI researcher/engineer", score: 60 },
    ],
  },
];

interface QuizFormProps {
  onComplete: (answers: QuizAnswers) => void;
}

export default function QuizForm({ onComplete }: QuizFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [jobSuggestions, setJobSuggestions] = useState<Array<{
    job_title: string;
    confidence: number;
    match_method: string;
    industry?: string;
    location?: string;
    automation_risk?: number;
    growth_projection?: number;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const fetchJobSuggestions = useCallback(async (query: string) => {
    setIsSearching(true);
    console.log('Fetching job suggestions for:', query);
    try {
      const response = await fetch('/api/job-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      console.log('Job suggestions received:', data);
      setJobSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching job suggestions:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fetch job suggestions when user types
  useEffect(() => {
    if (question.id === "job_title" && searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        fetchJobSuggestions(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setJobSuggestions([]);
    }
  }, [searchQuery, question.id, fetchJobSuggestions]);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (!isLastQuestion) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      onComplete(newAnswers as QuizAnswers);
    }
  };

  const handleJobTitleSelect = (jobTitle: string) => {
    setSearchQuery(jobTitle);
    handleAnswer(jobTitle);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-cyan-400">
            {currentQuestion + 1} / {questions.length}
          </span>
          <span className="text-xs text-cyan-400/60">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-black/40 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-black/60 backdrop-blur-sm rounded-lg border-2 border-cyan-500/30 p-6"
        >
          <h2 className="text-xl font-semibold text-cyan-300 mb-2 text-center">
            {question.question}
          </h2>
          
          {question.description && (
            <p className="text-sm text-cyan-400/80 mb-6 text-center">
              {question.description}
            </p>
          )}

          {/* Job Title Search */}
          {question.type === "searchable_dropdown" && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={question.placeholder}
                  className="w-full p-3 bg-black/40 border border-cyan-500/30 rounded text-gray-300 placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                />
                {isSearching && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              
              {jobSuggestions.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {jobSuggestions.map((job, index) => (
                    <button
                      key={index}
                      onClick={() => handleJobTitleSelect(typeof job === 'string' ? job : job.job_title)}
                      className="w-full p-3 text-left text-sm bg-black/30 hover:bg-cyan-500/20 border border-cyan-500/20 rounded transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-cyan-200 truncate">
                            {typeof job === 'string' ? job : job.job_title}
                          </div>
                          {typeof job === 'object' && (
                            <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-cyan-400">🏢</span>
                                <span>{job.industry || 'Unknown'}</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-cyan-400">📍</span>
                                <span>{job.location || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-cyan-400">🤖</span>
                                <span>AI Risk: {job.automation_risk ? job.automation_risk.toFixed(1) : '0'}%</span>
                                <span className="text-gray-500">•</span>
                                <span className="text-cyan-400">📈</span>
                                <span>Growth: {job.growth_projection ? job.growth_projection.toFixed(1) : '0'}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {typeof job === 'object' && job.confidence && (
                          <div className="ml-3 flex-shrink-0">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              job.confidence >= 90 ? 'bg-green-500/20 text-green-400' :
                              job.confidence >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {job.confidence.toFixed(0)}% {job.match_method}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Regular Options */}
          {question.type !== "searchable_dropdown" && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-3 rounded text-left text-sm transition-all bg-black/40 hover:bg-cyan-500/20 border border-cyan-500/20 text-gray-300 hover:text-cyan-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span>{option.label}</span>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {currentQuestion > 0 && (
          <button
            onClick={handleBack}
            className="px-4 py-2 text-cyan-400/60 hover:text-cyan-400 transition-colors text-sm"
          >
            ← Back
          </button>
        )}
        
        <div className="ml-auto">
          {currentQuestion > 0 && (
            <span className="text-xs text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}