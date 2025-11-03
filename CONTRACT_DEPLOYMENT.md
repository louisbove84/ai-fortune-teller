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

Create or update `.env.local` in the project root:

```bash
cd /Users/beuxb/Desktop/Projects/ai-fortune-teller
echo "NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xF473d3813A804809dC924936383c7F638b2B696f" > .env.local
```

**Note:** The contract address is also hardcoded as a fallback in `MintNFTButton.tsx`, so it will work even without the env variable.

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

1. Restart your dev server: `npm run dev`
2. Connect wallet at the home page
3. **If not on Base network**, you'll see a "Switch to Base Network" button - click it
4. Complete quiz and view fortune
5. Image will be captured and uploaded to IPFS automatically
6. You'll see "Mint Your Prophecy NFT (0.001 ETH)" button
7. Click mint and approve in your wallet
8. Wait for confirmation (~2 seconds on Base L2)
9. Check transaction on BaseScan!

## 🔒 Network Enforcement

The mint button now **strictly enforces** Base network:
- If wallet not connected → Shows "Connect your wallet" message
- If on wrong network → Shows "Switch to Base Network to Mint" button
- If on Base → Shows mint button (0.001 ETH)

This prevents transactions from being sent to Ethereum mainnet by mistake!

## 🎯 Revenue

Every mint generates **0.0001 ETH profit** for you automatically sent to:  
`0x3b583CA8953effcF2135679886A9965754954204`

No manual withdrawals needed - fees are distributed on every mint!

