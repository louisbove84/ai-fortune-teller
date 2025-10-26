import { NextRequest, NextResponse } from "next/server";
import type { QuizAnswers, FortuneResult } from "@/types/fortune";

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const answers: QuizAnswers = await request.json();

    // Validate inputs
    if (!answers.role || !answers.experience || !answers.industry || !answers.age) {
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
      riskLevel: data.riskLevel,
      factors: {
        roleScore: data.factors.automation_risk || 0,
        experienceScore: data.factors.growth_projection || 0,
        skillsScore: 0, // Calculated by Python backend
        industryScore: 0, // Calculated by Python backend
      },
    };

    // Add additional data for display
    return NextResponse.json({
      ...result,
      outlook: data.outlook,
      jobData: data.job_data,
      salaryAnalysis: data.salary_analysis,
      dataSource: data.data_source,
    });
  } catch (error) {
    console.error("Fortune calculation error:", error);
    
    // Fallback to basic calculation if Python backend is unavailable
    return NextResponse.json(
      {
        error: "Unable to connect to fortune calculation service. Please ensure Python backend is running.",
        fallback: true,
      },
      { status: 503 }
    );
  }
}

