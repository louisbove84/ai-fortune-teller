import { NextRequest, NextResponse } from "next/server";

/**
 * Job Suggestions API
 * Provides searchable job titles from the Kaggle dataset
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Call Python backend for job suggestions
    const pythonResponse = await fetch(`${process.env.PYTHON_API_URL || 'http://localhost:5001'}/api/job-suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!pythonResponse.ok) {
      throw new Error('Python backend error');
    }

    const data = await pythonResponse.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Job suggestions error:', error);
    
    // Fallback suggestions if Python backend is unavailable
    const fallbackSuggestions = [
      'Software Developer',
      'Data Analyst', 
      'Project Manager',
      'Marketing Manager',
      'Financial Analyst',
      'Graphic Designer',
      'Sales Representative',
      'Customer Service Representative',
      'Accountant',
      'Teacher'
    ].filter(job => 
      job.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    return NextResponse.json({ 
      suggestions: fallbackSuggestions,
      fallback: true 
    });
  }
}
