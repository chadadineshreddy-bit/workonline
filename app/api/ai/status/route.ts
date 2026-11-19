import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai-service";

export async function GET() {
  try {
    const status = aiService.getStatus();
    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json(
      {
        configured: false,
        provider: "Google Gemini",
        model: "gemini-1.5-flash",
        instructions: "An error occurred checking AI status: " + String(err.message),
      },
      { status: 500 }
    );
  }
}
