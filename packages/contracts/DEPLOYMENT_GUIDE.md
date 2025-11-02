# Smart Contract Deployment Guide

Complete guide for deploying the ProphecyToken contract to Base network and integrating it with your AI Fortune Teller app.

## 📋 Prerequisites

Before deploying, make sure you have:

1. **Node.js 18+** installed
2. **npm** or **yarn** package manager
3. **Wallet with ETH** on Base Sepolia (testnet) or Base (mainnet)
4. **Alchemy account** (free) for RPC endpoints
5. **BaseScan API key** (free) for contract verification

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd packages/contracts
npm install
```

### Step 2: Set Up Environment Variables

Add these to your root `.env.local` file (same location as your Next.js app config):

```bash
# In /Users/beuxb/Desktop/Projects/ai-fortune-teller/.env.local

# Your deployer wallet private key (NEVER commit this!)
PRIVATE_KEY=0xyour_private_key_here

# Base Mainnet RPC URL (get from https://www.alchemy.com/)
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# BaseScan API key (get from https://basescan.org/myapikey)
BASESCAN_API_KEY=your_basescan_api_key

# Optional: Only needed if testing on testnet
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

**Note:** The Hardhat config automatically loads from the root `.env.local` file, so you don't need a separate `.env` in the contracts folder.

### Step 3: Compile Contracts

```bash
npm run compile
```

This will:
- Compile your Solidity contracts
- Generate TypeScript types
- Create artifact files in `artifacts/`

### Step 4: Deploy to Base Mainnet (L2)

**Default deployment - deploys directly to Base L2 mainnet:**

```bash
npm run deploy
```

Or explicitly:
```bash
npm run deploy:base
```

You'll see output like:
```
🔮 Deploying ProphecyToken to Base Mainnet (L2)
==========================================

📝 Deploying contracts with account: 0x...
💰 Account balance: 0.1 ETH

📦 Deploying ProphecyToken contract...
⏳ Waiting for deployment confirmation...

✅ ProphecyToken deployed successfully!
📍 Contract Address: 0xABCD1234...
```

**Save the contract address!**

### Step 5: Verify Contract (Optional but Recommended)

```bash
npm run verify 0xABCD1234...
```

Or explicitly:
```bash
npm run verify:base 0xABCD1234...
```

This will verify your contract on BaseScan so users can read the source code.

### Step 6: Test the Contract

1. Visit your contract on BaseScan: `https://basescan.org/address/0xABCD1234...`
2. Test minting via the contract's write functions (you'll need to connect as owner)
3. Test reading prophecy data via the read functions

### Step 7: Optional - Test on Testnet First

If you want to test before deploying to mainnet:

```bash
npm run deploy:testnet
```

Then verify with:
```bash
npm run verify:testnet 0xABCD1234...
```

### Step 8: Update Your App

Add the contract address to your root `.env.local` file:

```bash
# In /Users/beuxb/Desktop/Projects/ai-fortune-teller/.env.local
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xABCD1234...
```

## 🔧 Integration with Next.js App

### Option 1: Server-Side Minting (Recommended)

Create an API route at `apps/web/src/app/api/nft/mint/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const PROPHECY_TOKEN_ABI = [
  {
    name: "mintProphecy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenURI", type: "string" },
      { name: "score", type: "uint256" },
      { name: "occupation", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export async function POST(request: NextRequest) {
  try {
    const { recipient, tokenURI, score, occupation } = await request.json();

    // Initialize wallet client with owner account
    const account = privateKeyToAccount(
      process.env.PRIVATE_KEY as `0x${string}`
    );
    const walletClient = createWalletClient({
      account,
      chain: base, // Base mainnet (L2)
      transport: http(process.env.BASE_RPC_URL),
    });

    // Mint the NFT
    const hash = await walletClient.writeContract({
      address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`,
      abi: PROPHECY_TOKEN_ABI,
      functionName: "mintProphecy",
      args: [recipient, tokenURI, BigInt(score), occupation],
    });

    return NextResponse.json({
      success: true,
      txHash: hash,
      message: "NFT minted successfully!",
    });
  } catch (error: any) {
    console.error("Minting error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Option 2: Client-Side Minting (Advanced)

For client-side minting, use Wagmi hooks. See `example-integration.ts` for examples.

## 📝 Contract Functions Reference

### `mintProphecy(address to, string tokenURI, uint256 score, string occupation)`
- **Access**: Owner only
- **Parameters**:
  - `to`: Address to receive the NFT
  - `tokenURI`: IPFS URI containing NFT metadata JSON
  - `score`: AI resilience score (0-100)
  - `occupation`: User's occupation string
- **Returns**: Token ID of the minted NFT

### `updateProphecy(uint256 tokenId, string newTokenURI, uint256 newScore)`
- **Access**: Owner only
- **Parameters**:
  - `tokenId`: ID of the token to update
  - `newTokenURI`: Updated IPFS URI
  - `newScore`: Updated resilience score (0-100)
- **Effect**: Updates the prophecy data and increments updateCount

### `getProphecy(uint256 tokenId)`
- **Access**: Public (read-only)
- **Returns**: ProphecyData struct with:
  - `resilienceScore`: uint256
  - `occupation`: string
  - `timestamp`: uint256
  - `updateCount`: uint256
  - `recipient`: address

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use separate wallets** - Don't use your main wallet for deployment
3. **Test on testnet first** - Always verify functionality before mainnet
4. **Keep private keys secure** - Use environment variables, never hardcode
5. **Verify contracts** - Makes your contract transparent and trustworthy
6. **Review gas costs** - Minting costs ~0.0001 ETH on Base

## 🐛 Troubleshooting

### "Insufficient funds"
- Make sure your deployer wallet has ETH for gas fees
- Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### "Contract verification failed"
- Make sure `BASESCAN_API_KEY` is set correctly
- Try running verification with constructor arguments if needed

### "Network not found"
- Check your RPC URLs are correct
- Verify your Alchemy keys are valid

### "Compilation errors"
- Make sure OpenZeppelin contracts are installed: `npm install @openzeppelin/contracts`
- Check Solidity version matches (0.8.20)

## 📚 Additional Resources

- [Base Documentation](https://docs.base.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Viem Documentation](https://viem.sh/)
- [BaseScan Explorer](https://basescan.org/)

## ✅ Deployment Checklist

- [ ] Dependencies installed
- [ ] Root `.env.local` file configured with `PRIVATE_KEY`, `BASE_RPC_URL`, and `BASESCAN_API_KEY`
- [ ] Contracts compiled successfully (`npm run compile`)
- [ ] Deployed to Base Mainnet (L2) (`npm run deploy`)
- [ ] Contract verified on BaseScan (`npm run verify`)
- [ ] Contract address added to root `.env.local` as `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
- [ ] API route created for minting
- [ ] Tested integration with app
- [ ] Ready for production!

---

Need help? Check the contract README or open an issue on GitHub.

