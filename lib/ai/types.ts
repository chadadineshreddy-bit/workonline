export type AiTaskType =
  | "pdf_chat"
  | "summarize"
  | "generate_notes"
  | "generate_quiz"
  | "generate_flashcards"
  | "analyze_resume"
  | "write_email"
  | "rewrite_text"
  | "check_grammar"
  | "explain_topic"
  | "general_chat";

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  pageReferences?: number[];
  timestamp: string;
}

export interface DocumentChunk {
  chunkIndex: number;
  pageNumber: number;
  text: string;
  score?: number;
}

export interface AiRequestPayload {
  task: AiTaskType;
  prompt: string;
  systemInstruction?: string;
  context?: string;
  documentChunks?: DocumentChunk[];
  history?: { role: "user" | "assistant"; content: string }[];
  options?: {
    temperature?: number;
    maxOutputTokens?: number;
    difficulty?: "easy" | "medium" | "hard" | "beginner" | "detailed" | "revision";
    questionCount?: number;
    summaryFormat?: "short" | "detailed" | "bullets" | "executive" | "chapter";
    tone?: string;
    mode?: string;
    explanationLevel?: "beginner" | "intermediate" | "advanced";
  };
}

export interface AiResponsePayload {
  success: boolean;
  result?: string;
  data?: any;
  error?: string;
  code?: "MISSING_KEY" | "RATE_LIMITED" | "TIMEOUT" | "CONTEXT_LIMIT" | "INVALID_REQUEST" | "PROVIDER_ERROR";
  pageReferences?: number[];
  provider?: string;
  model?: string;
}

export interface AiStatusResponse {
  configured: boolean;
  provider: string;
  model: string;
  instructions?: string;
  source?: "server" | "client" | "none";
  testPassed?: boolean;
}
