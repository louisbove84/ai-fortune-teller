# Farcaster Mini App Setup Guide

This guide walks through publishing AI Fortune Teller as a Farcaster Mini App using hosted manifests.

## Prerequisites

- Domain name (e.g., `aifortuneteller.xyz`)
- Farcaster account with FID
- Vercel account for deployment

## Step 1: Configure Domain

1. Register domain via Namecheap, GoDaddy, or similar
2. Point DNS to Vercel:
   - Add A record: `76.76.21.21`
   - Add CNAME: `cname.vercel-dns.com`

## Step 2: Create Hosted Manifest

1. Go to https://farcaster.xyz/~/developers/mini-apps/manifest
2. Click "Create Hosted Manifest"
3. Fill in details:

```json
{
  "accountAssociation": {
    "header": "<generated>",
    "payload": "<generated>",
    "signature": "<generated>"
  },
  "frame": {
    "version": "1",
    "name": "AI Fortune Teller",
    "iconUrl": "https://aifortuneteller.xyz/icon-1024.png",
    "homeUrl": "https://aifortuneteller.xyz",
    "splashImageUrl": "https://aifortuneteller.xyz/splash-200.png",
    "splashBackgroundColor": "#1a1a2e",
    "webhookUrl": "https://aifortuneteller.xyz/api/webhook"
  },
  "metadata": {
    "subtitle": "Peer into your AI career fate",
    "description": "Quiz your job's future against AI disruption. Unlock strategies & personalized NFTs visualizing your AI-proof future.",
    "primaryCategory": "productivity",
    "tags": ["ai", "career", "fortune", "nft", "web3"],
    "screenshots": [
      "https://aifortuneteller.xyz/screenshots/quiz.png",
      "https://aifortuneteller.xyz/screenshots/result.png",
      "https://aifortuneteller.xyz/screenshots/nft.png"
    ],
    "requiredChains": ["eip155:8453"],
    "requiredCapabilities": ["actions.signIn", "wallet.getEthereumProvider"],
    "noindex": false
  }
}
```

4. Save and copy your `hosted-manifest-id`

## Step 3: Configure Next.js Redirect

Your `next.config.js` already includes this redirect:

```javascript
async redirects() {
  return [
    {
      source: '/.well-known/farcaster.json',
      destination: `https://api.farcaster.xyz/miniapps/hosted-manifest/${process.env.HOSTED_MANIFEST_ID}`,
      permanent: false,
    },
  ];
}
```

Add to `.env`:
```
HOSTED_MANIFEST_ID=your_manifest_id_here
```

## Step 4: Generate Assets

### Icon (1024x1024)
- No transparency
- PNG format
- Crystal ball or fortune teller theme
- Save as `public/icon-1024.png`

### Splash Screen (200x200)
- PNG format
- Mystical/starry theme
- Save as `public/splash-200.png`

### Screenshots (1284x2778 portrait)
1. Quiz page with questions
2. Result page with score
3. Premium NFT page

Save in `public/screenshots/`

## Step 5: Verify Account Association

1. Install Warpcast CLI: `npm install -g @farcaster/cli`
2. Generate association:
```bash
farcaster verify-domain aifortuneteller.xyz --fid YOUR_FID
```
3. Copy output to manifest's `accountAssociation` field

## Step 6: Deploy to Vercel

```bash
# Connect to Vercel
vercel link

# Add environment variables
vercel env add HOSTED_MANIFEST_ID
vercel env add CDP_API_KEY
vercel env add NEXT_PUBLIC_NFT_CONTRACT_ADDRESS

# Deploy
vercel --prod
```

## Step 7: Test Manifest

1. Visit: `https://aifortuneteller.xyz/.well-known/farcaster.json`
2. Should redirect to Farcaster's hosted manifest
3. Validate at: https://miniapps.farcaster.xyz/docs/guides/publishing

## Step 8: Submit for Review

1. In Farcaster Developer Portal, click "Submit for Review"
2. Wait for approval (usually 24-48 hours)
3. Once approved, your app appears in Farcaster App Store

## Step 9: Test in Warpcast

1. Open Warpcast mobile app
2. Go to Mini Apps section
3. Search "AI Fortune Teller"
4. Test full flow: quiz → result → payment → NFT

## Hybrid Detection (Optional)

To make app work both standalone and as Farcaster Mini App:

```typescript
// In layout.tsx
const isMiniApp = pathname.startsWith('/mini') || searchParams.get('miniApp');

useEffect(() => {
  if (isMiniApp) {
    import('@farcaster/frame-sdk').then(({ default: sdk }) => {
      sdk.ready();
    });
  }
}, [isMiniApp]);
```

## Updating Manifest

With hosted manifests, you can update metadata WITHOUT redeploying:

1. Go to Developer Portal
2. Edit manifest fields
3. Save - changes apply immediately

Only redeploy if changing app logic.

## Troubleshooting

### Manifest 404
- Check HOSTED_MANIFEST_ID in env
- Verify redirect in next.config.js
- Ensure domain DNS is correct

### Account Association Failed
- Regenerate with correct FID
- Check signature validity
- Try different verification method

### App Not Loading in Warpcast
- Check console for SDK errors
- Verify requiredCapabilities
- Test on Base Sepolia first

## Resources

- [Farcaster Mini App Docs](https://miniapps.farcaster.xyz/docs)
- [Warpcast Developer Portal](https://farcaster.xyz/~/developers)
- [Base Network Docs](https://docs.base.org)

