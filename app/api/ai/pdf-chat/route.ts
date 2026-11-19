import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai-service";
import { buildGroundedQaPrompt, retrieveRelevantChunks } from "@/lib/ai/pdf-rag-pipeline";
import { DocumentChunk } from "@/lib/ai/types";

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const clientKey = req.headers.get("x-gemini-api-key") || undefined;
    const body = await req.json();
    const { question, chunks, history, apiKey } = body as {
      question: string;
      chunks: DocumentChunk[];
      history?: { role: "user" | "assistant"; content: string }[];
      apiKey?: string;
    };
    const effectiveKey = clientKey || apiKey || undefined;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Question cannot be empty.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json(
        { success: false, error: "No document text chunks provided. Please upload a PDF document.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // 1. Retrieve top relevant chunks for the question
    const relevantChunks = retrieveRelevantChunks(chunks, question, 6);

    // 2. Build grounded prompt with strict injection defense and page numbers
    const { prompt, systemInstruction, pageReferences } = buildGroundedQaPrompt(question, relevantChunks);

    // 3. Execute request via AI Service
    const aiResponse = await aiService.executeTask({
      task: "pdf_chat",
      prompt,
      systemInstruction,
      history,
      options: {
        temperature: 0.2, // lower temperature for strict factual accuracy
        maxOutputTokens: 1500,
      },
    }, effectiveKey);

    if (!aiResponse.success) {
      const status = aiResponse.code === "MISSING_KEY" ? 503 : aiResponse.code === "RATE_LIMITED" ? 429 : 500;
      return NextResponse.json(aiResponse, { status });
    }

    return NextResponse.json({
      success: true,
      result: aiResponse.result,
      pageReferences,
      provider: aiResponse.provider,
      model: aiResponse.model,
    });
  } catch (err: any) {
    console.error("[API /api/ai/pdf-chat error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process document question: " + String(err.message || err),
        code: "PROVIDER_ERROR",
      },
      { status: 500 }
    );
  }
}
