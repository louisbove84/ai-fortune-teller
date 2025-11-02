# ProphecyToken Smart Contract

ERC-721 NFT contract for the AI Fortune Teller app. Each NFT represents a user's career resilience assessment with updatable metadata.

## Features

- **ERC-721 Standard**: Compatible with OpenSea and other NFT marketplaces
- **Updatable Metadata**: Users can update their prophecy after upskilling
- **On-chain Data**: Stores resilience score, occupation, timestamp, and update count
- **Owner-only Minting**: Prevents spam and ensures quality control

## Contract Functions

### `mintProphecy(address to, string tokenURI, uint256 score, string occupation)`
Mints a new prophecy NFT to the specified address.

### `updateProphecy(uint256 tokenId, string newTokenURI, uint256 newScore)`
Updates an existing prophecy's metadata and score.

### `getProphecy(uint256 tokenId)`
Returns all prophecy data for a given token ID.

## Deployment

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Add environment variables to your root `.env.local` file (same location as your Next.js app config):
```bash
# In /Users/beuxb/Desktop/Projects/ai-fortune-teller/.env.local
PRIVATE_KEY=your_deployer_private_key_here
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BASESCAN_API_KEY=your_basescan_api_key

# Optional: For testnet testing
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### Deploy to Base Mainnet (L2)

**Default deployment - deploys to Base L2 mainnet:**

```bash
npm run deploy
```

Or explicitly:
```bash
npm run deploy:base
```

### Deploy to Base Sepolia (Testnet - Optional)

Only if you want to test first:

```bash
npm run deploy:testnet
```

### Verify Contract

After deployment, verify the contract on BaseScan:

```bash
# For testnet
npm run verify:base-sepolia <CONTRACT_ADDRESS>

# For mainnet
npm run verify:base <CONTRACT_ADDRESS>
```

## Integration with Next.js App

After deployment, add the contract address to your `.env`:

```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
```

Then use it in your app via Wagmi/Viem. See `../apps/web/src/lib/contracts.ts` for integration examples.

## Testing

```bash
npm test
```

## Contract Addresses

After deployment, the contract address will be saved to `deployment-info.json`. Update your app's environment variables with this address.

