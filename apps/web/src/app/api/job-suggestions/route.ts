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

    // Try Vercel Python serverless function first
    try {
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const pythonResponse = await fetch(`${baseUrl}/api/job-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (pythonResponse.ok) {
        const data = await pythonResponse.json();
        // Python serverless function returns: { suggestions: [{job_title, confidence, match_method, ...}] }
        return NextResponse.json(data);
      }
    } catch (error) {
      console.log('Python serverless function not available, using CSV fallback:', error);
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
