# Using Grok (xAI) with AI Fortune Teller

Great choice! Grok is xAI's powerful LLM with excellent reasoning capabilities and competitive pricing.

## Why Grok?

✅ **Excellent reasoning** - Great for personalized career advice
✅ **Competitive pricing** - Similar to OpenAI
✅ **Fast responses** - Low latency
✅ **Compatible API** - Works with OpenAI SDK

## Quick Setup

### 1. Get Grok API Key

1. Visit: **https://console.x.ai/**
2. Sign up or log in with X (Twitter) account
3. Navigate to API Keys section
4. Click "Create API Key"
5. Copy the key (starts with `xai-...`)

### 2. Add to .env.local

Your `.env.local` file should have:

```bash
# Grok API Key
GROK_API_KEY=xai-your-actual-key-here

# Python Backend
PYTHON_API_URL=http://localhost:5000

# Kaggle (if not using ~/.kaggle/kaggle.json)
# KAGGLE_USERNAME=your_username
# KAGGLE_KEY=your_key
```

### 3. Verify Setup

```bash
# Check your .env.local
cat .env.local | grep GROK_API_KEY

# Should output (with your actual key):
# GROK_API_KEY=xai-...
```

### 4. Start the App

```bash
./start_dev.sh
```

You should see:
```
🤖 Using Grok (xAI) for LLM generation
✅ LLM generator initialized: grok
```

## Test Premium Features

1. Visit **http://localhost:3000**
2. Complete the quiz
3. Click "Get Premium Fortune - $3"
4. Connect wallet (testing mode works without real wallet)
5. Click "Unlock Full Destiny"
6. See Grok-generated personalized advice! 🚀

## What Grok Generates

For the **Premium Tier**, Grok creates:

- **Personalized narrative** (250 words) - Mystical yet actionable
- **3-4 custom strategies** - Specific to your job/industry
- **Key insights** - Data-driven observations
- **Timeline** - 3 months / 1 year / 3 years milestones
- **Resources** - Courses, certifications, communities
- **Warnings** - Things to watch out for
- **Opportunities** - Emerging trends in your field
- **NFT description** - Creative artwork concept

## Example Grok Output

```json
{
  "narrative": "The digital oracle speaks, O Developer of the Modern Age. Your resilience score of 78 marks you as a survivor—but survival alone is not enough. The AI revolution demands partnership, not competition...",
  
  "strategies": [
    {
      "title": "Become an AI Integration Specialist",
      "description": "Position yourself as the bridge between legacy systems and AI. Companies desperately need developers who understand both worlds. Focus on RAG systems, prompt engineering, and AI API integrations.",
      "timeline": "4-6 months",
      "difficulty": "Moderate",
      "impact": "High"
    }
  ],
  
  "keyInsights": [
    "Your 15% automation risk is among the lowest—but don't get comfortable",
    "Mid-career developers with AI skills command 35% higher salaries",
    "The next 2 years will separate AI-native from legacy developers"
  ],
  
  "timeline": {
    "next_3_months": "Complete one AI course, build one production project using LLMs",
    "next_year": "Ship 3 AI-integrated features, contribute to AI open source",
    "next_3_years": "Senior AI/ML Engineer or technical AI consultant"
  }
}
```

## Cost

### Grok Pricing (as of 2025)
- **$5 per million tokens**
- Each premium fortune uses ~2,000-3,000 tokens
- **Cost per fortune**: ~$0.01-0.015

### Your Economics
- Charge users: **$3**
- Cost to you: **~$0.01**
- **Profit margin**: ~99.7% 💰

## Grok vs OpenAI

| Feature | Grok | OpenAI GPT-4o-mini |
|---------|------|-------------------|
| **Pricing** | $5/M tokens | $0.15/M input + $0.60/M output |
| **Speed** | Very fast | Fast |
| **Quality** | Excellent | Excellent |
| **Context** | 128K tokens | 128K tokens |
| **Our Use** | ✅ **Recommended** | Also supported |

Both work great! We've configured the app to auto-detect which API key you have.

## Switching Between Grok and OpenAI

The app automatically uses whichever key is available:

```bash
# Priority order:
# 1. GROK_API_KEY (if set)
# 2. OPENAI_API_KEY (fallback)

# Use Grok
GROK_API_KEY=xai-...

# Use OpenAI instead
# (just remove or comment out GROK_API_KEY)
# OPENAI_API_KEY=sk-proj-...
```

## Troubleshooting

### "LLM generator not available"

**Problem**: API key not being read

**Solution**:
```bash
# Check .env.local exists
ls -la .env.local

# Check key is set
cat .env.local | grep GROK_API_KEY

# Make sure Python server picks it up
source apps/web/venv_fortune/bin/activate
python apps/web/python/llm_generator.py
```

### "Premium features unavailable"

**Problem**: Python server not finding API key

**Solution**:
```bash
# Export to current shell before starting server
export GROK_API_KEY=xai-your-key

# Or use dotenv in Python (already configured)
# Just restart: ./start_dev.sh
```

### "Invalid API key"

**Problem**: Wrong key or typo

**Solution**:
1. Double-check key at https://console.x.ai/
2. Make sure it starts with `xai-`
3. No extra spaces or quotes in .env.local
4. Restart Python server after changing

### Testing Without Premium

If you want to test without LLM:
```bash
# Comment out API keys in .env.local
# GROK_API_KEY=...

# App will still work with free tier (Kaggle data)
# Premium will show "unavailable" message
```

## API Key Security

⚠️ **NEVER commit .env.local to Git!**

It's already in `.gitignore`, but double-check:

```bash
# Verify it's ignored
git status

# Should NOT show .env.local
# If it does, add to .gitignore:
echo ".env.local" >> .gitignore
```

## Deployment

For production:

### Option 1: Environment Variables

Set in your hosting platform (Railway, Render, Vercel):

```bash
GROK_API_KEY=xai-your-production-key
```

### Option 2: Secrets Management

Use proper secrets management:
- **Railway**: Settings → Variables
- **Render**: Environment → Environment Variables
- **Vercel**: Settings → Environment Variables

## Monitoring Usage

Track your Grok API usage:

1. Visit https://console.x.ai/usage
2. Monitor token consumption
3. Set spending alerts

**Expected usage**:
- Free tier: 0 tokens (uses Kaggle only)
- Premium tier: ~2,000 tokens per user
- 1000 premium users = ~2M tokens = **$10**

## Next Steps

1. ✅ Grok API key added to `.env.local`
2. ✅ Kaggle credentials in `~/.kaggle/kaggle.json`
3. 🚀 Run `./start_dev.sh`
4. 🎉 Test premium features!

Enjoy using Grok to generate personalized AI career fortunes! 🔮✨

---

**Questions?** Check the main [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) or [PYTHON_BACKEND_SETUP.md](docs/PYTHON_BACKEND_SETUP.md)

