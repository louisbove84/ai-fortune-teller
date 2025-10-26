# Python Backend Setup Guide

The AI Fortune Teller app now uses a Python backend for:
- **Free Tier**: Real Kaggle dataset (AI Impact on Job Market 2024-2030)
- **Premium Tier**: LLM-powered personalized fortunes via OpenAI GPT-4

## Quick Start

### 1. Install Python Dependencies

```bash
# From project root
cd apps/web

# Create virtual environment
python3 -m venv venv_fortune

# Activate it
source venv_fortune/bin/activate  # Mac/Linux
# or
venv_fortune\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Get API Keys

#### OpenAI API Key (Required for Premium Tier)
1. Visit: https://platform.openai.com/api-keys
2. Create account (if needed)
3. Click "Create new secret key"
4. Copy key (starts with `sk-...`)
5. Add to `.env`: `OPENAI_API_KEY=sk-...`

**Cost**: GPT-4o-mini is ~$0.15 per 1M input tokens, $0.60 per 1M output tokens
- Each premium fortune costs ~$0.01-0.02
- Very affordable for MVP

#### Kaggle Credentials (Required for Dataset)
1. Visit: https://www.kaggle.com/settings/account
2. Scroll to "API" section
3. Click "Create New Token"
4. Downloads `kaggle.json`
5. Add to `.env`:
```bash
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_key_from_json
```

Or place `kaggle.json` in `~/.kaggle/` directory.

### 3. Configure Environment

Add to your `.env` file:

```bash
# Python Backend
PYTHON_API_URL=http://localhost:5000

# OpenAI (Premium Features)
OPENAI_API_KEY=sk-proj-...

# Kaggle (Dataset Access)
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_kaggle_key
```

### 4. Start Python Server

```bash
# Make sure virtual environment is activated
source apps/web/venv_fortune/bin/activate

# Start server
python apps/web/python/api_server.py
```

Server runs on: **http://localhost:5000**

### 5. Start Next.js (in separate terminal)

```bash
# From project root
npm run dev
```

Now visit **http://localhost:3000** - it will connect to Python backend!

## Architecture

```
User Browser (http://localhost:3000)
    ↓
Next.js Frontend
    ↓
Next.js API Routes (/api/fortune/*)
    ↓
Python Flask Server (http://localhost:5000)
    ├─→ Kaggle Dataset (Free Tier)
    └─→ OpenAI API (Premium Tier)
```

## Python API Endpoints

### GET /health
Check server status

```bash
curl http://localhost:5000/health
```

### GET /api/dataset/summary
Get Kaggle dataset statistics

```bash
curl http://localhost:5000/api/dataset/summary
```

### POST /api/fortune/free
Generate free fortune using Kaggle data

```bash
curl -X POST http://localhost:5000/api/fortune/free \
  -H "Content-Type: application/json" \
  -d '{
    "role": "developer",
    "experience": "mid-career",
    "skills": ["programming", "ml"],
    "industry": "tech",
    "age": "26-35"
  }'
```

### POST /api/fortune/premium
Generate premium LLM-powered fortune

```bash
curl -X POST http://localhost:5000/api/fortune/premium \
  -H "Content-Type: application/json" \
  -d '{
    "role": "developer",
    "experience": "mid-career",
    "skills": ["programming", "ml"],
    "industry": "tech",
    "age": "26-35",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

## How It Works

### Free Tier (Kaggle Data)

1. User completes quiz
2. Next.js calls `/api/fortune` → Python `/api/fortune/free`
3. Python loads Kaggle dataset (cached locally)
4. Matches user's job to dataset
5. Calculates resilience score based on:
   - AI automation risk (from dataset)
   - Job growth projection (from dataset)
   - User experience level
   - User skills
6. Returns score + data-driven narrative

**Data Source**: [AI Impact on Job Market 2024-2030](https://www.kaggle.com/datasets/sahilislam007/ai-impact-on-job-market-20242030)

### Premium Tier (LLM-Powered)

1. User pays $3 → unlocks premium
2. Next.js calls `/api/fortune/premium` → Python `/api/fortune/premium`
3. Python:
   - Gets Kaggle data for user's job
   - Calculates resilience score
   - Sends comprehensive prompt to OpenAI GPT-4o-mini
   - LLM generates:
     - Personalized 250-word narrative
     - 3-4 actionable strategies with timelines
     - Key insights and warnings
     - Timeline (3 months / 1 year / 3 years)
     - Recommended resources
     - NFT artwork description
4. Returns rich premium content
5. User can mint NFT with personalized metadata

## File Structure

```
apps/web/
├── requirements.txt               # Python dependencies
├── python/
│   ├── kaggle_data_loader.py     # Kaggle dataset handler
│   ├── llm_generator.py          # OpenAI LLM integration
│   └── api_server.py             # Flask API server
└── venv_fortune/                  # Python virtual environment
```

## Testing

### Test Python Backend Directly

```bash
# Activate venv
source apps/web/venv_fortune/bin/activate

# Test Kaggle loader
cd apps/web/python
python kaggle_data_loader.py

# Test LLM generator (requires OPENAI_API_KEY)
python llm_generator.py
```

### Test Full Stack

1. Start Python server: `python apps/web/python/api_server.py`
2. Start Next.js: `npm run dev`
3. Visit: http://localhost:3000
4. Complete quiz → see Kaggle data-powered results!

## Troubleshooting

### Kaggle Dataset Won't Download

**Error**: "Could not find kaggle credentials"

**Solution**:
```bash
# Option 1: Place kaggle.json in home directory
mkdir -p ~/.kaggle
cp /path/to/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Option 2: Set environment variables
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_key
```

### OpenAI API Error

**Error**: "OpenAI API key required"

**Solution**: Add to `.env`:
```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### Python Server Won't Start

**Error**: "ModuleNotFoundError"

**Solution**:
```bash
# Ensure virtual environment is activated
source apps/web/venv_fortune/bin/activate

# Reinstall dependencies
pip install -r apps/web/requirements.txt
```

### Next.js Can't Connect to Python

**Error**: "Unable to connect to fortune calculation service"

**Solution**:
1. Check Python server is running: `curl http://localhost:5000/health`
2. Check `.env` has: `PYTHON_API_URL=http://localhost:5000`
3. Restart Next.js dev server

## Production Deployment

For production, you have two options:

### Option 1: Deploy Python Separately

1. **Deploy Python to**: Railway, Render, or AWS Lambda
2. **Example (Railway)**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
cd apps/web
railway up

# Get URL (e.g., https://yourapp.railway.app)
```

3. **Update Next.js env**:
```bash
PYTHON_API_URL=https://yourapp.railway.app
```

### Option 2: Serverless Python (Vercel)

Vercel supports Python serverless functions:

1. Move Python files to `/api` directory
2. Create `vercel.json`:
```json
{
  "functions": {
    "api/python/*.py": {
      "runtime": "python3.9"
    }
  }
}
```

3. Deploy: `vercel --prod`

## Cost Estimates

### Kaggle Dataset
- **Cost**: FREE
- **Bandwidth**: Minimal (dataset cached locally)

### OpenAI API (Premium Tier)
- **Model**: GPT-4o-mini
- **Cost per fortune**: ~$0.01-0.02
- **1000 users**: ~$10-20/month

### Python Hosting
- **Railway**: Free tier for MVP, $5/mo for production
- **Render**: Free tier available
- **Vercel Serverless**: Included in Next.js plan

## Benefits of This Architecture

✅ **Real Data**: Kaggle dataset provides authentic job market insights
✅ **AI-Powered**: LLM generates truly personalized advice
✅ **Cost-Effective**: Only pay for premium fortunes
✅ **Scalable**: Python backend can be deployed separately
✅ **Flexible**: Easy to swap LLM models or datasets

## Next Steps

1. **Run locally** to test Kaggle integration
2. **Get OpenAI key** to enable premium features
3. **Deploy Python** to Railway/Render for production
4. **Optional**: Add image generation (DALL-E) for NFT artwork

---

**Questions?** See [API.md](API.md) for endpoint documentation or [ARCHITECTURE.md](ARCHITECTURE.md) for system design.

