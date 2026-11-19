import { getPdfjs } from "@/lib/pdf/pdfjs-init";
import { extractDocxText } from "@/lib/docx/document-converters";
import { AiRequestPayload, AiResponsePayload, AiStatusResponse, DocumentChunk } from "./types";
import { splitPagesIntoChunks } from "./pdf-rag-pipeline";

const LOCAL_STORAGE_KEY = "workonline_gemini_api_key";
export const WORKONLINE_KEY_EVENT = "workonline_api_key_updated";

/**
 * Gets the client-side Gemini key if stored in browser localStorage.
 */
export function getClientGeminiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Sets or removes the client-side Gemini key and dispatches an update event.
 */
export function setClientGeminiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    const cleanKey = key ? key.trim() : "";
    if (!cleanKey) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, cleanKey);
    }
    window.dispatchEvent(new CustomEvent(WORKONLINE_KEY_EVENT, { detail: { key: cleanKey } }));
  } catch {}
}

/**
 * Checks server-side AI configuration status or verifies client key.
 */
export async function checkAiStatus(testProbe: boolean = false): Promise<AiStatusResponse> {
  try {
    const clientKey = getClientGeminiKey();
    const headers: Record<string, string> = {};
    if (clientKey) {
      headers["x-gemini-api-key"] = clientKey;
    }
    const url = testProbe ? "/api/ai/status?test=true" : "/api/ai/status";
    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        configured: false,
        provider: "Google Gemini",
        model: "gemini-3.5-flash",
        instructions: data.instructions || "Server responded with status " + res.status,
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      configured: false,
      provider: "Google Gemini",
      model: "gemini-3.5-flash",
      instructions: "Could not reach AI status endpoint: " + err.message,
    };
  }
}

/**
 * Executes a task through the secure backend AI API.
 */
export async function executeAiTask(payload: AiRequestPayload): Promise<AiResponsePayload> {
  try {
    const clientKey = getClientGeminiKey();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (clientKey) {
      headers["x-gemini-api-key"] = clientKey;
    }

    const res = await fetch("/api/ai/execute", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data: AiResponsePayload = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: "Network request to AI service failed: " + err.message,
      code: "PROVIDER_ERROR",
    };
  }
}

/**
 * Executes a grounded question-answering request for an uploaded PDF.
 */
export async function chatWithPdf(
  question: string,
  chunks: DocumentChunk[],
  history?: { role: "user" | "assistant"; content: string }[]
): Promise<AiResponsePayload> {
  try {
    const clientKey = getClientGeminiKey();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (clientKey) {
      headers["x-gemini-api-key"] = clientKey;
    }

    const res = await fetch("/api/ai/pdf-chat", {
      method: "POST",
      headers,
      body: JSON.stringify({ question, chunks, history }),
    });

    const data: AiResponsePayload = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: "Failed to communicate with Document QA service: " + err.message,
      code: "PROVIDER_ERROR",
    };
  }
}

/**
 * Extracts text from an uploaded PDF file in the browser, preserving page numbers.
 */
export async function extractTextFromPdf(file: File): Promise<{
  pages: { pageNumber: number; text: string }[];
  chunks: DocumentChunk[];
  totalText: string;
  isScannedOrEmpty: boolean;
}> {
  const pdfjs = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const pages: { pageNumber: number; text: string }[] = [];
  let combinedText = "";

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push({ pageNumber: i, text: pageText });
    if (pageText) {
      combinedText += (combinedText ? "\n\n" : "") + `[Page ${i}]\n` + pageText;
    }
  }

  const chunks = splitPagesIntoChunks(pages);
  const isScannedOrEmpty = combinedText.trim().length < 40;

  return {
    pages,
    chunks,
    totalText: combinedText,
    isScannedOrEmpty,
  };
}

/**
 * Extracts text from an uploaded DOCX or TXT file.
 */
export async function extractTextFromDoc(file: File): Promise<{
  text: string;
  filename: string;
}> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".docx")) {
    const { text } = await extractDocxText(file);
    return { text, filename: file.name };
  }

  if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    const text = await file.text();
    return { text, filename: file.name };
  }

  throw new Error(`Unsupported file type: ${file.name}. Please upload PDF, DOCX, or TXT.`);
}
