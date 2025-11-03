/**
 * IPFS Integration for NFT Metadata and Images
 * Handles uploading NFT metadata and images to IPFS via Pinata
 */

/**
 * Upload an image to IPFS via Pinata
 */
export async function uploadImageToIPFS(imageBlob: Blob, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', imageBlob, filename);

  const pinataMetadata = JSON.stringify({
    name: filename,
  });
  formData.append('pinataMetadata', pinataMetadata);

  const response = await fetch('/api/ipfs/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to upload image to IPFS: ${error.message}`);
  }

  const data = await response.json();
  return `ipfs://${data.IpfsHash}`;
}

/**
 * Upload JSON metadata to IPFS
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
 * Capture screenshot from HTML element using html2canvas
 */
export async function captureElementScreenshot(element: HTMLElement): Promise<Blob> {
  const html2canvas = (await import('html2canvas')).default;
  
  const canvas = await html2canvas(element, {
    backgroundColor: '#000000',
    scale: 2, // Higher resolution
    logging: false,
    useCORS: true,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to capture screenshot'));
      }
    }, 'image/png');
  });
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

