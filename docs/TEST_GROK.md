# Testing Grok Integration

Quick test to verify your Grok API key is working!

## Step 1: Verify Environment

```bash
# Check that your .env.local exists
ls -la /Users/beuxb/Desktop/Projects/ai-fortune-teller/.env.local

# It should show the file with your Grok API key
```

## Step 2: Test Python Backend Directly

```bash
cd /Users/beuxb/Desktop/Projects/ai-fortune-teller

# Activate virtual environment
source apps/web/venv_fortune/bin/activate

# Test LLM generator directly
python apps/web/python/llm_generator.py
```

**Expected output:**
```
📄 Loading environment from .env.local
🤖 Using Grok (xAI) for LLM generation
Testing with grok - grok-beta

=== Test: Resilience Score ===
Generating premium fortune...
{
  "narrative": "The digital oracle speaks...",
  "strategies": [...],
  ...
}
```

## Step 3: Start Full Application

```bash
# From project root
./start_dev.sh
```

**Expected output:**
```
🐍 Starting Python backend (http://localhost:5000)...
📄 Loading environment from .env.local
🤖 Using Grok (xAI) for LLM generation
✅ LLM generator initialized: grok
✅ Python backend running

⚡ Starting Next.js frontend (http://localhost:3000)...
```

## Step 4: Test in Browser

1. Visit: **http://localhost:3000**
2. Complete the quiz (5 questions)
3. View free results (Kaggle data)
4. Click "Get Premium Fortune"
5. Click "Connect Wallet" (testing mode)
6. Click "Unlock Full Destiny"
7. See **Grok-generated** personalized advice! 🎉

## What You Should See

### Free Tier (Kaggle Data)
- AI Resilience Score (e.g., 78/100)
- Automation Risk: 15%
- Growth Projection: +25%
- Salary Analysis: $95k → $120k
- Data-driven narrative

### Premium Tier (Grok-Powered)
- ✨ **Personalized prophecy** (250 words from Grok)
- 🎯 **3-4 custom strategies** with timelines
- 💡 **Key insights** about your specific situation
- ⚠️ **Warnings** to watch for
- 📚 **Resources** (courses, certs)
- 🗓️ **Timeline** (3 months / 1 year / 3 years)
- 🎨 **NFT description** (creative artwork concept)

## Troubleshooting

### "LLM generator not available"

❌ **Issue**: Can't find GROK_API_KEY

✅ **Solution**:
```bash
# Check your .env.local
cat .env.local

# Should contain:
# GROK_API_KEY=xai-...

# If not, add it:
echo "GROK_API_KEY=xai-your-actual-key" >> .env.local
```

### "Invalid API key"

❌ **Issue**: Wrong key format or expired

✅ **Solution**:
1. Visit https://console.x.ai/
2. Verify your API key
3. Make sure it starts with `xai-`
4. Copy exactly (no spaces)

### "Module 'dotenv' not found"

❌ **Issue**: Missing python-dotenv package

✅ **Solution**:
```bash
source apps/web/venv_fortune/bin/activate
pip install python-dotenv
```

### Test Premium Without Paying

For development, the payment is simulated:

1. Complete quiz → see free results
2. Click "Get Premium"
3. Click "Connect Wallet" → works without real wallet
4. Click "Pay $3" → simulated success
5. See premium content powered by Grok!

## Quick Test Command

One-liner to test everything:

```bash
cd /Users/beuxb/Desktop/Projects/ai-fortune-teller && source apps/web/venv_fortune/bin/activate && python apps/web/python/llm_generator.py
```

## Success Indicators

✅ Python loads `.env.local`
✅ Grok API key detected
✅ "Using Grok (xAI) for LLM generation"
✅ Test fortune generates successfully
✅ Browser shows premium content

## Cost Tracking

Monitor your Grok usage:
- Visit: https://console.x.ai/usage
- Each premium fortune: ~2,000-3,000 tokens
- Cost per fortune: ~$0.01
- Your profit: $3 - $0.01 = $2.99 per user 💰

## Next Steps

Once verified:
1. Test with different job roles
2. Customize prompts in `llm_generator.py`
3. Deploy to production
4. Monitor usage & costs

---

**Ready?** Run: `./start_dev.sh` 🚀

Your Grok-powered AI Fortune Teller is ready to predict career futures! 🔮✨

