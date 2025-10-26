# API Documentation

Internal API routes for AI Fortune Teller.

## Endpoints

### POST `/api/fortune`

Calculate basic fortune based on quiz answers.

**Request Body:**
```typescript
{
  role: "accountant" | "developer" | "electrician" | "designer" | "healthcare" | "teacher",
  experience: "recent-grad" | "early-career" | "mid-career" | "veteran",
  skills: string[], // e.g., ["ml", "programming", "blockchain"]
  industry: "finance" | "tech" | "construction" | "healthcare" | "education" | "creative",
  age: "18-25" | "26-35" | "36-45" | "46-55" | "56+"
}
```

**Response:**
```typescript
{
  score: number, // 0-100
  narrative: string,
  riskLevel: "low" | "medium" | "high",
  factors: {
    roleScore: number,
    experienceScore: number,
    skillsScore: number,
    industryScore: number
  }
}
```

**Example:**
```bash
curl -X POST https://aifortuneteller.xyz/api/fortune \
  -H "Content-Type: application/json" \
  -d '{
    "role": "developer",
    "experience": "mid-career",
    "skills": ["programming", "ml"],
    "industry": "tech",
    "age": "26-35"
  }'
```

---

### POST `/api/fortune/premium`

Get premium fortune with strategies and NFT metadata (requires payment).

**Request Body:**
```typescript
{
  answers: QuizAnswers, // Same as /api/fortune
  address: string // User's wallet address (0x...)
}
```

**Response:**
```typescript
{
  score: number,
  narrative: string,
  riskLevel: "low" | "medium" | "high",
  strategies: [
    {
      title: string,
      description: string,
      timeline: string, // e.g., "3-6 months"
      resources: string[]
    }
  ],
  fateMap: [
    {
      id: string,
      label: string,
      x: number, // 0-100 (percentage)
      y: number, // 0-100 (percentage)
      type: "current" | "decision" | "outcome",
      connections: string[] // IDs of connected nodes
    }
  ],
  nftMetadata: {
    name: string,
    description: string,
    image: string, // IPFS URI
    attributes: [
      {
        trait_type: string,
        value: string | number
      }
    ]
  }
}
```

---

### POST `/api/payment`

Process payment for premium fortune.

**Request Body:**
```typescript
{
  address: string, // User's wallet address
  answers: QuizAnswers
}
```

**Response:**
```typescript
{
  success: boolean,
  txHash?: string, // Transaction hash on Base
  message?: string,
  error?: string
}
```

**Notes:**
- Current implementation is a placeholder
- Production version should integrate with AgentKit for actual on-chain payment verification
- Amount: ~0.001 ETH ($3 USD at current prices)

---

### POST `/api/nft/mint`

Mint Prophecy NFT for user.

**Request Body:**
```typescript
{
  address: string, // Recipient wallet address
  metadata: {
    name: string,
    description: string,
    image: string, // IPFS URI
    attributes: Array<{trait_type: string, value: string | number}>
  }
}
```

**Response:**
```typescript
{
  success: boolean,
  tokenId?: number,
  contractAddress?: string,
  txHash?: string,
  message?: string,
  error?: string
}
```

**Notes:**
- Calls ProphecyToken.mintProphecy()
- Requires owner permissions (backend wallet)
- Gas paid by backend

---

## Scoring Logic

### Base Score: 50

### Role Adjustments
- `accountant`: -40 (high automation risk)
- `developer`: +10 (AI augments, doesn't replace)
- `electrician`: +35 (physical, low risk)
- `designer`: +20 (creative, moderate risk)
- `healthcare`: +30 (human interaction critical)
- `teacher`: +25 (mentorship irreplaceable)

### Experience Adjustments
- `recent-grad`: -20 (less established)
- `early-career`: 0 (neutral)
- `mid-career`: +15 (established network)
- `veteran`: +10 (deep expertise)

### Skills (averaged if multiple)
- `none`: -10
- `ml`: +30 (highly valuable)
- `programming`: +20
- `automation`: +15
- `data-analysis`: +15
- `blockchain`: +25

### Industry Adjustments
- `finance`: -30 (automation heavy)
- `tech`: +20 (AI-native)
- `construction`: +35 (physical)
- `healthcare`: +30 (human-centric)
- `education`: +25 (mentorship)
- `creative`: +15 (AI-assisted)

### Age Adjustments
- `18-25`: +10 (adaptable)
- `26-35`: +5
- `36-45`: 0
- `46-55`: -5
- `56+`: -10

**Final Score**: Clamped to 0-100

---

## Rate Limiting

Currently no rate limiting. For production, implement:

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: ...,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
});

export async function middleware(request: Request) {
  const ip = request.headers.get("x-forwarded-for");
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response("Too many requests", { status: 429 });
  }
}
```

---

## Error Codes

- `400`: Bad request (missing/invalid parameters)
- `401`: Unauthorized (payment not verified)
- `429`: Rate limited
- `500`: Internal server error

---

## Webhooks (Future)

For Farcaster frame actions:

### POST `/api/webhook`

Handle frame button clicks.

**Request Body:**
```typescript
{
  untrustedData: {
    fid: number,
    messageHash: string,
    buttonIndex: number,
    inputText?: string
  },
  trustedData: {
    messageBytes: string
  }
}
```

**Response**: Next frame HTML or redirect.

---

## Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Test fortune endpoint
curl -X POST http://localhost:3000/api/fortune \
  -H "Content-Type: application/json" \
  -d '{"role":"developer","experience":"mid-career","skills":["programming"],"industry":"tech","age":"26-35"}'
```

### Production Testing

Use tools like [Postman](https://postman.com) or [HTTPie](https://httpie.io):

```bash
http POST https://aifortuneteller.xyz/api/fortune \
  role=developer \
  experience=mid-career \
  skills:='["programming","ml"]' \
  industry=tech \
  age=26-35
```

---

## Security Considerations

1. **Input Validation**: All endpoints validate input types and ranges
2. **Payment Verification**: Premium endpoints should verify on-chain payment before responding
3. **Rate Limiting**: Implement per-IP limits (10 requests/minute recommended)
4. **CORS**: Configured to allow only your domain
5. **API Keys**: AgentKit keys stored in environment, never exposed client-side

---

## Performance

- Average response time: <200ms (fortune calculation)
- NFT minting: ~30s (blockchain confirmation)
- IPFS uploads: ~5s (via Pinata)

Optimize by:
- Caching common quiz results
- Pre-generating strategies
- Using CDN for static assets

