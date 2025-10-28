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
      
      console.log(`Attempting to call Python serverless function at: ${baseUrl}/api/job-search`);
      
      const pythonResponse = await fetch(`${baseUrl}/api/job-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      console.log(`Python serverless response status: ${pythonResponse.status}`);

      if (pythonResponse.ok) {
        const data = await pythonResponse.json();
        console.log('Python serverless function returned:', data);
        // Python serverless function returns: { suggestions: [{job_title, confidence, match_method, ...}] }
        return NextResponse.json(data);
      } else {
        console.log('Python serverless function failed with status:', pythonResponse.status);
        const errorText = await pythonResponse.text();
        console.log('Python serverless function error:', errorText);
      }
    } catch (error) {
      console.log('Python serverless function not available, using CSV fallback:', error);
    }

    // Fallback: Read CSV file directly (for production)
    console.log('Attempting CSV fallback...');
    
    // Try multiple possible paths for the CSV file
    const possiblePaths = [
      path.join(process.cwd(), 'apps/web/public/job_market_data.csv'),
      path.join(process.cwd(), 'public/job_market_data.csv'),
      path.join(process.cwd(), 'job_market_data.csv'),
      '/vercel/path0/apps/web/public/job_market_data.csv',
      '/vercel/path0/public/job_market_data.csv'
    ];
    
    let csvContent = '';
    let csvPath = '';
    
    for (const testPath of possiblePaths) {
      try {
        console.log(`Trying CSV path: ${testPath}`);
        csvContent = fs.readFileSync(testPath, 'utf-8');
        csvPath = testPath;
        console.log(`✅ Successfully loaded CSV from: ${testPath}`);
        break;
      } catch (pathError) {
        console.log(`❌ Failed to load CSV from: ${testPath}`);
        continue;
      }
    }
    
    if (!csvContent) {
      throw new Error('Could not find job_market_data.csv in any expected location');
    }
    
    try {
      const lines = csvContent.split('\n');
      console.log(`CSV has ${lines.length} lines`);
      
      if (lines.length < 2) {
        throw new Error('CSV file appears to be empty or invalid');
      }
      
      const headers = lines[0].split(',');
      console.log('CSV headers:', headers.slice(0, 5)); // Log first 5 headers
      
      // Find job title column index
      const jobTitleIndex = headers.findIndex(header => 
        header.includes('Job Title') || header.includes('Job_Title')
      );
      
      console.log(`Job title column index: ${jobTitleIndex}`);
      
      if (jobTitleIndex === -1) {
        throw new Error('Job title column not found in CSV headers');
      }
      
      // Extract job titles and filter by query
      const jobTitles = lines.slice(1)
        .filter(line => line.trim()) // Remove empty lines
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
      
      console.log(`Found ${jobTitles.length} matching job titles for query: "${query}"`);
      
      // Count frequency and get unique suggestions
      const jobCounts: { [key: string]: number } = {};
      jobTitles.forEach(title => {
        jobCounts[title] = (jobCounts[title] || 0) + 1;
      });
      
      // Sort by frequency and get top 15
      const suggestions = Object.entries(jobCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15)
        .map(([title, count]) => ({
          job_title: title,
          confidence: Math.min(95, Math.max(60, (count / jobTitles.length) * 100)), // Calculate confidence based on frequency
          match_method: 'csv-fallback',
          industry: 'Unknown', // CSV fallback doesn't have this data
          location: 'Unknown', // CSV fallback doesn't have this data
          automation_risk: 0, // CSV fallback doesn't have this data
          growth_projection: 0 // CSV fallback doesn't have this data
        }));
      
      console.log(`Returning ${suggestions.length} suggestions from CSV with enhanced format`);
      
      return NextResponse.json({
        suggestions,
        total_matches: jobTitles.length,
        source: 'csv_fallback',
        csv_path: csvPath
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
