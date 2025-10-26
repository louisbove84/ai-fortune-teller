# Architecture Overview

Technical architecture documentation for AI Fortune Teller.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Farcaster   │  │   Browser    │  │   Mobile     │         │
│  │  Mini App    │  │   (Direct)   │  │   (PWA)      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────┬────────────────┬────────────────┬─────────────────┘
             │                │                │
             └────────────────┴────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Next.js 15 App   │
                    │   (Vercel Edge)    │
                    └─────────┬──────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐
    │ Pages   │         │   API   │         │ Static  │
    │ (SSR)   │         │ Routes  │         │ Assets  │
    └────┬────┘         └────┬────┘         └─────────┘
         │                   │
         │              ┌────▼────────────────┐
         │              │ Fortune Calculator  │
         │              │ Payment Processor   │
         │              │ NFT Minting Logic   │
         │              └────┬────────────────┘
         │                   │
         │         ┌─────────┴─────────┐
         │         │                   │
    ┌────▼────┐  ┌─▼──────────┐  ┌───▼────────┐
    │ Wagmi   │  │ AgentKit   │  │ Pinata     │
    │ (Web3)  │  │ (CDP SDK)  │  │ (IPFS)     │
    └────┬────┘  └─────┬──────┘  └────────────┘
         │             │
         │             │
    ┌────▼─────────────▼────┐
    │     Base Network      │
    │  ┌──────────────────┐ │
    │  │ ProphecyToken    │ │
    │  │ (ERC-721)        │ │
    │  └──────────────────┘ │
    └───────────────────────┘
```

## Component Architecture

### Frontend (apps/web)

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (Providers, global styles)
│   ├── page.tsx            # Home (quiz start + CrystalBall)
│   ├── result/page.tsx     # Free fortune results
│   ├── premium/page.tsx    # Premium purchase flow
│   └── api/                # API Routes
│       ├── fortune/
│       │   ├── route.ts    # POST: Calculate basic fortune
│       │   └── premium/route.ts # POST: Premium fortune
│       ├── payment/route.ts     # POST: Process payment
│       └── nft/
│           └── mint/route.ts    # POST: Mint NFT
│
├── components/             # React Components
│   ├── CrystalBall.tsx     # Animated crystal ball (Framer Motion)
│   ├── QuizForm.tsx        # Multi-step quiz with state
│   └── PremiumFortune.tsx  # Premium results display
│
├── lib/
│   └── wagmi.ts            # Wagmi config (Base network)
│
└── types/
    └── fortune.ts          # TypeScript interfaces
```

### Packages

#### @ai-fortune-teller/ui
Shared UI components (Button, Card) with Tailwind + Framer Motion.

#### @ai-fortune-teller/contracts
Hardhat project with ProphecyToken (ERC-721):
- `mintProphecy()`: Mint new NFT with resilience score
- `updateProphecy()`: Update metadata after upskilling
- OpenZeppelin base contracts for security

#### @ai-fortune-teller/agent
AgentKit wrapper for Coinbase Developer Platform:
- Wallet management (create/load)
- Payment verification
- NFT minting via contract interaction
- IPFS uploads

## Data Flow

### Free Fortune Flow

```
1. User completes quiz
   ↓
2. QuizForm state → sessionStorage
   ↓
3. Navigate to /result
   ↓
4. useEffect → fetch('/api/fortune', { method: 'POST', body: answers })
   ↓
5. API calculates score using weighted algorithm
   ↓
6. Generate narrative via template + randomization
   ↓
7. Return { score, narrative, riskLevel, factors }
   ↓
8. Display: Score (big number) + Chart (Recharts) + Narrative
```

### Premium Fortune Flow

```
1. User clicks "Get Premium" from /result
   ↓
2. Navigate to /premium
   ↓
3. Connect wallet (Wagmi) → useAccount hook
   ↓
4. Click "Pay $3"
   ↓
5. POST /api/payment { address, answers }
   ↓
6. [TODO: AgentKit verifies on-chain payment]
   Currently: Simulated success
   ↓
7. On success, set hasPaid = true
   ↓
8. POST /api/fortune/premium { answers, address }
   ↓
9. Generate strategies (based on role/industry)
   Generate fateMap (decision tree nodes)
   Generate NFT metadata (attributes + IPFS placeholder)
   ↓
10. Display premium content
    ↓
11. User clicks "Mint NFT"
    ↓
12. POST /api/nft/mint { address, metadata }
    ↓
13. [TODO: AgentKit calls ProphecyToken.mintProphecy()]
    Currently: Simulated tokenId
    ↓
14. Display success + tokenId
```

## State Management

- **Client State**: React hooks (useState, useEffect)
- **Session State**: sessionStorage (quiz answers)
- **Web3 State**: Wagmi + TanStack Query
- **No global state library** (Redux/Zustand not needed for this scope)

## Styling System

- **Framework**: Tailwind CSS 3.4
- **Custom Theme**: Fortune teller palette
  - `fortune-gold`: #ffd700
  - `fortune-purple`: #9d4edd
  - `mystic-900`: #1a1a2e (dark backgrounds)
- **Animations**: Framer Motion
  - Crystal ball pulse
  - Card flips
  - Button hover effects
- **Responsive**: Mobile-first breakpoints (sm, md, lg)

## Smart Contract Design

### ProphecyToken.sol

```solidity
contract ProphecyToken is ERC721URIStorage, Ownable {
  struct ProphecyData {
    uint256 resilienceScore;  // 0-100
    string occupation;
    uint256 timestamp;
    uint256 updateCount;      // # of times updated
    address recipient;
  }
  
  mapping(uint256 => ProphecyData) public prophecies;
  
  function mintProphecy(address, string tokenURI, uint256 score, string occupation)
  function updateProphecy(uint256 tokenId, string newURI, uint256 newScore)
  function getProphecy(uint256 tokenId) returns (ProphecyData)
}
```

**Features**:
- Updatable metadata (user upskills → re-mint)
- On-chain score tracking
- ERC-721 standard (OpenSea compatible)
- Ownable (only backend can mint)

**Optional**: Uncomment `_beforeTokenTransfer` to make soulbound.

## Security Architecture

### Frontend
- No sensitive keys in client code
- API keys in Vercel env vars only
- CORS configured (only own domain)
- Input validation on all forms

### Backend
- Rate limiting (TODO: implement with Upstash)
- Payment verification (TODO: on-chain check)
- Sanitized user inputs
- Error messages don't leak secrets

### Smart Contract
- OpenZeppelin audited contracts
- Owner-only minting (prevents spam)
- Score bounds checking (0-100)
- Reentrancy protection (built-in)

### Private Keys
- Deployer key: Local .env only (never committed)
- AgentKit key: Vercel secrets
- RPC keys: Alchemy (rotated regularly)

## Performance Optimizations

### Next.js
- Static generation for public pages
- API routes on edge (low latency)
- Image optimization (next/image)
- Code splitting (dynamic imports)

### Web3
- Base L2 (low gas, fast confirms)
- Cached RPC responses (TanStack Query)
- Batch reads where possible

### IPFS
- Pinata CDN (fast retrieval)
- Pre-generate images (avoid generation delays)

## Scalability Considerations

### Current Capacity
- Vercel: Unlimited requests (pro plan)
- Alchemy: 300M compute units/month (free tier)
- Base: ~2 TPS dedicated to app (sufficient for MVP)

### Bottlenecks
1. **NFT Minting**: ~30s per mint (blockchain confirms)
   - Solution: Queue system (Redis + worker)
2. **IPFS Uploads**: ~5s per image
   - Solution: Pre-generate + cache common variants
3. **AgentKit Rate Limits**: TBD per CDP tier
   - Solution: Upgrade plan if needed

### Scaling Plan (10k+ users)
- Implement caching (Redis) for common quiz results
- Use batch minting (mint multiple NFTs in one tx)
- CDN for all static assets
- Database (PostgreSQL) for user accounts/history
- Background jobs for non-critical tasks

## Monitoring & Observability

### Metrics to Track
- **User Funnel**:
  - Quiz starts
  - Quiz completions
  - Premium clicks
  - Payment success
  - NFT mints
  
- **Technical**:
  - API response times
  - Error rates (4xx, 5xx)
  - RPC call volume
  - Gas costs per mint
  
- **Business**:
  - Conversion rate (free → paid)
  - Average revenue per user
  - Retention (repeat visitors)

### Tools
- Vercel Analytics (built-in)
- Sentry (errors)
- Alchemy Dashboard (RPC)
- BaseScan (contracts)
- Plausible/Google Analytics (user behavior)

## Future Architecture Enhancements

1. **AI-Generated NFTs**: Integrate Hugging Face API for unique images
2. **User Accounts**: PostgreSQL + NextAuth for saved fortunes
3. **Leaderboard**: Track top scores, display rankings
4. **Social Features**: Share casts to Farcaster with results
5. **Multi-Chain**: Expand to Optimism, Arbitrum
6. **Real-Time Updates**: WebSockets for live mint notifications
7. **Advanced Analytics**: ML model for better scoring

## Development Workflow

```bash
# Local development
npm run dev              # All packages in watch mode

# Linting
npm run lint             # ESLint + Prettier

# Testing
npm run test             # Jest + Hardhat tests

# Build
npm run build            # Production builds

# Deploy
vercel --prod            # Frontend
npm run deploy:testnet   # Contracts
```

## Deployment Architecture

```
GitHub Repository
    ↓
    ├─→ Vercel (auto-deploy on push to main)
    │   ├─→ Preview deployments (PRs)
    │   └─→ Production (main branch)
    │
    └─→ GitHub Actions (CI/CD)
        ├─→ Run tests
        ├─→ Lint check
        └─→ Deploy contracts (manual trigger)
```

## Tech Stack Summary

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Web3 | Wagmi, Viem, Hardhat, OpenZeppelin |
| Blockchain | Base (Ethereum L2), AgentKit (CDP) |
| Storage | IPFS (Pinata) |
| Deployment | Vercel (frontend), Alchemy (RPC) |
| Monorepo | Turborepo |
| Testing | Jest, Vitest, Hardhat |

## API Design Principles

1. **RESTful**: Standard HTTP methods (POST for mutations)
2. **JSON**: All request/response bodies
3. **Stateless**: No server-side session (rely on client state)
4. **Idempotent**: Repeat calls don't cause issues
5. **Typed**: Full TypeScript coverage

## Error Handling Strategy

```typescript
try {
  // Operation
} catch (error) {
  console.error("Context:", error);
  
  // User-friendly message
  if (error.code === "INSUFFICIENT_FUNDS") {
    return { error: "Not enough ETH for gas" };
  }
  
  // Generic fallback
  return { error: "Something went wrong. Please try again." };
}
```

Never expose:
- Stack traces
- API keys
- Private keys
- Database structure

## Conclusion

This architecture prioritizes:
- **Simplicity**: No over-engineering for MVP
- **Scalability**: Can handle 10k+ users with minor tweaks
- **Security**: Keys isolated, contracts audited, inputs validated
- **Maintainability**: Monorepo structure, TypeScript, clear separation of concerns

For questions, see [README.md](../README.md) or [API.md](API.md).

