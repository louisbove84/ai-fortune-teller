# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Environment Variables

Add these to your Vercel project settings:

```bash
# Required for Grok LLM (Premium Features)
GROK_API_KEY=your_grok_api_key_here

# Optional: If using OpenAI instead
# OPENAI_API_KEY=your_openai_api_key_here

# Kaggle API (for dataset updates - optional)
# KAGGLE_USERNAME=your_kaggle_username
# KAGGLE_KEY=your_kaggle_key

# Python API URL (set automatically by Vercel)
PYTHON_API_URL=http://localhost:5001
```

### Deploy Steps

1. **Push to GitHub** (already done)
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the repository: `louisbove84/ai-fortune-teller`

3. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Set Environment Variables**
   - Add `GROK_API_KEY` with your xAI API key
   - Add any other required variables

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Post-Deployment

1. **Update Farcaster Configuration**
   - Once deployed, note your Vercel URL (e.g., `ai-fortune-teller.vercel.app`)
   - Update `apps/web/public/.well-known/farcaster.json` with your actual domain
   - Push changes and redeploy

2. **Test Your Frame**
   - Visit your deployed URL
   - Test the fortune teller functionality
   - Verify the Farcaster frame loads correctly

3. **Register with Farcaster**
   - Go to Farcaster Mini Apps registration
   - Submit your frame URL
   - Wait for approval

## Python Backend Note

⚠️ **Important**: The Python backend runs locally for development. For production:
- The free fortune feature works without the Python backend (uses Next.js API routes)
- Premium features (Grok LLM) require the Python backend
- Consider deploying the Python backend separately (Railway, Render, etc.)
- Or integrate the Python logic directly into Next.js API routes

## Custom Domain (Optional)

If you want a custom domain:
1. Add your domain in Vercel project settings
2. Update DNS records
3. Update `farcaster.json` with your new domain
4. Regenerate account association signature

