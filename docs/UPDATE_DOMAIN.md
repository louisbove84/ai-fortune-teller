# Update Domain Configuration

After setting up your custom domain in Vercel, update these files:

## Files to Update

Replace `ai-fortune-teller.vercel.app` with your new domain (e.g., `fortune.beuxbunk.com`)

### 1. `/apps/web/public/.well-known/farcaster.json`
```json
{
  "miniapp": {
    "iconUrl": "https://YOUR-DOMAIN/fortune-teller-bg.png",
    "homeUrl": "https://YOUR-DOMAIN",
    "imageUrl": "https://YOUR-DOMAIN/fortune-teller-bg.png",
    "splashImageUrl": "https://YOUR-DOMAIN/fortune-teller-bg.png",
    "webhookUrl": "https://YOUR-DOMAIN/api/webhook",
    "heroImageUrl": "https://YOUR-DOMAIN/fortune-teller-bg.png",
    "ogImageUrl": "https://YOUR-DOMAIN/fortune-teller-bg.png"
  },
  "accountAssociation": {
    "payload": "eyJkb21haW4iOiJZT1VSLURPTUFJUCJ9"  // Update this base64 encoded domain
  }
}
```

### 2. `/apps/web/src/app/layout.tsx`
```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://YOUR-DOMAIN"),
  openGraph: {
    url: "https://YOUR-DOMAIN",
  },
};
```

### 3. `/apps/web/public/robots.txt`
```
Sitemap: https://YOUR-DOMAIN/sitemap.xml
```

## Important: Update Account Association

For the `accountAssociation.payload` in farcaster.json, you need to:

1. Create the new payload with your domain:
   ```json
   {"domain":"YOUR-DOMAIN"}
   ```

2. Base64 encode it:
   ```bash
   echo -n '{"domain":"YOUR-DOMAIN"}' | base64
   ```

3. Replace the `payload` value in farcaster.json

4. You may also need to regenerate the `signature` using your Farcaster credentials if you want to verify the domain association.

## Quick Update Script

Run this after setting your domain:

```bash
# Set your new domain
NEW_DOMAIN="fortune.beuxbunk.com"

# Update farcaster.json
sed -i '' "s|ai-fortune-teller.vercel.app|$NEW_DOMAIN|g" apps/web/public/.well-known/farcaster.json

# Update layout.tsx
sed -i '' "s|ai-fortune-teller.vercel.app|$NEW_DOMAIN|g" apps/web/src/app/layout.tsx

# Update robots.txt
sed -i '' "s|ai-fortune-teller.vercel.app|$NEW_DOMAIN|g" apps/web/public/robots.txt

# Update account association payload
NEW_PAYLOAD=$(echo -n "{\"domain\":\"$NEW_DOMAIN\"}" | base64)
echo "New payload (update manually in farcaster.json):"
echo $NEW_PAYLOAD

# Commit changes
git add -A
git commit -m "feat: update domain to $NEW_DOMAIN"
git push origin main
```

## Testing

After deploying:
1. Visit your new domain
2. Check that all images load correctly
3. Test the fortune teller functionality
4. Verify Farcaster frame integration works
5. Check webhook endpoint: `https://YOUR-DOMAIN/api/webhook`

