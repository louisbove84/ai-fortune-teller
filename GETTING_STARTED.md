# Getting Started with AI Fortune Teller

Quick start guide to get the project running locally in under 10 minutes.

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** (comes with Node.js)
- ✅ **Git** installed
- ✅ A code editor (VS Code recommended)

## Step 1: Clone & Install (2 minutes)

```bash
# Navigate to your projects folder
cd ~/Desktop/Projects

# If you haven't already, the project is at:
cd ai-fortune-teller

# Install all dependencies
npm install
```

This installs dependencies for all packages in the monorepo.

## Step 2: Environment Setup (3 minutes)

### Quick Setup (No Web3)

For just testing the UI without blockchain features:

```bash
# Create .env file (minimal)
echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" > .env
```

### Full Setup (With Web3)

For complete functionality including payments and NFTs:

1. **Get Alchemy RPC URL** (free):
   - Sign up at [alchemy.com](https://www.alchemy.com/)
   - Create app for "Base Sepolia" network
   - Copy API key

2. **Get Coinbase CDP Credentials**:
   - Visit: https://portal.cdp.coinbase.com/projects/overview?projectId=ce1e49f3-df98-4102-bb14-aba0df7a918b
   - Click "Generate API Key"
   - Save the key name and private key

3. **Create `.env` file**:

```bash
# Coinbase Developer Platform
CDP_API_KEY_NAME=organizations/your-org/apiKeys/your-key
CDP_API_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----
your_private_key_here
-----END EC PRIVATE KEY-----"

# Base Network (from Alchemy)
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Add later after contract deployment
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=
```

## Step 3: Run Development Server (1 minute)

```bash
# Start all services (web + packages in watch mode)
npm run dev
```

You'll see:

```
> turbo run dev
> @ai-fortune-teller/web:dev: ready - started server on 0.0.0.0:3000
```

Open your browser to: **http://localhost:3000**

## Step 4: Test the App (4 minutes)

### Test Free Fortune

1. Click **"✨ Begin Your Reading ✨"**
2. Answer the 5 quiz questions:
   - Pick any occupation (try "Developer")
   - Choose experience level
   - Select skills (multiple allowed)
   - Pick industry
   - Select age range
3. View your fortune result with:
   - AI Resilience Score (big number)
   - Bar chart comparison
   - Mystical narrative prophecy

### Test Premium Flow (UI Only)

1. From results page, click **"Get Premium Fortune - $3 in ETH"**
2. Click **"🦊 Connect Wallet"** (works even without MetaMask installed)
3. Click **"💫 Unlock Full Destiny"**
4. View premium content:
   - Detailed strategies
   - Career fate map
   - NFT preview

**Note**: Actual payment and minting are simulated in development mode.

## Step 5: Explore the Code (Optional)

### Key Files to Check Out

```
apps/web/src/
├── app/
│   ├── page.tsx              # Home page with crystal ball
│   ├── result/page.tsx       # Fortune results
│   └── api/fortune/route.ts  # Scoring algorithm
│
├── components/
│   ├── CrystalBall.tsx       # Animated crystal ball
│   └── QuizForm.tsx          # Interactive quiz
│
└── types/fortune.ts          # TypeScript interfaces
```

### Customize the Experience

**Change color scheme** (`apps/web/tailwind.config.js`):
```javascript
fortune: {
  gold: "#ffd700",      // Change to your color
  purple: "#9d4edd",    // Change to your color
}
```

**Adjust scoring** (`apps/web/src/app/api/fortune/route.ts`):
```typescript
const roleScores: Record<string, number> = {
  accountant: -40,  // Make more/less risky
  developer: 10,
  // ...
};
```

**Add quiz questions** (`apps/web/src/components/QuizForm.tsx`):
```typescript
const questions = [
  // Add new question object
];
```

## Common Issues & Solutions

### Port 3000 Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Restart TypeScript server in VS Code
# Command Palette (Cmd+Shift+P) → "TypeScript: Restart TS Server"
```

### Styles Not Loading

```bash
# Hard refresh browser
# Chrome/Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

## Next Steps

### Deploy to Production

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Deploying contracts to Base
- Publishing to Vercel
- Setting up Farcaster Mini App

### Add Features

Try implementing:
- [ ] Save fortunes to localStorage
- [ ] Share results as an image (html-to-canvas)
- [ ] Add more quiz questions
- [ ] Integrate real AI for narrative generation
- [ ] Add sound effects (crystal ball chime)

### Learn More

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Base Network**: https://docs.base.org
- **Farcaster**: https://docs.farcaster.xyz

## Development Tips

### Fast Refresh

Next.js supports hot module reloading. Save any file to see changes instantly!

### Component Dev

Focus on one component at a time:

```typescript
// Create a test page: apps/web/src/app/test/page.tsx
export default function Test() {
  return <CrystalBall />;
}
```

Visit `http://localhost:3000/test` to iterate quickly.

### Debug API Routes

Use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/fortune \
  -H "Content-Type: application/json" \
  -d '{"role":"developer","experience":"mid-career","skills":["programming"],"industry":"tech","age":"26-35"}'
```

### VS Code Extensions

Recommended:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

## Getting Help

- **Documentation**: Check [README.md](README.md) and [docs/](docs/)
- **API Reference**: See [docs/API.md](docs/API.md)
- **Architecture**: Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **GitHub Issues**: Report bugs or request features

## Success! 🎉

You're now running AI Fortune Teller locally. Time to peer into the future of AI and careers!

**What's next?**
- Customize the quiz questions
- Change the mystical theme colors
- Deploy to Vercel and share with friends
- Publish as a Farcaster Mini App

Happy coding! 🔮✨

