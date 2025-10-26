# Deployment Guide

Complete step-by-step deployment guide for AI Fortune Teller to production.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git repository created
- [ ] Domain registered (e.g., aifortuneteller.xyz)
- [ ] Vercel account created
- [ ] Coinbase Developer Platform account
- [ ] Wallet with ETH on Base (for contract deployment)
- [ ] Farcaster account with FID
- [ ] Pinata account (for IPFS)

## Phase 1: Local Setup & Testing

### 1.1 Install Dependencies

```bash
cd ai-fortune-teller
npm install
```

### 1.2 Configure Environment

Create `.env`:

```bash
# Get from https://portal.cdp.coinbase.com/projects/overview?projectId=ce1e49f3-df98-4102-bb14-aba0df7a918b
CDP_API_KEY_NAME=organizations/{org_id}/apiKeys/{key_id}
CDP_API_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----"

# Get from Alchemy.com (create app for Base Sepolia + Base Mainnet)
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Get from https://basescan.org/myapikey
BASESCAN_API_KEY=YOUR_BASESCAN_KEY

# Deployer wallet (NEVER commit this!)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Pinata (get from https://app.pinata.cloud/keys)
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret

# Will fill later
HOSTED_MANIFEST_ID=
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=
NEXT_PUBLIC_APP_URL=https://aifortuneteller.xyz
```

### 1.3 Test Locally

```bash
# Run dev server
npm run dev

# In another terminal, test contract compilation
cd packages/contracts
npx hardhat compile

# Run tests
npx hardhat test
```

Visit `http://localhost:3000` and complete a full quiz flow.

## Phase 2: Smart Contract Deployment

### 2.1 Fund Deployer Wallet

Send ETH to your deployer wallet:
- **Testnet**: Get free ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- **Mainnet**: Bridge ETH to Base via [bridge.base.org](https://bridge.base.org)

### 2.2 Deploy to Testnet

```bash
cd packages/contracts

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.ts --network base-sepolia
```

Output:
```
ProphecyToken deployed to: 0xABCD1234...
```

Save this address!

### 2.3 Verify Contract

```bash
npx hardhat verify --network base-sepolia 0xABCD1234...
```

View on BaseScan: https://sepolia.basescan.org/address/0xABCD1234...

### 2.4 Deploy to Mainnet (When Ready)

```bash
# DOUBLE CHECK: You're spending real ETH!
npx hardhat run scripts/deploy.ts --network base

# Verify
npx hardhat verify --network base <ADDRESS>
```

### 2.5 Update Environment

Add to `.env`:
```
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xABCD1234...
```

## Phase 3: Vercel Deployment

### 3.1 Connect Repository

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial commit: AI Fortune Teller"

# Push to GitHub
git remote add origin https://github.com/yourusername/ai-fortune-teller.git
git push -u origin main
```

### 3.2 Deploy to Vercel

**Option A: CLI**
```bash
npm i -g vercel
vercel login
vercel
```

**Option B: Dashboard**
1. Visit [vercel.com/new](https://vercel.com/new)
2. Import Git repository
3. Framework: Next.js
4. Root Directory: `apps/web`
5. Click "Deploy"

### 3.3 Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

Add all variables from `.env` (except `PRIVATE_KEY` - never expose!):

```
CDP_API_KEY_NAME=...
CDP_API_PRIVATE_KEY=...
BASE_RPC_URL=...
BASE_SEPOLIA_RPC_URL=...
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=...
NEXT_PUBLIC_APP_URL=https://aifortuneteller.xyz
PINATA_API_KEY=...
PINATA_SECRET_KEY=...
HOSTED_MANIFEST_ID=(add after Farcaster setup)
```

### 3.4 Configure Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `aifortuneteller.xyz`
3. Configure DNS at your registrar:
   - Type: A, Name: @, Value: `76.76.21.21`
   - Type: CNAME, Name: www, Value: `cname.vercel-dns.com`
4. Wait for propagation (5-60 minutes)

### 3.5 Redeploy

```bash
vercel --prod
```

Visit `https://aifortuneteller.xyz` - should be live!

## Phase 4: Farcaster Mini App Setup

See [FARCASTER_SETUP.md](FARCASTER_SETUP.md) for detailed guide.

### 4.1 Create Assets

Generate/design:
1. **Icon**: 1024x1024 PNG (no alpha) → `public/icon-1024.png`
2. **Splash**: 200x200 PNG → `public/splash-200.png`
3. **Screenshots**: 3 images, 1284x2778 → `public/screenshots/`

### 4.2 Create Hosted Manifest

1. Go to https://farcaster.xyz/~/developers/mini-apps/manifest
2. Fill form:
   - Name: "AI Fortune Teller"
   - Domain: aifortuneteller.xyz
   - Category: productivity
   - Tags: ai, career, fortune, nft, web3
3. Upload assets
4. Copy `HOSTED_MANIFEST_ID`

### 4.3 Verify Domain

```bash
# Install Farcaster CLI
npm install -g @farcaster/cli

# Verify
farcaster verify-domain aifortuneteller.xyz --fid YOUR_FID
```

Copy output to manifest's `accountAssociation` field.

### 4.4 Update Vercel Environment

Add:
```
HOSTED_MANIFEST_ID=1234567890
```

Redeploy:
```bash
vercel --prod
```

### 4.5 Test Manifest

Visit: https://aifortuneteller.xyz/.well-known/farcaster.json

Should redirect to Farcaster's API.

### 4.6 Submit for Review

1. Farcaster Developer Portal → Submit
2. Wait 24-48 hours for approval
3. Monitor email for updates

## Phase 5: Testing & Monitoring

### 5.1 Test Full Flow

**Desktop**:
1. Visit https://aifortuneteller.xyz
2. Complete quiz → Get free result
3. Click premium → Connect wallet
4. Pay $3 → Receive strategies + NFT

**Farcaster (after approval)**:
1. Open Warpcast app
2. Mini Apps → Search "AI Fortune Teller"
3. Complete same flow

### 5.2 Set Up Monitoring

**Vercel Analytics**:
- Enable in Project Settings
- Track page views, errors

**Alchemy Dashboard**:
- Monitor RPC requests
- Set up alerts for rate limits

**BaseScan**:
- Watch contract transactions
- Monitor gas usage

### 5.3 Set Up Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

## Phase 6: Post-Launch

### 6.1 Marketing

- [ ] Post on Farcaster about launch
- [ ] Share on X (Twitter)
- [ ] Submit to Farcaster Frame/Mini App directories
- [ ] Post on r/ethereum, r/base

### 6.2 Monitor Metrics

Track:
- Daily active users
- Quiz completion rate
- Free-to-paid conversion (target: 20%)
- NFTs minted
- Gas costs (optimize if needed)

### 6.3 Iterate

Based on feedback:
- Adjust quiz questions
- Improve narrative quality
- Add more strategies
- Optimize gas usage

## Troubleshooting

### Contract Deployment Fails

**Error**: "Insufficient funds"
- Solution: Add more ETH to deployer wallet

**Error**: "Nonce too high"
- Solution: Reset MetaMask account or wait

### Vercel Build Fails

**Error**: "Module not found"
- Solution: Check `package.json` dependencies, ensure workspace setup correct

**Error**: "Environment variable missing"
- Solution: Add all required vars in Vercel dashboard

### Farcaster Manifest 404

**Error**: Redirect not working
- Solution: Check `HOSTED_MANIFEST_ID`, verify `next.config.js` redirect

### NFT Minting Fails

**Error**: "Transaction reverted"
- Solution: Check contract address, ensure wallet has ETH for gas

## Rollback Plan

If critical bug found:

```bash
# Revert Vercel deployment
vercel rollback

# Or redeploy previous commit
git revert HEAD
git push
vercel --prod
```

## Security Checklist

- [ ] `.env` added to `.gitignore`
- [ ] Private keys never committed
- [ ] API keys rotated after sharing
- [ ] Smart contract audited (for mainnet)
- [ ] Rate limiting on API routes
- [ ] CORS configured properly

## Support

Post-deployment issues:
- Check [GitHub Issues](https://github.com/yourusername/ai-fortune-teller/issues)
- Farcaster: @yourhandle
- Email: hello@aifortuneteller.xyz

---

**Deployment Complete! 🎉**

Monitor your app at:
- Frontend: https://aifortuneteller.xyz
- Vercel: https://vercel.com/dashboard
- BaseScan: https://basescan.org/address/YOUR_CONTRACT
- Farcaster: Warpcast Mini Apps

