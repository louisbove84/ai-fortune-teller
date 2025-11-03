import { NextRequest, NextResponse } from "next/server";
import { uploadToIPFS, generateNFTMetadata } from "@/lib/ipfs";

/**
 * IPFS Upload API Route
 * POST /api/ipfs/upload
 * 
 * Uploads NFT metadata to IPFS and returns the IPFS URI
 * Returns placeholder URI if Pinata not configured
 */
export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
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

    // Upload to IPFS (returns placeholder if Pinata not configured)
    const ipfsUri = await uploadToIPFS(metadata);

    return NextResponse.json({
      success: true,
      ipfsUri,
      metadata,
    });
  } catch (error: unknown) {
    console.error("IPFS upload error:", error);
    // Return placeholder URI on error so minting can still work
    const { score = 0, occupation = "Unknown", riskLevel = "medium", outlook = "neutral" } = body;
    return NextResponse.json({
      success: true,
      ipfsUri: `ipfs://placeholder_${Date.now()}_${score}_${occupation}`,
      metadata: generateNFTMetadata(
        score,
        occupation,
        riskLevel,
        outlook
      ),
      note: "Using placeholder IPFS URI. Configure Pinata for real IPFS uploads.",
    });
  }
}

/**
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    pinataConfigured: !!(process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY),
  });
}

