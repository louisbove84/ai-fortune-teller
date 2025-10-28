import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook endpoint for Farcaster frame interactions
 * Handles events from the Farcaster Mini App
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log("📬 Webhook received:", {
      timestamp: new Date().toISOString(),
      event: body.event,
      data: body,
    });

    // Handle different event types
    switch (body.event) {
      case "frame.added":
        console.log("Frame added by user:", body.fid);
        break;
      
      case "frame.removed":
        console.log("Frame removed by user:", body.fid);
        break;
      
      case "frame.opened":
        console.log("Frame opened by user:", body.fid);
        break;
      
      default:
        console.log("Unknown event type:", body.event);
    }

    return NextResponse.json({ 
      success: true,
      message: "Webhook processed successfully" 
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process webhook" 
      },
      { status: 500 }
    );
  }
}

/**
 * Health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}

