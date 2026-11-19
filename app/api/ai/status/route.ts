import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const clientKey = req.headers.get("x-gemini-api-key") || req.nextUrl.searchParams.get("key") || undefined;
    const shouldTest = req.nextUrl.searchParams.get("test") === "true";

    const status = aiService.getStatus(clientKey);

    if (shouldTest && status.configured) {
      const testResult = await aiService.testConnection(clientKey);
      if (testResult.success) {
        return NextResponse.json({
          ...status,
          model: testResult.model || status.model,
          testPassed: true,
        });
      } else {
        return NextResponse.json(
          {
            ...status,
            testPassed: false,
            error: testResult.error,
            instructions: testResult.error,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json(
      {
        configured: false,
        provider: "Google Gemini",
        model: "gemini-3.5-flash",
        source: "none",
        instructions: "An error occurred checking AI status: " + String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
