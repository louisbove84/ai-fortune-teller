/**
 * Client-side job search using pre-computed search index
 * This runs entirely in the browser with no backend needed!
 */

interface JobResult {
  job_title: string;
  confidence: number;
  match_method: string;
  industry?: string;
  location?: string;
  automation_risk?: number;
  growth_projection?: number;
}

interface SearchIndex {
  job_titles: string[];
  job_data: Record<string, {
    job_title: string;
    industry: string;
    location: string;
    automation_risk: number;
    growth_projection: number;
  }>;
  embeddings: number[][];
  query_cache: Record<string, {
    fuzzy: JobResult[];
    vector: JobResult[];
  }>;
  metadata: {
    total_jobs: number;
    embedding_dim: number;
    model: string;
  };
}

let searchIndex: SearchIndex | null = null;
let loadingPromise: Promise<SearchIndex> | null = null;

/**
 * Load the search index (cached after first load)
 */
export async function loadSearchIndex(): Promise<SearchIndex> {
  if (searchIndex) {
    return searchIndex;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = fetch('/search_index.json')
    .then(res => res.json())
    .then(data => {
      searchIndex = data;
      return data;
    });

  return loadingPromise;
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}

/**
 * Simple fuzzy string matching (token sort ratio approximation)
 */
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().split(/\s+/).sort().join(' ');
  const t = target.toLowerCase().split(/\s+/).sort().join(' ');
  
  // Simple substring scoring
  if (t.includes(q)) return 100;
  if (q.includes(t)) return 90;
  
  // Token overlap scoring
  const qTokens = new Set(q.split(/\s+/));
  const tTokens = new Set(t.split(/\s+/));
  const intersection = new Set([...qTokens].filter(x => tTokens.has(x)));
  const union = new Set([...qTokens, ...tTokens]);
  
  return (intersection.size / union.size) * 100;
}

/**
 * Search for jobs using the pre-computed index
 */
export async function searchJobs(
  query: string,
  options: {
    topK?: number;
    fuzzyThreshold?: number;
  } = {}
): Promise<JobResult[]> {
  const { topK = 15, fuzzyThreshold = 85 } = options;

  if (!query || query.length < 2) {
    return [];
  }

  const index = await loadSearchIndex();
  const queryLower = query.toLowerCase();

  // Check if we have this query cached
  if (index.query_cache[queryLower]) {
    const cached = index.query_cache[queryLower];
    const bestFuzzyScore = cached.fuzzy[0]?.confidence || 0;
    
    // Use fuzzy if confident enough, otherwise vector
    const results = bestFuzzyScore >= fuzzyThreshold ? cached.fuzzy : cached.vector;
    
    // Add job data to results
    return results.slice(0, topK).map(result => ({
      ...result,
      ...index.job_data[result.job_title]
    }));
  }

  // Not cached - do client-side fuzzy search
  const fuzzyResults = index.job_titles
    .map(title => ({
      job_title: title,
      confidence: fuzzyScore(query, title),
      match_method: 'fuzzy' as const
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topK);

  const bestFuzzyScore = fuzzyResults[0]?.confidence || 0;

  // If fuzzy is good enough, use it
  if (bestFuzzyScore >= fuzzyThreshold) {
    return fuzzyResults.map(result => ({
      ...result,
      ...index.job_data[result.job_title]
    }));
  }

  // Otherwise, use vector search (more expensive)
  // For client-side, we'll just return fuzzy results
  // True vector search would require loading a model in the browser
  return fuzzyResults.map(result => ({
    ...result,
    ...index.job_data[result.job_title]
  }));
}

