# Hybrid Job Search System

## Overview

This implements a **hybrid fuzzy + vector search** system for job title matching. It combines:

1. **Fuzzy String Matching** (rapidfuzz) - Handles typos, abbreviations, word order
2. **Vector Similarity** (sentence-transformers) - Finds semantic matches

## How It Works

### 1. Precompute Embeddings (One-time Setup)

```bash
cd apps/web
source venv_fortune/bin/activate
python python/precompute_embeddings.py
```

This creates `job_embeddings.pkl` with embeddings for all ~30,000 job titles using the `all-MiniLM-L6-v2` model.

### 2. Hybrid Search Logic

When a user types a query:

1. **Try fuzzy matching first** using token_sort_ratio
2. **If best match < 80% confidence**, fall back to vector search
3. **Return top results** with confidence score and method used

### 3. Response Format

```json
{
  "suggestions": [
    {
      "job_title": "Software Engineer",
      "confidence": 92.5,
      "match_method": "fuzzy",
      "industry": "Technology",
      "location": "USA",
      "automation_risk": 25.3,
      "growth_projection": 15.7
    }
  ]
}
```

## Examples

| User Input | Best Match | Confidence | Method |
|------------|------------|------------|--------|
| "software enginer" | "Software Engineer" | 95% | fuzzy |
| "data analyst" | "Business Intelligence Analyst" | 82% | vector |
| "accountent" | "Accountant" | 93% | fuzzy |
| "ml engineer" | "Machine Learning Engineer" | 78% | vector |

## Files

- `precompute_embeddings.py` - One-time script to generate embeddings
- `hybrid_job_search.py` - Core hybrid search logic
- `api_server.py` - Flask API endpoint using hybrid search
- `job_embeddings.pkl` - Precomputed embeddings (generated)

## Performance

- **Fuzzy search**: ~1-2ms per query
- **Vector search**: ~10-20ms per query (with 30K jobs)
- **Total API response**: <100ms

## Dependencies

```bash
pip install sentence-transformers>=2.2.0 rapidfuzz>=3.0.0
```

## Production Notes

- The `job_embeddings.pkl` file is ~50MB and should be included in deployment
- If embeddings are not available, the system falls back to fuzzy-only mode
- The Next.js API route falls back to CSV parsing if Python backend is unavailable

