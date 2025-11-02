/**
 * IPFS Integration for NFT Metadata
 * Handles uploading NFT metadata to IPFS
 */

/**
 * Upload JSON metadata to IPFS
 * 
 * This is a placeholder implementation. You can integrate with:
 * - Pinata (https://www.pinata.cloud/)
 * - NFT.Storage (https://nft.storage/)
 * - Web3.Storage (https://web3.storage/)
 * - Your own IPFS node
 * 
 * For now, returns a placeholder IPFS URI. Replace with actual IPFS upload.
 */
export async function uploadToIPFS(metadata: object): Promise<string> {
  // If Pinata is configured, use it
  if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
    return uploadToPinata(metadata);
  }

  // Otherwise, return a placeholder or use NFT.Storage
  // For production, you should implement actual IPFS upload
  console.warn("IPFS upload not configured. Using placeholder URI.");
  return `ipfs://placeholder_${Date.now()}`;
}

/**
 * Upload to Pinata (IPFS pinning service)
 */
async function uploadToPinata(metadata: object): Promise<string> {
  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: process.env.PINATA_API_KEY!,
        pinata_secret_api_key: process.env.PINATA_SECRET_KEY!,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: "prophecy-metadata",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error("Pinata upload error:", error);
    throw error;
  }
}

/**
 * Generate NFT metadata JSON
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export function generateNFTMetadata(
  score: number,
  occupation: string,
  riskLevel: string,
  outlook: string,
  imageUrl?: string
): NFTMetadata {
  return {
    name: `AI Fortune Prophecy - ${occupation}`,
    description: `Your career resilience assessment in the age of AI. Resilience Score: ${score}/100`,
    image: imageUrl,
    attributes: [
      {
        trait_type: "Resilience Score",
        value: score,
      },
      {
        trait_type: "Occupation",
        value: occupation,
      },
      {
        trait_type: "Risk Level",
        value: riskLevel,
      },
      {
        trait_type: "Outlook",
        value: outlook,
      },
      {
        trait_type: "Minted On",
        value: "Base L2",
      },
    ],
  };
}

