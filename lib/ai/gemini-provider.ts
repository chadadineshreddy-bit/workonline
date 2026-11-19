import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiRequestPayload, AiResponsePayload } from "./types";

const DEFAULT_MODEL = process.env.AI_MODEL || "gemini-3.5-flash";
const FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"];
const REQUEST_TIMEOUT_MS = 35000;

export class GeminiProvider {
  private client: GoogleGenerativeAI | null = null;
  private currentKey: string = "";

  private getClient(): GoogleGenerativeAI | null {
    const key = process.env.GEMINI_API_KEY || "";
    if (!key) return null;
    if (this.client && this.currentKey === key) {
      return this.client;
    }
    this.currentKey = key;
    this.client = new GoogleGenerativeAI(key);
    return this.client;
  }

  public isConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY || "";
    return Boolean(key && key.trim().length > 0);
  }

  public getModelName(): string {
    return process.env.AI_MODEL || DEFAULT_MODEL;
  }

  public async generate(payload: AiRequestPayload): Promise<AiResponsePayload> {
    const client = this.getClient();
    if (!this.isConfigured() || !client) {
      return {
        success: false,
        error: "GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your .env.local file to enable genuine AI capabilities.",
        code: "MISSING_KEY",
        provider: "google-gemini",
        model: this.getModelName(),
      };
    }

    // Try preferred model, then fallback models if needed
    const candidateModels = Array.from(new Set([this.getModelName(), ...FALLBACK_MODELS]));
    let lastError: any = null;

    for (const modelToTry of candidateModels) {
      try {
        const model = client.getGenerativeModel({
          model: modelToTry,
          systemInstruction: payload.systemInstruction,
          generationConfig: {
            temperature: payload.options?.temperature ?? 0.4,
            maxOutputTokens: payload.options?.maxOutputTokens ?? 2048,
          },
        });

        // Construct prompt including any document context
        let fullPrompt = payload.prompt;
        if (payload.context && !fullPrompt.includes(payload.context)) {
          fullPrompt = `[Context Data]:\n${payload.context}\n\n[Task Request]:\n${payload.prompt}`;
        }

        // Execute request with timeout race
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), REQUEST_TIMEOUT_MS)
        );

        let apiPromise: Promise<any>;

        if (payload.history && payload.history.length > 0) {
          // Chat mode with history
          const formattedHistory = payload.history.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          }));

          const chat = model.startChat({
            history: formattedHistory,
          });

          apiPromise = chat.sendMessage(fullPrompt);
        } else {
          // Single completion mode
          apiPromise = model.generateContent(fullPrompt);
        }

        const result = await Promise.race([apiPromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();

        return {
          success: true,
          result: text,
          provider: "google-gemini",
          model: modelToTry,
        };
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || err);
        // If not a model-not-found / overload error, don't try other models
        if (!msg.includes("404") && !msg.includes("503") && !msg.includes("not found")) {
          break;
        }
      }
    }

    const err = lastError;
    console.error("[GeminiProvider Error]:", err);

    if (err?.message === "REQUEST_TIMEOUT") {
      return {
        success: false,
        error: "The AI request timed out after 35 seconds. Please try again with a shorter input or query.",
        code: "TIMEOUT",
        provider: "google-gemini",
        model: this.getModelName(),
      };
    }

    const errorMessage = String(err?.message || err);

    if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key not valid")) {
      return {
        success: false,
        error: "The provided GEMINI_API_KEY is invalid. Please verify your Google AI Studio API key.",
        code: "MISSING_KEY",
        provider: "google-gemini",
        model: this.getModelName(),
      };
    }

    if (errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("429")) {
      return {
        success: false,
        error: "Google Gemini rate limit exceeded. Please wait a moment before trying again.",
        code: "RATE_LIMITED",
        provider: "google-gemini",
        model: this.getModelName(),
      };
    }

    return {
      success: false,
      error: `AI processing failed: ${errorMessage.substring(0, 200)}`,
      code: "PROVIDER_ERROR",
      provider: "google-gemini",
      model: this.getModelName(),
    };
  }
}

export const geminiProvider = new GeminiProvider();
