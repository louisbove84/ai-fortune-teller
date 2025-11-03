# 🔮 AI Fortune Teller - Farcaster Mini App

A gamified career resilience assessment tool styled as a vintage fortune teller. Built for Farcaster as a Mini App, deployed on Base (Coinbase L2).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Base Network](https://img.shields.io/badge/Base-Mainnet-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

## 🌟 Overview

AI Fortune Teller helps users assess their career's resilience against AI disruption through an engaging, mystical quiz experience. Users receive:

- **Free Tier**: Basic AI resilience score (0-100) with narrative prophecy
- **Premium Tier ($3 in ETH)**: 
  - Detailed AI-proof strategies
  - Interactive career fate map
  - Personalized NFT ("Retirement Prophecy Token")
  - Updatable on-chain metadata

## 🎨 Features

- 🔮 **Mystical UI**: Vintage fortune teller theme with crystal ball animations, starry backgrounds, and tarot-style cards
- 📊 **Career Assessment**: Quiz covering role, experience, skills, industry (based on WEF 2025 reports)
- 💎 **NFT Minting**: ERC-721 tokens with unique AI-generated artwork on Base
- 🎯 **Actionable Strategies**: Personalized pivot recommendations (e.g., "Certify in zkML for Base apps")
- 🗺️ **Fate Maps**: Visual career path decision trees
- 💰 **Crypto Payments**: Low-fee transactions on Base via AgentKit
- 📱 **Farcaster Native**: Published as Mini App with hosted manifest

## 🏗️ Architecture

```
ai-fortune-teller/
├── apps/
│   └── web/                 # Next.js 15 frontend + API routes
│       ├── src/
│       │   ├── app/         # Pages: home, result, premium
│       │   ├── components/  # CrystalBall, QuizForm, etc.
│       │   ├── lib/         # Wagmi config
│       │   └── types/       # TypeScript definitions
│       ├── python/          # Flask backend + Kaggle data
│       └── public/          # Static assets
├── packages/
│   ├── ui/                  # Shared components (Button, Card)
│   ├── contracts/           # Hardhat + ProphecyToken (ERC-721)
│   └── agent/               # AgentKit CDP integration
├── docs/                    # All documentation
├── scripts/                 # Setup and utility scripts
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Wallet with ETH on Base Sepolia (testnet) or Base (mainnet)
- Coinbase Developer Platform account
- Farcaster account (for Mini App publishing)

### Installation

```bash
# Clone repository
git clone https://github.com/louisbove84/ai-fortune-teller.git
cd ai-fortune-teller

# Install dependencies
npm install

# Set up Python backend
./scripts/setup_python.sh

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (GROK_API_KEY, etc.)

# Start development servers
./scripts/start_dev.sh
```

Visit `http://localhost:3000` to see the app! 🎉

## 📚 Documentation

All detailed documentation is available in the [`docs/`](docs/) folder:

- **[Complete Setup Guide](docs/GETTING_STARTED.md)** - Detailed installation instructions
- **[Quick Start Guide](docs/QUICK_START_GUIDE.md)** - Fast setup for developers
- **[Python Backend Setup](docs/PYTHON_BACKEND_SETUP.md)** - Backend configuration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete deployment instructions
- **[Deployment Checklist](docs/VERCEL_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[Post-Deployment Testing](docs/POST_DEPLOYMENT_TEST.md)** - Testing guide after deployment
- **[API Documentation](docs/API.md)** - API endpoints and usage
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design details
- **[Smart Contract Deployment](packages/contracts/DEPLOYMENT_GUIDE.md)** - NFT contract deployment

## ⚙️ Configuration

### Environment Variables

Create `.env` in the root directory:

```bash
# Coinbase Developer Platform
CDP_API_KEY=your_cdp_api_key
CDP_PROJECT_ID=ce1e49f3-df98-4102-bb14-aba0df7a918b

# Base Network (get from Alchemy or QuickNode)
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Farcaster Mini App
HOSTED_MANIFEST_ID=your_manifest_id
NEXT_PUBLIC_APP_URL=https://aifortuneteller.xyz

# Contracts (fill after deployment)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_deployer_private_key

# IPFS (Pinata)
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_KEY=your_pinata_secret

# Optional: Stripe fallback
STRIPE_SECRET_KEY=sk_...
```

### Get CDP Credentials

1. Visit: https://portal.cdp.coinbase.com/projects/overview?projectId=ce1e49f3-df98-4102-bb14-aba0df7a918b
2. Click "Generate API Key"
3. Save securely (displayed once!)

## 📦 Deployment

### 1. Deploy Smart Contract

```bash
cd packages/contracts

# Compile
npx hardhat compile

# Deploy to Base Sepolia (testnet)
npx hardhat run scripts/deploy.ts --network base-sepolia

# Verify on BaseScan
npx hardhat verify --network base-sepolia <CONTRACT_ADDRESS>

# For mainnet, replace base-sepolia with base
```

Save contract address to `.env`:
```
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
```

### 2. Deploy Web App to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd apps/web
vercel --prod

# Add environment variables in Vercel dashboard
```

### 3. Configure Farcaster Mini App

See detailed guide: [docs/FARCASTER_SETUP.md](docs/FARCASTER_SETUP.md)

Quick steps:
1. Register domain (e.g., `aifortuneteller.xyz`)
2. Create hosted manifest at https://farcaster.xyz/~/developers
3. Add `HOSTED_MANIFEST_ID` to env
4. Generate assets (icon, splash, screenshots)
5. Verify domain ownership
6. Submit for review

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test specific package
npm run test --workspace=@ai-fortune-teller/contracts

# E2E tests (requires deployed app)
npm run test:e2e
```

### Manual Testing Flow

1. **Free Fortune**:
   - Navigate to home → Start quiz
   - Answer 5 questions
   - View result with score + narrative

2. **Premium Flow**:
   - From result page → "Get Premium Fortune"
   - Connect wallet (MetaMask/Coinbase Wallet)
   - Pay $3 (~0.001 ETH)
   - View strategies, fate map, NFT preview
   - Mint NFT

3. **Farcaster Mini App**:
   - Open Warpcast app
   - Navigate to Mini Apps → AI Fortune Teller
   - Complete full flow within Farcaster

## 📚 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Web3**: Wagmi, Viem, Hardhat, OpenZeppelin
- **Blockchain**: Base (Ethereum L2), AgentKit (CDP SDK)
- **Deployment**: Vercel (frontend), Base (contracts)
- **Monorepo**: Turborepo

## 🎯 Roadmap

- [ ] AI-generated NFT images via Hugging Face API
- [ ] ML model for better resilience scoring
- [ ] Social sharing (cast your fortune to Farcaster)
- [ ] Leaderboard (highest resilience scores)
- [ ] Re-mint feature (update NFT after upskilling)
- [ ] Integration with LinkedIn for auto-profile import
- [ ] Multi-language support

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- Coinbase Developer Platform for AgentKit
- Farcaster for Mini Apps framework
- WEF Future of Jobs Report 2025 for data
- OpenZeppelin for secure contracts

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-fortune-teller/issues)
- **Farcaster**: [@yourhandle](https://warpcast.com/yourhandle)
- **Email**: hello@aifortuneteller.xyz

## 🔗 Links

- **Live App**: https://aifortuneteller.xyz
- **Farcaster Mini App**: Search "AI Fortune Teller" in Warpcast
- **Contract**: [View on BaseScan](https://basescan.org/address/YOUR_CONTRACT)
- **CDP Project**: [View Dashboard](https://portal.cdp.coinbase.com/projects/overview?projectId=ce1e49f3-df98-4102-bb14-aba0df7a918b)

---

Built with 🔮 by [Your Name] | Powered by Base & Farcaster

