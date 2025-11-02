import { NextRequest, NextResponse } from "next/server";

/**
 * NFT Minting API Route
 * 
 * NOTE: Minting is now done client-side using the user's wallet.
 * This endpoint is kept for backwards compatibility and health checks.
 * 
 * For client-side minting, use the MintNFTButton component which uses
 * Wagmi's useWriteContract hook to call the contract directly.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "Minting is now done client-side. Use the MintNFTButton component with your connected wallet.",
      note: "Connect your wallet and use the mint button on the result page.",
    },
    { status: 400 }
  );
}

/**
 * Health check
 */
export async function GET() {
  const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;
  return NextResponse.json({
    status: "ok",
    contractConfigured: !!contractAddress,
    contractAddress: contractAddress || "Not set",
  });
}

