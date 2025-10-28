# Pre-Computed Search Index

## Overview

The job search now uses a **pre-computed search index** that works on Vercel without requiring a Python backend!

## How It Works

### 1. Generation (One-time, Local)
```bash
cd apps/web
source venv_fortune/bin/activate
python python/generate_search_index.py
```

This creates `public/search_index.json` with:
- All 639 job titles
- Full job data (industry, location, automation risk, etc.)
- Pre-computed fuzzy + vector search for 40+ common queries
- Embeddings for all job titles

### 2. Deployment
The `search_index.json` file (5.11 MB) is deployed with your app to Vercel's CDN.

### 3. Runtime (Production)
When a user searches:
1. **Cached Query** (e.g., "software"): Instant results from pre-computed cache
2. **Non-Cached Query**: Server-side fuzzy matching using the index
3. **Fallback**: CSV parsing if index unavailable

## Search Strategy

```
User types "software"
    ↓
/api/job-suggestions (Next.js API Route)
    ↓
1. Check search_index.json cache → ✅ Found! (instant)
   OR
2. Search through job_titles with fuzzy matching → ⚡ Fast (<50ms)
   OR
3. Parse CSV file → 🐌 Slower (but still works)
```

## Pre-Cached Queries

The index includes pre-computed results for:
- **Tech**: software, developer, engineer, data, analyst, web, mobile, etc.
- **Business**: manager, director, consultant, accountant, sales, marketing, etc.
- **Other**: teacher, nurse, designer, writer, technician, etc.

Total: **40 common search terms**

## File Structure

```
apps/web/
├── public/
│   └── search_index.json          # 5.11 MB search index
├── python/
│   └── generate_search_index.py   # Generator script
└── src/
    ├── lib/
    │   └── clientSearch.ts         # Client-side search utility
    └── app/api/job-suggestions/
        └── route.ts                # API route using index
```

## Performance

| Method | Speed | Quality | Backend Required |
|--------|-------|---------|------------------|
| Pre-computed cache | <10ms | Excellent (fuzzy + vector) | ❌ No |
| Index fuzzy search | <50ms | Good (fuzzy only) | ❌ No |
| Python backend | <100ms | Excellent (hybrid) | ✅ Yes |
| CSV parsing | <200ms | Fair (substring) | ❌ No |

## Benefits

✅ **No Backend Needed**: Works on Vercel out of the box
✅ **Fast**: Instant for common queries
✅ **Intelligent**: Includes fuzzy + vector search results
✅ **Confidence Scores**: Shows match quality and method
✅ **CDN-Friendly**: Static JSON file cached globally
✅ **Offline-Ready**: Could work offline with service worker

## Regenerating the Index

If the job dataset changes, regenerate the index:

```bash
cd apps/web
source venv_fortune/bin/activate

# Optional: Update embeddings if dataset changed
python python/precompute_embeddings.py

# Regenerate search index
python python/generate_search_index.py

# Commit and deploy
git add public/search_index.json
git commit -m "chore: update search index"
git push
```

## Future Enhancements

1. **More Cached Queries**: Add more common searches
2. **Partial Match Cache**: Pre-compute 2-letter prefixes
3. **Client-Side Search**: Load index in browser for instant results
4. **Compression**: Gzip the JSON file (would reduce to ~1 MB)
5. **CDN Optimization**: Use Edge Functions for even faster responses

## Technical Details

- **Total Jobs**: 639 unique titles
- **Embedding Model**: all-MiniLM-L6-v2
- **Embedding Dimensions**: 384
- **File Size**: 5.11 MB uncompressed
- **Cached Queries**: 40
- **Results per Query**: 15 suggestions

