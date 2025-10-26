export interface QuizAnswers {
  role: string;
  experience: string;
  skills: string[];
  industry: string;
  age: string;
}

export interface FortuneResult {
  score: number;
  narrative: string;
  riskLevel: "low" | "medium" | "high";
  factors: {
    roleScore: number;
    experienceScore: number;
    skillsScore: number;
    industryScore: number;
  };
}

export interface PremiumFortuneResult extends FortuneResult {
  strategies: Strategy[];
  fateMap: FateMapNode[];
  nftMetadata: NFTMetadata;
}

export interface Strategy {
  title: string;
  description: string;
  timeline: string;
  resources: string[];
}

export interface FateMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "current" | "decision" | "outcome";
  connections: string[];
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

