export interface QuizAnswers {
  job_title: string;
  current_salary: string;
  location: string;
  experience: string;
  education: string;
  ai_skills: string;
}

export interface FortuneResult {
  score: number;
  narrative: string;
  riskLevel: "low" | "medium" | "high";
  outlook: "positive" | "neutral" | "concerning";
  factors: {
    automation_risk: number;
    growth_projection: number;
    skills_adaptation: string;
    salary_trend: number;
  };
  salary_analysis: {
    current: number;
    projected: number;
    change_percent: number;
    user_comparison: {
      user_salary_range: string;
      market_median: number;
      percentile: number;
    };
  };
  job_data: {
    automation_risk: number;
    growth_projection: number;
    skills_needed: string;
    industry: string;
    location: string;
  };
  data_source: string;
  tier: "free";
}

