"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Send,
  Sparkles,
  Upload,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Info,
  ShieldCheck,
  Trash2,
  FileSearch,
  Hash,
  HelpCircle
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { validatePdfFile } from "@/lib/pdf/pdf-utils";
import { extractTextFromPdf, chatWithPdf } from "@/lib/ai/ai-client";
import { DocumentChunk, AiChatMessage } from "@/lib/ai/types";
import { AiStatusBadge } from "./ai-status-badge";

const SUGGESTED_QUESTIONS = [
  "Summarize this PDF.",
  "Explain this document in simple English.",
  "What are the most important topics?",
  "Extract key definitions.",
  "What are the main conclusions and takeaways?",
  "Generate 10 exam review questions."
];

export function PdfAssistantSuite() {
  const [file, setFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isScanned, setIsScanned] = useState<boolean>(false);

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Handle PDF file selection
  const handleFileChange = async (selectedFile: File) => {
    setError(null);
    const validation = await validatePdfFile(selectedFile, 50);
    if (!validation.valid) {
      setError(validation.error || "Invalid PDF file.");
      return;
    }

    setFile(selectedFile);
    setIsExtracting(true);
    setChunks([]);
    setMessages([]);

    try {
      const extracted = await extractTextFromPdf(selectedFile);
      setTotalPages(extracted.pages.length);
      setChunks(extracted.chunks);
      setIsScanned(extracted.isScannedOrEmpty);

      // Add welcome message
      const welcomeMsg: AiChatMessage = {
        id: "welcome",
        role: "assistant",
        content: `I've analyzed **${selectedFile.name}** (${extracted.pages.length} pages, ${extracted.chunks.length} text segments). Ask me any question, request a summary, or pick a suggested topic below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([welcomeMsg]);
    } catch (err: any) {
      setError("Failed to extract text from PDF: " + (err.message || String(err)));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isGenerating) return;

    if (!file || chunks.length === 0) {
      setError("Please upload a PDF document before asking questions.");
      return;
    }

    const userMessage: AiChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsGenerating(true);
    setError(null);

    // Format chat history
    const historyPayload = messages
      .filter((m) => m.id !== "welcome")
      .slice(-6)
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await chatWithPdf(textToSend, chunks, historyPayload);

    if (response.success && response.result) {
      const assistantMessage: AiChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: response.result,
        pageReferences: response.pageReferences,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      setError(response.error || "Failed to generate answer. Check server logs or API key.");
    }

    setIsGenerating(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages((prev) => prev.slice(0, 1));
  };

  const handleResetDocument = () => {
    setFile(null);
    setChunks([]);
    setMessages([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="text-white space-y-8/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-[#777777]">
          <Link href="/" className="hover:text-[#F04452] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/ai-workspace" className="hover:text-[#F04452] transition-colors">
            AI Workspace
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#202124] font-medium">AI PDF Assistant</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-[#F04452]" />
              AI PDF Document Assistant
            </h1>
            <p className="text-sm sm:text-base text-[#777777] mt-1">
              Upload any PDF document and ask questions, generate grounded summaries, or extract key takeaways with exact page citations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AiStatusBadge />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Document Notice: </span>
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-xs text-rose-600 underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Scanned PDF Notice */}
        {isScanned && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Scanned Document Detected: </span>
              This PDF contains minimal selectable text. It may be a scanned image or photograph. The AI answers may be limited without optical character recognition (OCR). For best results, use a PDF with selectable digital text.
            </div>
          </div>
        )}

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Upload & Document Status (1 Col) */}
          <div className="space-y-4">
            <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#202124] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#F04452]" />
                Active Document
              </h3>

              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/80 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/20 hover:bg-red-500/10/30 group"
                >
                  <Upload className="w-8 h-8 text-[#777777] group-hover:text-[#F04452] mx-auto transition-colors" />
                  <p className="text-xs font-semibold text-[#202124] mt-2">
                    Click to upload PDF
                  </p>
                  <p className="text-[11px] text-[#777777] mt-0.5">Up to 50MB</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-500/10 border border-[#F04452]/25/80 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-[#202124] truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#777777] font-mono">
                      <span>{formatBytes(file.size)}</span>
                      <span>{totalPages} Pages</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#777777] pt-1">
                    <span>Text Segments:</span>
                    <span className="font-semibold text-[#202124]">{chunks.length} chunks</span>
                  </div>

                  <button
                    onClick={handleResetDocument}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-white/80 hover:bg-white/20 text-xs font-medium text-[#202124] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Change Document
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileChange(f);
                }}
              />
            </div>

            {/* Suggested Prompts Panel */}
            <div className="liquid-glass-card rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#F04452]" />
                Suggested Questions
              </h4>
              <div className="space-y-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    disabled={!file || isGenerating || isExtracting}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-2 rounded-lg text-xs font-medium text-[#202124] hover:text-[#D72638] hover:bg-red-500/10 border border-transparent hover:border-[#F04452]/25 disabled:opacity-40 transition-all leading-snug"
                  >
                    • {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Grounding & Privacy Card */}
            <div className="bg-white/20 rounded-2xl border border-white/80 p-4 space-y-2 text-xs text-[#777777]">
              <div className="font-bold text-[#202124] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Grounding & Privacy Guard
              </div>
              <p className="text-[11px] leading-relaxed">
                Answers are grounded strictly in the text of your uploaded PDF. Page citations are verified. No private documents are permanently stored on remote servers.
              </p>
            </div>
          </div>

          {/* Right Column: Chat Stream & Input (3 Cols) */}
          <div className="lg:col-span-3 liquid-glass-card rounded-2xl shadow-md flex flex-col h-[650px] overflow-hidden">
            {/* Chat Header */}
            <div className="px-5 py-3.5 border-b border-white/80 flex items-center justify-between bg-white/20/60">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#F04452]" />
                <span className="text-xs sm:text-sm font-bold text-[#202124]">
                  {file ? file.name : "Interactive Document Dialogue"}
                </span>
              </div>
              {messages.length > 1 && (
                <button
                  onClick={handleClearChat}
                  className="text-xs text-[#777777] hover:text-rose-600 font-medium transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {!file ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-[#F04452] flex items-center justify-center">
                    <FileSearch className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-[#202124] text-lg">No Document Uploaded</h3>
                  <p className="text-xs sm:text-sm text-[#777777] max-w-md">
                    Upload a PDF document using the panel on the left to start asking grounded questions, extracting summaries, or generating exam questions.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 liquid-btn-primary rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    Upload Document
                  </button>
                </div>
              ) : isExtracting ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-[#202124]">
                    Extracting text and indexing pages...
                  </p>
                  <p className="text-xs text-[#777777]">
                    Preserving page citations and splitting into semantic chunks.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.role === "user" ? "items-end" : "items-start"
                      } space-y-1`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white rounded-tr-none"
                            : "bg-white/30 text-[#202124] border border-white/80/80 rounded-tl-none whitespace-pre-wrap"
                        }`}
                      >
                        {m.content}

                        {/* Page references badge if present */}
                        {m.pageReferences && m.pageReferences.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/80/80 flex flex-wrap items-center gap-1.5 text-[11px] text-[#777777]">
                            <span className="font-semibold text-[#202124]">Grounded in:</span>
                            {m.pageReferences.map((pg) => (
                              <span
                                key={pg}
                                className="px-1.5 py-0.5 rounded bg-red-500/10 border border-[#F04452]/25 text-[#D72638] font-mono font-medium"
                              >
                                Page {pg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 px-1 text-[10px] text-[#777777]">
                        <span>{m.timestamp}</span>
                        {m.role === "assistant" && (
                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            className="hover:text-[#202124] transition-colors flex items-center gap-0.5"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copiedId === m.id ? "Copied" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex items-start space-x-2">
                      <div className="liquid-glass-card rounded-2xl rounded-tl-none px-4 py-3 text-xs text-[#777777] flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#F04452] animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-[#F04452] animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-[#F04452] animate-bounce [animation-delay:0.4s]" />
                        <span className="ml-1 text-[11px] font-medium text-[#777777]">
                          Retrieving relevant pages & answering...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Form Bar */}
            <div className="p-3.5 border-t border-white/80 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  disabled={!file || isGenerating || isExtracting}
                  placeholder={
                    file
                      ? "Ask anything about this document... (e.g. 'What are the main findings on page 4?')"
                      : "Upload a PDF document first to enable chat"
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/80 focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 text-xs sm:text-sm text-[#202124] disabled:bg-white/30 placeholder:text-[#777777]"
                />
                <button
                  type="submit"
                  disabled={!file || !inputQuery.trim() || isGenerating || isExtracting}
                  className="px-4 py-2.5 liquid-btn-primary rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
