# Post-Deployment Testing Guide

After deploying to Vercel, test these features to ensure everything works correctly.

## Quick Test Checklist

### 1. Basic App Functionality
- [ ] App loads without errors
- [ ] Home page displays correctly
- [ ] Quiz form works
- [ ] Results page displays fortune

### 2. Wallet Connection
- [ ] "Connect Wallet" button appears on result page
- [ ] Can connect MetaMask wallet
- [ ] Can connect Coinbase Wallet
- [ ] Wallet address displays after connection
- [ ] Can disconnect wallet

### 3. IPFS Metadata Generation
- [ ] After completing quiz, IPFS metadata is generated
- [ ] Check browser console for IPFS URI (should start with `ipfs://`)
- [ ] API route `/api/ipfs/upload` responds correctly

### 4. NFT Minting
- [ ] "Mint Your Prophecy NFT" button appears after wallet connection
- [ ] Clicking mint button initiates transaction
- [ ] Transaction succeeds (check BaseScan)
- [ ] NFT appears in user's wallet
- [ ] Success message displays

## Detailed Testing Steps

### Test Wallet Connection

1. Navigate to your deployed app
2. Complete a quiz
3. On result page, click "Connect Wallet"
4. Select MetaMask or Coinbase Wallet
5. Approve connection
6. Verify wallet address displays

**Expected**: Wallet connects successfully, address shows in UI

### Test NFT Minting

1. Ensure wallet is connected
2. Wait for IPFS metadata to generate (check console)
3. Click "Mint Your Prophecy NFT"
4. Approve transaction in wallet
5. Wait for confirmation

**Expected**: 
- Transaction hash returned
- NFT minted successfully
- Success message displayed

### Test API Routes

Test the API routes directly:

```bash
# Test IPFS upload
curl -X POST https://your-app.vercel.app/api/ipfs/upload \
  -H "Content-Type: application/json" \
  -d '{
    "score": 85,
    "occupation": "Software Engineer",
    "riskLevel": "low",
    "outlook": "positive"
  }'

# Test NFT mint endpoint (health check)
curl https://your-app.vercel.app/api/nft/mint
```

## Troubleshooting

### Wallet Won't Connect
- Check browser console for errors
- Verify `NEXT_PUBLIC_BASE_RPC_URL` is set correctly
- Ensure wallet extension is installed
- Try switching networks in wallet

### NFT Minting Fails
- Check Vercel function logs
- Verify `PRIVATE_KEY` is set correctly
- Check that deployer wallet has ETH for gas
- Verify contract address is correct

### IPFS Upload Returns Placeholder
- This is expected if Pinata not configured
- Add `PINATA_API_KEY` and `PINATA_SECRET_KEY` for real uploads
- Or implement alternative IPFS service

### Build Errors in Vercel
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check that dependencies install correctly

## Verification

### Check Contract on BaseScan
- Visit: https://basescan.org/address/0x6a70a49B7d97c74d7B02eAc37DBC80c9B8a7054F
- Verify contract is verified
- Check recent transactions for minting activity

### Check Vercel Logs
- Go to Vercel Dashboard → Your Project → Functions
- Check API route logs for errors
- Monitor function execution times

### Check Browser Console
- Open browser DevTools
- Check for JavaScript errors
- Verify network requests succeed
- Check for any Web3 connection errors

## Success Criteria

✅ All tests pass
✅ Wallet connects successfully
✅ NFTs mint without errors
✅ Transactions appear on BaseScan
✅ Users can complete full flow

## Next Steps After Testing

1. Monitor usage and errors
2. Configure Pinata for real IPFS uploads (optional)
3. Add success notifications/modal
4. Consider adding NFT gallery
5. Monitor gas costs and optimize if needed

---

**Happy testing!** 🎉

