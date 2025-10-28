import { NextRequest, NextResponse } from "next/server";
import type { PremiumFortuneResult } from "@/types/fortune";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const { answers, address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
    }

    // Call Python backend for LLM-powered premium fortune
    const response = await fetch(`${PYTHON_API_URL}/api/fortune/premium`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...answers,
        address,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Python API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform to match existing PremiumFortuneResult interface
    const premiumResult: PremiumFortuneResult = {
      score: data.score,
      narrative: data.narrative,
      riskLevel: data.riskLevel,
      outlook: data.outlook || "neutral",
      factors: {
        automation_risk: data.factors?.automation_risk || 0,
        growth_projection: data.factors?.growth_projection || 0,
        skills_adaptation: data.factors?.skills_adaptation || "Medium",
        salary_trend: data.factors?.salary_trend || 0,
      },
      salary_analysis: data.salary_analysis || {
        current: 0,
        projected: 0,
        change_percent: 0,
        user_comparison: {
          user_salary_range: "",
          market_median: 0,
          percentile: 50,
        },
      },
      job_data: data.job_data || {
        automation_risk: 0,
        growth_projection: 0,
        skills_needed: "",
        industry: "",
        location: "",
      },
      data_source: data.data_source || "premium",
      tier: "premium",
      strategies: data.strategies?.map((s: {
        title: string;
        description: string;
        timeline: string;
        resources?: string[];
        difficulty?: string;
        impact?: string;
        priority?: string;
        cost_estimate?: string;
      }) => ({
        title: s.title,
        description: s.description,
        timeline: s.timeline,
        resources: s.resources || [s.difficulty, s.impact],
        priority: s.priority || "medium",
        cost_estimate: s.cost_estimate || "Free",
      })) || [],
      fateMap: data.fateMap || [],
      nftMetadata: {
        name: data.nftMetadata?.name || "AI Fortune NFT",
        description: data.nftMetadata?.description || "Your personalized AI fortune",
        image: data.nftMetadata?.imagePrompt || data.nftMetadata?.image || "",
        attributes: data.nftMetadata?.attributes || [],
      },
      detailed_analysis: data.detailed_analysis || {
        market_trends: "",
        skill_gaps: [],
        career_paths: [],
        salary_projections: [],
      },
    };

    // Return with additional premium data
    return NextResponse.json({
      ...premiumResult,
      keyInsights: data.keyInsights,
      timeline: data.timeline,
      resources: data.resources,
      warnings: data.warnings,
      opportunities: data.opportunities,
      outlook: data.outlook,
      salaryAnalysis: data.salary_analysis,
    });
  } catch (error: unknown) {
    console.error("Premium fortune error:", error);
    
    // Check if it's an LLM availability error
    if (error instanceof Error && error.message?.includes("Premium features unavailable")) {
      return NextResponse.json(
        {
          error: "Premium features require OpenAI API key. Please configure OPENAI_API_KEY.",
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate premium fortune" },
      { status: 500 }
    );
  }
}
