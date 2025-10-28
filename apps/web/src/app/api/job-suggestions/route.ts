import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

/**
 * Job Suggestions API
 * Uses pre-computed search index for fast, intelligent matching
 */
export async function POST(req: NextRequest) {
  let query = '';
  
  try {
    const body = await req.json();
    query = body.query || '';
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Try to use the pre-computed search index (works in production!)
    try {
      const indexPath = path.join(process.cwd(), 'apps/web/public/search_index.json');
      
      if (fs.existsSync(indexPath)) {
        const searchIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        const queryLower = query.toLowerCase();
        
        // Check if we have this query cached
        if (searchIndex.query_cache && searchIndex.query_cache[queryLower]) {
          const cached = searchIndex.query_cache[queryLower];
          const bestFuzzyScore = cached.fuzzy[0]?.confidence || 0;
          const fuzzyThreshold = 85;
          
          // Use fuzzy if confident enough, otherwise vector
          const results = bestFuzzyScore >= fuzzyThreshold ? cached.fuzzy : cached.vector;
          
          // Add job data to results
          const suggestions = results.slice(0, 15).map((result: any) => ({
            ...result,
            ...searchIndex.job_data[result.job_title]
          }));
          
          return NextResponse.json({ suggestions, total_matches: suggestions.length });
        }
        
        // Not cached - do server-side fuzzy search
        const fuzzyResults = searchIndex.job_titles
          .map((title: string) => {
            const score = simpleFuzzyScore(query, title);
            return {
              job_title: title,
              confidence: score,
              match_method: 'fuzzy',
              ...searchIndex.job_data[title]
            };
          })
          .sort((a: any, b: any) => b.confidence - a.confidence)
          .slice(0, 15);
        
        return NextResponse.json({ suggestions: fuzzyResults, total_matches: fuzzyResults.length });
      }
    } catch (error) {
      console.log('Search index not available, trying Python backend:', error);
    }

    // Fallback to Python backend (for local development)
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
    } catch (error) {
      console.log('Python backend not available, using CSV fallback:', error);
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

/**
 * Simple fuzzy string matching helper
 */
function simpleFuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().split(/\s+/).sort().join(' ');
  const t = target.toLowerCase().split(/\s+/).sort().join(' ');
  
  // Exact match
  if (t === q) return 100;
  
  // Substring match
  if (t.includes(q)) return 95;
  if (q.includes(t)) return 90;
  
  // Token overlap scoring
  const qTokens = new Set(q.split(/\s+/));
  const tTokens = new Set(t.split(/\s+/));
  const intersection = new Set([...qTokens].filter(x => tTokens.has(x)));
  const union = new Set([...qTokens, ...tTokens]);
  
  return (intersection.size / union.size) * 100;
}
