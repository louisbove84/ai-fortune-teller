# @ai-fortune-teller/agent

AgentKit integration package for AI Fortune Teller, providing wallet operations, payments, and NFT minting via Coinbase Developer Platform (CDP).

## Setup

1. Get your CDP API credentials from: https://portal.cdp.coinbase.com/projects/overview?projectId=ce1e49f3-df98-4102-bb14-aba0df7a918b

2. Add to `.env`:
```
CDP_API_KEY_NAME=your_api_key_name
CDP_API_PRIVATE_KEY=your_api_private_key
AGENT_WALLET_ID=your_wallet_id_after_first_init
```

## Usage

```typescript
import { agent } from "@ai-fortune-teller/agent";

// Initialize wallet
await agent.initializeWallet();

// Get address
const address = await agent.getAddress();

// Mint NFT
const result = await agent.mintNFT(
  contractAddress,
  recipientAddress,
  tokenURI,
  resilienceScore,
  occupation
);
```

## Features

- 🔐 Wallet management (create/load)
- 💰 Payment processing
- 🎨 NFT minting via ProphecyToken contract
- 📦 IPFS uploads
- 🔍 Balance checking

## Notes

Current implementation includes placeholders for:
- Transaction signing and broadcasting
- IPFS integration (use Pinata separately)
- Real payment verification

Integrate with actual CDP AgentKit SDK for production deployment.

