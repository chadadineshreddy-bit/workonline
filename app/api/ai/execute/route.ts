import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/ai-service";
import { AiRequestPayload } from "@/lib/ai/types";

export const maxDuration = 45; // 45 seconds max timeout for Vercel / serverless

export async function POST(req: NextRequest) {
  try {
    const body: AiRequestPayload = await req.json();

    if (!body || !body.task) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: task", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // Build task-specific prompt if raw text/material was passed
    let finalPrompt = body.prompt;
    let finalSystem = body.systemInstruction;

    if (body.task === "summarize" && (!finalSystem || !finalPrompt.includes("--- DOCUMENT CONTENT ---"))) {
      const built = aiService.buildSummarizePrompt(
        body.context || body.prompt,
        body.options?.summaryFormat || "bullets"
      );
      finalPrompt = built.prompt;
      finalSystem = built.systemInstruction;
    } else if (body.task === "generate_notes" && !finalSystem) {
      const built = aiService.buildNotesPrompt(
        body.context || body.prompt,
        body.options?.mode,
        (body.options?.difficulty as any) || "detailed"
      );
      finalPrompt = built.prompt;
      finalSystem = built.systemInstruction;
    } else if (body.task === "generate_quiz" && !finalSystem) {
      const built = aiService.buildQuizPrompt(
        body.context || body.prompt,
        body.options?.mode || "General",
        body.options?.questionCount || 5,
        (body.options?.difficulty as any) || "medium",
        (body.options?.summaryFormat as any) || "multiple_choice"
      );
      finalPrompt = built.prompt;
      finalSystem = built.systemInstruction;
    } else if (body.task === "generate_flashcards" && !finalSystem) {
      const built = aiService.buildFlashcardsPrompt(
        body.context || body.prompt,
        body.options?.mode || "General",
        body.options?.questionCount || 8
      );
      finalPrompt = built.prompt;
      finalSystem = built.systemInstruction;
    } else if (body.task === "analyze_resume" && !finalSystem) {
      const built = aiService.buildResumeAnalysisPrompt(
        body.context || body.prompt,
        body.options?.mode
      );
      finalPrompt = built.prompt;
      finalSystem = built.systemInstruction;
    } else if (body.task === "rewrite_text" && !finalSystem) {
      const built = aiService.buildTextRewritePrompt(
        body.context || body.prompt,
        (body.options?.mode as any) || "professional",
        body.options?.tone || "Professional"
      );
      finalPrompt = built.prompt;
      finalSystem = built.systemInstruction;
    } else if (body.task === "check_grammar" && !finalSystem) {
      const built = aiService.buildGrammarCheckPrompt(body.context || body.prompt);
      finalPrompt = built.prompt;
      finalSystem = built.systemInstruction;
    } else if (body.task === "explain_topic" && !finalSystem) {
      const built = aiService.buildExplainPrompt(
        body.prompt,
        body.options?.explanationLevel || "intermediate"
      );
      finalPrompt = built.prompt;
      finalSystem = built.systemInstruction;
    }

    const payload: AiRequestPayload = {
      ...body,
      prompt: finalPrompt,
      systemInstruction: finalSystem,
    };

    const response = await aiService.executeTask(payload);

    if (!response.success) {
      const status = response.code === "MISSING_KEY" ? 503 : response.code === "RATE_LIMITED" ? 429 : 500;
      return NextResponse.json(response, { status });
    }

    return NextResponse.json(response);
  } catch (err: any) {
    console.error("[API /api/ai/execute error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during AI processing: " + String(err.message || err),
        code: "PROVIDER_ERROR",
      },
      { status: 500 }
    );
  }
}
