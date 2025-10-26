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
      factors: {
        roleScore: 0,
        experienceScore: 0,
        skillsScore: 0,
        industryScore: 0,
      },
      strategies: data.strategies.map((s: any) => ({
        title: s.title,
        description: s.description,
        timeline: s.timeline,
        resources: [s.difficulty, s.impact],
      })),
      fateMap: data.fateMap,
      nftMetadata: {
        name: data.nftMetadata.name,
        description: data.nftMetadata.description,
        image: data.nftMetadata.imagePrompt, // Will be used to generate actual image
        attributes: data.nftMetadata.attributes,
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
  } catch (error: any) {
    console.error("Premium fortune error:", error);
    
    // Check if it's an LLM availability error
    if (error.message?.includes("Premium features unavailable")) {
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
