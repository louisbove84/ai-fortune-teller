import { NextRequest, NextResponse } from 'next/server';

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

/**
 * Image Upload API Route
 * POST /api/ipfs/upload-image
 * 
 * Uploads an image file to IPFS via Pinata
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretKey = process.env.PINATA_SECRET_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      return NextResponse.json(
        { success: false, message: 'Pinata credentials not configured' },
        { status: 500 }
      );
    }

    // Forward the file to Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);

    const pinataMetadata = formData.get('pinataMetadata');
    if (pinataMetadata) {
      pinataFormData.append('pinataMetadata', pinataMetadata);
    }

    const pinataResponse = await fetch(PINATA_API_URL, {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretKey,
      },
      body: pinataFormData,
    });

    if (!pinataResponse.ok) {
      const errorData = await pinataResponse.json();
      console.error('Pinata error:', errorData);
      return NextResponse.json(
        { success: false, message: 'Failed to upload to Pinata' },
        { status: pinataResponse.status }
      );
    }

    const data = await pinataResponse.json();
    console.log('✅ Image uploaded to IPFS:', data.IpfsHash);

    return NextResponse.json({
      success: true,
      IpfsHash: data.IpfsHash,
      ipfsUrl: `ipfs://${data.IpfsHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    });

  } catch (error) {
    console.error('❌ IPFS upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

