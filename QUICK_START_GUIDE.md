# AI Fortune Teller - Quick Start Guide

Get the app running with **real Kaggle data** and **LLM-powered insights** in under 10 minutes!

## What You're Building

A Farcaster Mini App that assesses career resilience against AI disruption:
- **Free Tier**: Real job market data from Kaggle
- **Premium Tier ($3)**: AI-generated personalized strategies + NFT

## Prerequisites

- Node.js 18+
- Python 3.9+
- Terminal access

## Setup (10 Minutes)

### 1. Install Node.js Dependencies (2 min)

```bash
cd ai-fortune-teller
npm install
```

### 2. Set Up Python Backend (3 min)

```bash
# Run setup script
./setup_python.sh

# This creates virtual environment and installs:
# - kagglehub (for dataset)
# - openai (for LLM)
# - flask (for API server)
```

### 3. Configure API Keys (3 min)

#### Get Kaggle Credentials (Required)

1. Visit: https://www.kaggle.com/settings/account
2. Scroll to "API" section
3. Click "Create New Token" → downloads `kaggle.json`
4. Move to home directory:

```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

#### Get OpenAI Key (Optional - for Premium tier)

1. Visit: https://platform.openai.com/api-keys
2. Create account (if needed)
3. Click "Create new secret key"
4. Copy key (starts with `sk-proj-...`)

#### Update .env

Create `.env` file in project root:

```bash
# Python Backend
PYTHON_API_URL=http://localhost:5000

# OpenAI (optional - only for premium tier)
OPENAI_API_KEY=sk-proj-your-key-here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start the App (2 min)

#### Option A: One Command (Recommended)

```bash
./start_dev.sh
```

This starts both servers automatically!

#### Option B: Manual (Two Terminals)

**Terminal 1** - Python Backend:
```bash
source apps/web/venv_fortune/bin/activate
python apps/web/python/api_server.py
```

**Terminal 2** - Next.js:
```bash
npm run dev
```

### 5. Test It! (1 min)

Open browser to: **http://localhost:3000**

1. Click "✨ Begin Your Reading ✨"
2. Answer 5 questions
3. See your AI resilience score based on **real Kaggle data**!
4. (Optional) Test premium tier if you added OpenAI key

## What's Different from the Original?

### Before (Hardcoded):
- Static scores based on assumptions
- Same narrative templates for everyone
- No real data backing

### After (Real Data + LLM):
- ✅ Real job market data from Kaggle dataset
- ✅ Actual AI automation risk percentages
- ✅ Real salary projections (2024-2030)
- ✅ LLM-generated personalized strategies
- ✅ Unique narratives for each user

## Testing Free Tier (No OpenAI Key Needed!)

You can test the core functionality with just Kaggle credentials:

```bash
# Start servers
./start_dev.sh

# Visit http://localhost:3000
# Complete quiz → Get fortune powered by real job market data
```

**What you'll see**:
- AI Resilience Score (0-100)
- Your job's automation risk % (from Kaggle dataset)
- Job growth projection through 2030
- Salary trend analysis ($current → $projected)
- Data-driven mystical narrative

## Testing Premium Tier (Requires OpenAI Key)

If you added `OPENAI_API_KEY` to `.env`:

1. Complete quiz → View free results
2. Click "Get Premium Fortune"
3. Click "Connect Wallet" (works even without real wallet for testing)
4. Click "Unlock Full Destiny"
5. See **LLM-generated content**:
   - Personalized 250-word prophecy
   - 3-4 custom strategies with timelines
   - Key insights specific to you
   - Recommended resources
   - Career timeline (3 months / 1 year / 3 years)
   - NFT preview with custom description

## Endpoints You Can Test

### Check Python Backend Health

```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "healthy",
  "services": {
    "kaggle_data": true,
    "llm": true
  }
}
```

### Get Dataset Summary

```bash
curl http://localhost:5000/api/dataset/summary
```

Shows statistics from the Kaggle dataset.

### Test Free Fortune API

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

## Cost Breakdown

### Development: $0
- Kaggle dataset: FREE
- OpenAI testing: ~$0.01-0.02 per fortune

### Production Per 1000 Users:
- **Revenue**: 200 premium users × $3 = $600
- **OpenAI Cost**: 200 × $0.02 = $4
- **Profit**: $596 (99% margin!)

### Monthly Costs:
- Python backend hosting (Railway/Render): $5-10/month
- Next.js hosting (Vercel): Free tier or $20/month
- Total: ~$10-30/month

## Troubleshooting

### "Unable to connect to fortune calculation service"

❌ **Error**: Next.js can't reach Python backend

✅ **Solution**:
```bash
# Check Python server is running
curl http://localhost:5000/health

# If not running, start it:
source apps/web/venv_fortune/bin/activate
python apps/web/python/api_server.py
```

### "Could not find kaggle credentials"

❌ **Error**: Kaggle authentication failed

✅ **Solution**:
```bash
# Check kaggle.json exists
ls ~/.kaggle/kaggle.json

# If not, download from https://www.kaggle.com/settings/account
# and place in ~/.kaggle/
```

### "Premium features unavailable"

❌ **Error**: OpenAI API key missing

✅ **Solution**:
```bash
# Add to .env:
echo "OPENAI_API_KEY=sk-proj-your-key" >> .env

# Restart Python server
```

### Python Dependencies Error

❌ **Error**: `ModuleNotFoundError: No module named 'kagglehub'`

✅ **Solution**:
```bash
source apps/web/venv_fortune/bin/activate
pip install -r apps/web/requirements.txt
```

## What You Get

### File Structure

```
ai-fortune-teller/
├── setup_python.sh          # ← Run this first
├── start_dev.sh             # ← Then run this
├── apps/web/
│   ├── python/              # ← New Python backend
│   │   ├── kaggle_data_loader.py
│   │   ├── llm_generator.py
│   │   └── api_server.py
│   └── src/app/             # Next.js frontend
└── docs/
    └── PYTHON_BACKEND_SETUP.md  # ← Detailed docs
```

### Data Source

The free tier uses this dataset:
[AI Impact on Job Market 2024-2030](https://www.kaggle.com/datasets/sahilislam007/ai-impact-on-job-market-20242030)

Includes:
- AI Automation Risk % by job
- Job Growth Projections
- Skills Adaptation Requirements
- Salary Data (current & projected)

### Example Output

**Free Tier**:
```
Score: 78/100
Risk Level: Low
Automation Risk: 15%
Growth Projection: +25%
Salary Trend: $95k → $120k (+26%)
```

**Premium Tier** (additional):
```
+ Personalized narrative (250 words)
+ 3-4 actionable strategies
+ Timeline: 3mo / 1yr / 3yr milestones
+ Recommended courses & certifications
+ Key insights & warnings
+ Custom NFT description
```

## Next Steps

1. **Local Testing**: Play with the app, test both tiers
2. **Customize**: Adjust quiz questions, scoring weights
3. **Deploy**: Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
4. **Publish to Farcaster**: See [docs/FARCASTER_SETUP.md](docs/FARCASTER_SETUP.md)

## Documentation

- **[UPDATED_FEATURES.md](UPDATED_FEATURES.md)**: What's new with real data + LLM
- **[docs/PYTHON_BACKEND_SETUP.md](docs/PYTHON_BACKEND_SETUP.md)**: Python setup details
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**: Production deployment
- **[docs/API.md](docs/API.md)**: API endpoint reference
- **[README.md](README.md)**: Full project overview

## Support

- **GitHub Issues**: Report bugs
- **Documentation**: Check `docs/` folder
- **Python Issues**: See `PYTHON_BACKEND_SETUP.md`

---

**Ready?** Run `./start_dev.sh` and start predicting AI career futures! 🔮✨

**Time to first fortune**: ~10 minutes from scratch!

