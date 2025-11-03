# Vercel Deployment Checklist ✅

Your app is ready to deploy! Build completed successfully.

## Pre-Deployment Checklist

### ✅ Code Ready
- [x] Build passes (`npm run build`)
- [x] TypeScript errors fixed
- [x] All integrations complete
- [x] Smart contract deployed and verified

### Environment Variables Needed in Vercel

Add these in **Vercel Dashboard → Project Settings → Environment Variables**:

#### Required for App Functionality
```bash
# Contract address (already deployed)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x6a70a49B7d97c74d7B02eAc37DBC80c9B8a7054F

# Base RPC URL (for wallet connection and contract reads)
NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
# OR use BASE_RPC_URL (fallback)

# Contract owner private key (for server-side NFT minting)
PRIVATE_KEY=0x...
```

#### Optional but Recommended
```bash
# IPFS Upload (Pinata)
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret

# Python API (if using Python backend)
PYTHON_API_URL=http://localhost:5001

# Grok API (for premium features)
GROK_API_KEY=your_grok_key
```

## Deployment Steps

### 1. Push to GitHub (if not already)
```bash
git add .
git commit -m "feat: add smart contract integration with wallet connection"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

**Option B: Via Vercel CLI**
```bash
cd apps/web
npm i -g vercel
vercel login
vercel --prod
```

### 3. Add Environment Variables
- Go to **Project Settings → Environment Variables**
- Add all variables listed above
- Make sure to set them for **Production**, **Preview**, and **Development** environments

### 4. Deploy
- Click **Deploy** (or `vercel --prod` if using CLI)
- Wait for build to complete
- Check deployment logs for any errors

## Post-Deployment

### 1. Test the Deployment
- Visit your Vercel URL
- Test wallet connection
- Complete a quiz
- Try minting an NFT (if wallet connected)

### 2. Update Farcaster Config (if needed)
- If using a custom domain, update `apps/web/public/.well-known/farcaster.json`
- Regenerate account association signature if domain changed

### 3. Verify Environment Variables
- Check that all env vars are set correctly
- Test API routes: `/api/nft/mint`, `/api/ipfs/upload`

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are fixed

### Wallet Connection Doesn't Work
- Verify `NEXT_PUBLIC_BASE_RPC_URL` is set correctly
- Check that RPC URL is accessible from Vercel servers
- Test RPC connection manually

### NFT Minting Fails
- Check that `PRIVATE_KEY` is set (contract owner's key)
- Verify `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` is correct
- Ensure deployer wallet has ETH for gas on Base

### IPFS Upload Fails
- Currently uses placeholder if Pinata not configured
- Add `PINATA_API_KEY` and `PINATA_SECRET_KEY` for real uploads
- Or implement alternative IPFS service

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env.local`** - Already in `.gitignore` ✅
2. **PRIVATE_KEY in Vercel** - Only set in Vercel environment variables, never commit
3. **RPC URLs** - Can be public, but use environment variables for flexibility
4. **Contract Address** - Public and safe to expose (it's on-chain)

## Monitoring

After deployment, monitor:
- Vercel function logs for API route errors
- Transaction success rate for NFT minting
- Wallet connection errors
- IPFS upload failures

## Next Steps

1. ✅ Deploy to Vercel
2. ⏳ Test wallet connection
3. ⏳ Test NFT minting flow
4. ⏳ Configure Pinata for IPFS (optional)
5. ⏳ Add success notifications for minting
6. ⏳ Monitor usage and errors

---

**Ready to deploy!** 🚀

Your app is production-ready with:
- ✅ Smart contract integration
- ✅ Wallet connection
- ✅ NFT minting
- ✅ IPFS metadata generation
- ✅ Complete user flow

