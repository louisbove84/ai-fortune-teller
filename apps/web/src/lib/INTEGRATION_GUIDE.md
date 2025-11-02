# Smart Contract Integration Guide

This guide explains how the ProphecyToken contract is integrated with your AI Fortune Teller app.

## Architecture Overview

```
User completes quiz
    ↓
Result page displays fortune
    ↓
User clicks "Mint NFT" (optional)
    ↓
Frontend calls /api/nft/mint
    ↓
API route uses viem to call contract.mintProphecy()
    ↓
NFT minted on Base L2
    ↓
User receives ProphecyToken NFT
```

## Files Created

### 1. `/apps/web/src/lib/contracts.ts`
Contract utilities with:
- Contract ABI definitions
- `mintProphecyNFT()` - Mint new NFTs
- `updateProphecyNFT()` - Update existing NFTs
- `getProphecyData()` - Read NFT data

### 2. `/apps/web/src/app/api/nft/mint/route.ts`
API route for minting NFTs:
- Validates input (address, tokenURI, score, occupation)
- Calls contract to mint NFT
- Returns transaction hash and token ID

### 3. `/apps/web/src/components/MintNFTButton.tsx`
React component for minting UI:
- Handles minting flow
- Shows loading/success/error states
- Can be integrated into result page

## Environment Variables Required

Make sure these are set in your `.env.local`:

```bash
# Contract address (already set after deployment)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x6a70a49B7d97c74d7B02eAc37DBC80c9B8a7054F

# RPC URL for Base (for contract reads)
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY

# Private key of contract owner (for minting)
# This should be the same key used to deploy the contract
PRIVATE_KEY=0x...
```

## Usage Examples

### Example 1: Mint NFT from Result Page

Add to your result page (`/apps/web/src/app/result/page.tsx`):

```typescript
import MintNFTButton from "@/components/MintNFTButton";

// In your component:
const [userAddress, setUserAddress] = useState<string | null>(null);

// When user connects wallet (you'll need wallet connection logic):
// setUserAddress(walletAddress);

// In your JSX:
{userAddress && (
  <MintNFTButton
    recipient={userAddress}
    tokenURI={`ipfs://Qm...`} // Your IPFS metadata URI
    score={result.score}
    occupation={answers.job_title}
    onSuccess={(tokenId, txHash) => {
      console.log("NFT minted!", { tokenId, txHash });
      // Show success message or redirect
    }}
    onError={(error) => {
      console.error("Minting failed:", error);
      // Show error message
    }}
  />
)}
```

### Example 2: Mint NFT from API Route (Server-Side)

You can also mint NFTs server-side from any API route:

```typescript
import { mintProphecyNFT } from "@/lib/contracts";

export async function POST(request: Request) {
  const { recipient, tokenURI, score, occupation } = await request.json();
  
  const result = await mintProphecyNFT(
    recipient,
    tokenURI,
    score,
    occupation
  );
  
  return Response.json({
    success: true,
    tokenId: result.tokenId,
    txHash: result.txHash,
  });
}
```

### Example 3: Read NFT Data

```typescript
import { getProphecyData } from "@/lib/contracts";

// Get prophecy data for token ID 1
const data = await getProphecyData(BigInt(1));
console.log(data);
// {
//   resilienceScore: 85,
//   occupation: "Software Engineer",
//   timestamp: 1234567890,
//   updateCount: 0,
//   recipient: "0x..."
// }
```

## Creating NFT Metadata

Before minting, you need to create and upload NFT metadata to IPFS. The metadata should follow the ERC-721 standard:

```json
{
  "name": "AI Fortune Prophecy #1",
  "description": "Your career resilience assessment in the age of AI",
  "image": "ipfs://Qm...", // Image URL (if you have one)
  "attributes": [
    {
      "trait_type": "Resilience Score",
      "value": 85
    },
    {
      "trait_type": "Occupation",
      "value": "Software Engineer"
    },
    {
      "trait_type": "Risk Level",
      "value": "Low"
    }
  ]
}
```

Upload this JSON to IPFS (using Pinata or similar), then use the IPFS URI (`ipfs://Qm...`) as the `tokenURI` when minting.

## Wallet Connection

To get the user's wallet address, you'll need to add wallet connection. Options:

1. **Wagmi** (recommended for Ethereum/Base):
   ```bash
   npm install wagmi viem @tanstack/react-query
   ```

2. **Coinbase Wallet SDK** (for AgentKit integration):
   Already mentioned in your architecture docs

3. **Simple prompt** (for testing):
   ```typescript
   const address = prompt("Enter your wallet address:");
   ```

## Testing

1. **Test the API route**:
   ```bash
   curl -X POST http://localhost:3000/api/nft/mint \
     -H "Content-Type: application/json" \
     -d '{
       "recipient": "0x...",
       "tokenURI": "ipfs://Qm...",
       "score": 85,
       "occupation": "Software Engineer"
     }'
   ```

2. **Check contract on BaseScan**:
   Visit: https://basescan.org/address/0x6a70a49B7d97c74d7B02eAc37DBC80c9B8a7054F

3. **View minted NFTs**:
   - On BaseScan: https://basescan.org/address/YOUR_ADDRESS#tokentxnsErc721
   - Or integrate with OpenSea: https://opensea.io/assets/base/0x6a70a49B7d97c74d7B02eAc37DBC80c9B8a7054F/1

## Next Steps

1. ✅ Contract deployed and verified
2. ✅ API route created
3. ✅ Component created
4. ⏳ Add wallet connection to your app
5. ⏳ Create IPFS metadata upload service
6. ⏳ Integrate minting button into result page
7. ⏳ Test full flow end-to-end

## Security Notes

- ✅ `PRIVATE_KEY` is only used server-side (never exposed to client)
- ✅ All contract writes happen server-side via API routes
- ✅ Input validation on all API endpoints
- ⚠️ Make sure `.env.local` is in `.gitignore`
- ⚠️ Use environment variables for all sensitive data

## Troubleshooting

**"Contract address not configured"**
- Make sure `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` is in `.env.local`

**"PRIVATE_KEY not set"**
- Add your deployer wallet's private key to `.env.local`

**"Insufficient funds"**
- Make sure your deployer wallet has ETH on Base for gas fees

**"Invalid recipient address"**
- Ensure wallet address is a valid Ethereum address starting with `0x`

