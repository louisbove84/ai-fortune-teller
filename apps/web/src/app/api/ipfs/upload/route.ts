import { NextRequest, NextResponse } from "next/server";
import { uploadToIPFS, generateNFTMetadata } from "@/lib/ipfs";

/**
 * IPFS Upload API Route
 * POST /api/ipfs/upload
 * 
 * Uploads NFT metadata to IPFS and returns the IPFS URI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, occupation, riskLevel, outlook, imageUrl } = body;

    // Validate inputs
    if (typeof score !== "number" || score < 0 || score > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid score" },
        { status: 400 }
      );
    }

    if (!occupation || typeof occupation !== "string") {
      return NextResponse.json(
        { success: false, error: "Occupation is required" },
        { status: 400 }
      );
    }

    // Generate NFT metadata
    const metadata = generateNFTMetadata(
      score,
      occupation,
      riskLevel || "medium",
      outlook || "neutral",
      imageUrl
    );

    // Upload to IPFS
    const ipfsUri = await uploadToIPFS(metadata);

    return NextResponse.json({
      success: true,
      ipfsUri,
      metadata,
    });
  } catch (error: unknown) {
    console.error("IPFS upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload to IPFS",
      },
      { status: 500 }
    );
  }
}

