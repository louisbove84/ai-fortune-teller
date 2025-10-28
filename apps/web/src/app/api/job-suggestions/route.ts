import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

/**
 * Job Suggestions API
 * Provides searchable job titles from the Kaggle dataset
 */
export async function POST(req: NextRequest) {
  let query = '';
  
  try {
    const body = await req.json();
    query = body.query || '';
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Try to read from Python backend first (for local development)
    try {
      const pythonResponse = await fetch(`${process.env.PYTHON_API_URL || 'http://localhost:5000'}/api/job-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (pythonResponse.ok) {
        const data = await pythonResponse.json();
        return NextResponse.json(data);
      }
    } catch {
      console.log('Python backend not available, using CSV fallback');
    }

    // Fallback: Read CSV file directly (for production)
    const csvPath = path.join(process.cwd(), 'apps/web/public/job_market_data.csv');
    
    try {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
      
      // Find job title column index
      const jobTitleIndex = headers.findIndex(header => 
        header.includes('Job Title') || header.includes('Job_Title')
      );
      
      if (jobTitleIndex === -1) {
        throw new Error('Job title column not found');
      }
      
      // Extract job titles and filter by query
      const jobTitles = lines.slice(1)
        .map(line => {
          // Handle CSV parsing with quotes
          const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
          if (matches && matches[jobTitleIndex]) {
            return matches[jobTitleIndex].replace(/"/g, '').trim();
          }
          return null;
        })
        .filter((title): title is string => 
          title !== null && 
          title.length > 0 && 
          title.toLowerCase().includes(query.toLowerCase())
        );
      
      // Count frequency and get unique suggestions
      const jobCounts: { [key: string]: number } = {};
      jobTitles.forEach(title => {
        jobCounts[title] = (jobCounts[title] || 0) + 1;
      });
      
      // Sort by frequency and get top 15
      const suggestions = Object.entries(jobCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([title]) => title);
      
      return NextResponse.json({
        suggestions,
        total_matches: jobTitles.length,
        source: 'csv_fallback'
      });
      
    } catch (csvError) {
      console.error('CSV fallback error:', csvError);
      throw csvError;
    }
    
  } catch (error) {
    console.error('Job suggestions error:', error);
    
    // Final fallback suggestions if everything fails
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
      'Teacher',
      'Chemical Engineer',
      'Mechanical Engineer',
      'Civil Engineer',
      'Electrical Engineer',
      'Biomedical Engineer'
    ].filter(job => 
      job.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    return NextResponse.json({ 
      suggestions: fallbackSuggestions,
      fallback: true,
      source: 'hardcoded_fallback'
    });
  }
}
