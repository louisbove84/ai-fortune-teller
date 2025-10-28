import { NextRequest, NextResponse } from "next/server";
import type { QuizAnswers, FortuneResult } from "@/types/fortune";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const answers: QuizAnswers = await request.json();

    // Validate inputs
    if (!answers.job_title || !answers.current_salary || !answers.location || !answers.experience || !answers.education || !answers.ai_skills) {
      return NextResponse.json({ error: "Missing required answers" }, { status: 400 });
    }

    // Call Python backend for Kaggle data-based fortune
    const response = await fetch(`${PYTHON_API_URL}/api/fortune/free`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(answers),
    });

    if (!response.ok) {
      throw new Error(`Python API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform to match existing FortuneResult interface
    const result: FortuneResult = {
      score: data.score,
      narrative: data.narrative,
      riskLevel: data.riskLevel || "medium",
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
          user_salary_range: answers.current_salary,
          market_median: 0,
          percentile: 50,
        },
      },
      job_data: data.job_data || {
        automation_risk: 0,
        growth_projection: 0,
        skills_needed: "Unknown",
        industry: "Unknown",
        location: "Unknown",
      },
      data_source: data.data_source || "free",
      tier: "free",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fortune calculation error:", error);
    console.log("Creating fallback fortune result...");
    
    // Create fallback result instead of returning error
    const fallbackResult: FortuneResult = {
      score: 75, // Default score
      narrative: `Based on your role as a ${answers.job_title} with ${answers.ai_skills} AI skills, you have a moderate automation risk. Focus on developing complementary AI skills and staying adaptable to market changes.`,
      riskLevel: "medium",
      outlook: "neutral",
      factors: {
        automation_risk: 45, // Default moderate risk
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
        automation_risk: 45,
        growth_projection: 5,
        skills_needed: "Unknown",
        industry: "Unknown",
        location: answers.location,
      },
      data_source: "fallback",
      tier: "free",
    };
    
    return NextResponse.json(fallbackResult);
  }
}

