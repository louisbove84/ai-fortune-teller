# ProphecyToken Contract Deployment

## 🎉 Successfully Deployed!

**Contract Address:** `0xF473d3813A804809dC924936383c7F638b2B696f`

**Network:** Base Mainnet (L2)  
**Chain ID:** 8453  
**Deployment TX:** [0x375e953...](https://basescan.org/tx/0x375e953fbd55b6aa04bbc4f06054c12cdfa140368c85becf3aec1b0bb83df82d)

## 📋 Contract Details

- **Mint Price:** 0.001 ETH per NFT
- **Fee Structure:**
  - 10% to platform: `0x3b583CA8953effcF2135679886A9965754954204`
  - 90% to contract owner: `0xD2E7839C926A9A34987E3A862681Ca52fe63c4e6`
- **Token Name:** AI Fortune Prophecy
- **Token Symbol:** PROPHECY

## 🔧 Setup Instructions

### 1. Update Local Environment

Create or update `/Users/beuxb/Desktop/Projects/ai-fortune-teller/.env.local`:

```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xF473d3813A804809dC924936383c7F638b2B696f
```

### 2. Update Vercel Environment Variables

Go to your Vercel project settings and add:

```
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xF473d3813A804809dC924936383c7F638b2B696f
```

Then redeploy your app.

## ✅ What Works Now

1. **User connects wallet** on home page
2. **Fortune is displayed** with ticket flip animation  
3. **Image is captured** and uploaded to Pinata IPFS
4. **Metadata is created** with image URL and uploaded to IPFS
5. **Mint button appears** showing "Mint Your Prophecy NFT (0.001 ETH)"
6. **User pays 0.001 ETH:**
   - 0.0001 ETH (10%) → Your platform address
   - 0.0009 ETH (90%) → Contract owner
7. **NFT is minted** on Base network with the fortune ticket image

## 🔗 Links

- **Contract on BaseScan:** https://basescan.org/address/0xF473d3813A804809dC924936383c7F638b2B696f
- **Verify Contract (optional):**
  ```bash
  cd packages/contracts
  npm run verify:base 0xF473d3813A804809dC924936383c7F638b2B696f
  ```

## 💡 Testing

1. Make sure `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` is set
2. Restart your dev server: `npm run dev`
3. Connect wallet (must be on Base network)
4. Complete quiz and view fortune
5. Click "Mint Your Prophecy NFT (0.001 ETH)"
6. Approve transaction in wallet
7. Wait for confirmation (~2 seconds on Base L2)

## 🎯 Revenue

Every mint generates **0.0001 ETH profit** for you automatically sent to:  
`0x3b583CA8953effcF2135679886A9965754954204`

No manual withdrawals needed - fees are distributed on every mint!

