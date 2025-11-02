import { NextRequest, NextResponse } from "next/server";
import { mintProphecyNFT } from "@/lib/contracts";
import { isAddress } from "viem";

/**
 * NFT Minting API Route
 * POST /api/nft/mint
 * 
 * Mints a ProphecyToken NFT for a user based on their fortune reading
 * 
 * Body:
 * {
 *   recipient: string (Ethereum address)
 *   tokenURI: string (IPFS URI with NFT metadata)
 *   score: number (0-100 resilience score)
 *   occupation: string (user's occupation)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipient, tokenURI, score, occupation } = body;

    // Validate inputs
    if (!recipient || !isAddress(recipient)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient address" },
        { status: 400 }
      );
    }

    if (!tokenURI || typeof tokenURI !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid tokenURI" },
        { status: 400 }
      );
    }

    if (typeof score !== "number" || score < 0 || score > 100) {
      return NextResponse.json(
        { success: false, error: "Score must be between 0 and 100" },
        { status: 400 }
      );
    }

    if (!occupation || typeof occupation !== "string") {
      return NextResponse.json(
        { success: false, error: "Occupation is required" },
        { status: 400 }
      );
    }

    // Check if contract address is configured
    if (!process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS) {
      return NextResponse.json(
        {
          success: false,
          error: "Contract address not configured. Please set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS",
        },
        { status: 500 }
      );
    }

    // Mint the NFT
    const result = await mintProphecyNFT(
      recipient as `0x${string}`,
      tokenURI,
      score,
      occupation
    );

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      tokenId: result.tokenId,
      message: "NFT minted successfully!",
    });
  } catch (error: unknown) {
    console.error("NFT minting error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to mint NFT",
      },
      { status: 500 }
    );
  }
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

