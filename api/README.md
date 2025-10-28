# Vercel Python Serverless Functions

This directory contains Python serverless functions that run on Vercel.

## Files

- **`job-search.py`**: Hybrid fuzzy + vector search for job titles
- **`job_embeddings.pkl`**: Precomputed sentence embeddings (639 job titles, 0.95MB)
- **`job_data.json`**: Simplified job market data for quick lookups
- **`requirements.txt`**: Python dependencies

## How It Works

1. User types in job search field
2. Next.js API route (`/api/job-suggestions`) calls `/api/job-search`
3. Python function performs hybrid search:
   - Fuzzy matching (fast, handles typos)
   - Vector search (semantic, handles abbreviations)
4. Returns job titles with confidence scores and match method

## Deployment

Vercel automatically:
- Detects Python functions in `/api` directory
- Installs dependencies from `requirements.txt`
- Deploys as serverless functions
- Handles scaling and caching

## Performance

- **Cold start**: ~1-2 seconds (first request)
- **Warm**: <100ms per request
- **Memory**: 1024MB allocated
- **Timeout**: 10 seconds (function completes in <1s)

## Configuration

See `vercel.json` for function configuration:
```json
{
  "functions": {
    "api/job-search.py": {
      "runtime": "python3.9",
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

## Local Testing

To test locally:
```bash
# Install Vercel CLI
npm i -g vercel

# Run dev server
vercel dev
```

The function will be available at `http://localhost:3000/api/job-search`

