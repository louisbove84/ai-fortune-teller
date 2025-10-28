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
  tier: "free" | "premium";
}

export interface PremiumFortuneResult extends FortuneResult {
  strategies: Strategy[];
  fateMap: FateMapNode[];
  nftMetadata: NFTMetadata;
  detailed_analysis: {
    market_trends: string;
    skill_gaps: string[];
    career_paths: CareerPath[];
    salary_projections: SalaryProjection[];
  };
}

export interface Strategy {
  title: string;
  description: string;
  timeline: string;
  resources: string[];
  priority: "high" | "medium" | "low";
  cost_estimate: string;
}

export interface FateMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "current" | "decision" | "outcome";
  connections: string[];
  probability?: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

export interface CareerPath {
  title: string;
  description: string;
  required_skills: string[];
  salary_range: string;
  growth_potential: number;
  ai_resilience: number;
}

export interface SalaryProjection {
  year: number;
  min_salary: number;
  max_salary: number;
  median_salary: number;
  percentile_25: number;
  percentile_75: number;
}

