import { geminiProvider } from "./gemini-provider";
import { AiRequestPayload, AiResponsePayload, AiStatusResponse, AiTaskType } from "./types";

export class AiService {
  public isConfigured(): boolean {
    return geminiProvider.isConfigured();
  }

  public getStatus(): AiStatusResponse {
    const configured = this.isConfigured();
    return {
      configured,
      provider: "Google Gemini",
      model: geminiProvider.getModelName(),
      instructions: configured
        ? "AI service is operational with live Google Gemini API."
        : "Set GEMINI_API_KEY in your .env.local file to enable real AI processing. You can get a free key from Google AI Studio (https://aistudio.google.com).",
    };
  }

  public async executeTask(payload: AiRequestPayload): Promise<AiResponsePayload> {
    // 1. Verify Configuration
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "AI engine is not configured on this server. Add GEMINI_API_KEY to .env.local to activate real AI features.",
        code: "MISSING_KEY",
        provider: "google-gemini",
      };
    }

    // 2. Validate input length safety
    if (!payload.prompt || payload.prompt.trim().length === 0) {
      return {
        success: false,
        error: "The prompt cannot be empty.",
        code: "INVALID_REQUEST",
      };
    }

    if (payload.prompt.length > 75000) {
      return {
        success: false,
        error: "The submitted text exceeds the safe context limit (75,000 characters). Please reduce document length or process section by section.",
        code: "CONTEXT_LIMIT",
      };
    }

    // 3. Delegate to active AI provider
    return geminiProvider.generate(payload);
  }

  // --- Task Prompt Generators ---

  public buildSummarizePrompt(
    text: string,
    format: "short" | "detailed" | "bullets" | "executive" | "chapter" = "bullets"
  ): { prompt: string; systemInstruction: string } {
    const formatInstructions = {
      short: "Provide a concise 1-2 paragraph executive summary covering core purpose and main outcome.",
      detailed: "Provide a comprehensive, multi-section detailed summary covering background, key arguments, findings, and conclusions.",
      bullets: "Provide a well-structured bullet-point summary grouped into: 1. Core Summary, 2. Key Takeaways, 3. Critical Definitions, and 4. Action Items.",
      executive: "Provide a corporate executive briefing with: Problem Statement, Proposed Solution, Strategic Impact, and Recommended Decisions.",
      chapter: "Provide a chronological, chapter-by-chapter or section-by-section breakdown with headings.",
    }[format];

    const systemInstruction = `You are WorkOnline's Professional Document Summarizer.
Your goal is to extract factual, high-value insights without fluff or repetition.
Adhere strictly to:
- Accuracy: Do not hallucinate or add facts not found in the original text.
- Formatting: Use markdown headings (###), bold key terms, and clean bullet lists.
- Style: Professional, concise, and structured.`;

    const prompt = `Please summarize the following document according to these requirements:
Format: ${format.toUpperCase()} (${formatInstructions})

--- DOCUMENT CONTENT ---
${text}
--- END DOCUMENT CONTENT ---`;

    return { prompt, systemInstruction };
  }

  public buildNotesPrompt(
    text: string,
    topic?: string,
    style: "beginner" | "detailed" | "revision" = "detailed"
  ): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are WorkOnline's Academic & Professional Notes Architect.
Generate structured study/revision notes adhering to:
- Hierarchical headings (# Topic, ## Subtopic, ### Core Concepts).
- High-yield definitions marked clearly as **Definition:**.
- Formula/Law callouts where applicable.
- Bulleted key takeaways.
- Clear, readable typography.`;

    const prompt = `Generate comprehensive ${style} notes for ${topic ? `topic: "${topic}"` : "the provided text"}.
Style: ${style.toUpperCase()} (Ensure ${style === "revision" ? "high-density bullet points and exam quick-review items" : style === "beginner" ? "plain-English analogies, simple breakdowns, and fundamental definitions" : "deep technical explanations and structured concept outlines"}).

--- SOURCE TEXT ---
${text}
--- END SOURCE TEXT ---`;

    return { prompt, systemInstruction };
  }

  public buildQuizPrompt(
    material: string,
    topic: string,
    questionCount: number = 5,
    difficulty: "easy" | "medium" | "hard" = "medium",
    questionType: "multiple_choice" | "true_false" | "short_answer" = "multiple_choice"
  ): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are WorkOnline's Quiz Generation Engine.
You MUST output ONLY a valid, parseable JSON array of questions, with NO Markdown code fence backticks and no conversational intro/outro text.
Each question object MUST strictly match this schema:
[
  {
    "id": "q1",
    "question": "Clear question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"], // empty array [] if short_answer
    "correctAnswer": "Exact string of correct option or model answer",
    "explanation": "Clear explanation why this answer is correct based on the material.",
    "difficulty": "${difficulty}",
    "type": "${questionType}"
  }
]`;

    const prompt = `Generate exactly ${questionCount} questions on ${topic ? `"${topic}"` : "the provided text"}.
Difficulty: ${difficulty.toUpperCase()}
Type: ${questionType.toUpperCase()}

Material:
${material}

Output ONLY the JSON array:`;

    return { prompt, systemInstruction };
  }

  public buildFlashcardsPrompt(
    material: string,
    topic: string,
    count: number = 8
  ): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are WorkOnline's Flashcard Creator.
You MUST output ONLY a valid, parseable JSON array of flashcards, with NO Markdown code fence backticks and no intro/outro.
Schema:
[
  {
    "id": "fc-1",
    "front": "Clear question, prompt, or term",
    "back": "Concise, precise answer, definition, or explanation",
    "category": "${topic || "General"}"
  }
]`;

    const prompt = `Generate exactly ${count} active-recall study flashcards on ${topic ? `"${topic}"` : "the provided material"}.

Material:
${material}

Output ONLY the JSON array:`;

    return { prompt, systemInstruction };
  }

  public buildResumeAnalysisPrompt(
    resumeText: string,
    jobDescription?: string
  ): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are WorkOnline's Senior Executive Resume Coach and ATS Specialist.
Provide an objective, constructive evaluation of the candidate's resume.
CRITICAL INTEGRITY RULES:
1. NEVER invent employers, job titles, university degrees, dates, certifications, or false metrics.
2. Provide concrete recommendations that the user can review and approve.
3. If a Job Description is supplied, perform a keyword gap analysis (identifying missing technical skills, domain phrases, and responsibility gaps).
4. Do NOT claim an arbitrary fake "ATS numerical score" (e.g. "87% guaranteed interview rate"). Give transparent, section-by-section qualitative and structural feedback.`;

    const prompt = `Evaluate the candidate's resume:

--- RESUME TEXT ---
${resumeText}
--- END RESUME TEXT ---

${
  jobDescription
    ? `--- TARGET JOB DESCRIPTION ---\n${jobDescription}\n--- END JOB DESCRIPTION ---\n`
    : ""
}

Please provide a structured report covering:
1. ### Executive Impression & Strengths
2. ### Structural & Formatting Critique (Missing sections, contact info, typography clarity)
3. ### Impact & Action Verb Enhancements (Show 3-5 before/after bullet rewrites using the STAR method: Situation, Task, Action, Result)
${jobDescription ? "4. ### Job Description Alignment & Keyword Gap Analysis (Matched skills vs. Missing keywords)" : ""}
5. ### Priority Action Checklist (3-5 concrete steps the candidate should take before submitting)`;

    return { prompt, systemInstruction };
  }

  public buildEmailPrompt(
    purpose: string,
    recipient: string,
    subject: string,
    keyPoints: string,
    tone: string = "Professional",
    length: string = "Medium"
  ): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are WorkOnline's Workplace Email Specialist.
Draft a clear, polite, and persuasive workplace email adhering to modern corporate communication etiquette.
Include:
- Subject line (if not specified or optimized)
- Appropriate salutation
- Clear opening paragraph stating purpose
- Well-organized body addressing key points
- Clear call-to-action or next steps
- Professional sign-off`;

    const prompt = `Draft a workplace email with these parameters:
- Recipient: ${recipient || "Team / Colleague"}
- Subject: ${subject || "Regarding Project Deliverables"}
- Purpose: ${purpose}
- Tone: ${tone}
- Length: ${length}
- Key Points to include:
${keyPoints}

Provide the email draft ready to copy and send:`;

    return { prompt, systemInstruction };
  }

  public buildTextRewritePrompt(
    text: string,
    mode: "professional" | "simple" | "concise" | "expand" | "grammar",
    targetTone: string = "Professional"
  ): { prompt: string; systemInstruction: string } {
    const modeDescriptions = {
      professional: "Enhance vocabulary, flow, and executive polish while keeping the core message clear.",
      simple: "Explain in simple English (plain language), avoiding jargon and complex sentence structures.",
      concise: "Eliminate fluff, redundant words, and filler phrases without losing essential meaning.",
      expand: "Elaborate with illustrative detail, depth, and explanatory clarity.",
      grammar: "Fix grammatical syntax, spelling errors, punctuation, and tense inconsistencies.",
    }[mode];

    const systemInstruction = `You are WorkOnline's Text Polishing & Rewriting Engine.
Your task is to rewrite the user's text to match the requested mode and tone.
RULES:
1. Maintain the author's original factual message.
2. Do NOT claim plagiarism bypass or AI-detection removal.
3. Return the rewritten text directly with a short 2-3 bullet explanation of what improvements were made.`;

    const prompt = `Rewrite the following text according to:
- Mode: ${mode.toUpperCase()} (${modeDescriptions})
- Target Tone: ${targetTone}

--- ORIGINAL TEXT ---
${text}
--- END ORIGINAL TEXT ---

Provide:
### Rewritten Text
[Your rewritten version here]

### Key Enhancements Made
- [Bullet 1]
- [Bullet 2]`;

    return { prompt, systemInstruction };
  }

  public buildGrammarCheckPrompt(text: string): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are WorkOnline's Grammar & Editorial Proofreader.
Analyze the user's text for spelling, grammar, punctuation, and clarity issues.
You MUST output ONLY a valid JSON object matching this schema:
{
  "correctedText": "The complete text with all corrections applied cleanly.",
  "issuesCount": 3,
  "corrections": [
    {
      "original": "original faulty snippet",
      "replacement": "corrected snippet",
      "type": "Spelling" | "Grammar" | "Punctuation" | "Clarity",
      "explanation": "Why this change was made."
    }
  ],
  "clarityScore": "Good" | "Needs Improvement" | "Excellent"
}`;

    const prompt = `Check grammar and proofread the following text:

--- TEXT ---
${text}
--- END TEXT ---

Output ONLY the JSON object:`;

    return { prompt, systemInstruction };
  }

  public buildExplainPrompt(
    topic: string,
    level: "beginner" | "intermediate" | "advanced" = "intermediate"
  ): { prompt: string; systemInstruction: string } {
    const systemInstruction = `You are WorkOnline's Educational & Professional Concept Explainer.
Explain complex ideas with clarity, pedagogical rigor, and engaging analogies.
Do not present speculative assumptions as verified facts.`;

    const levelGuide = {
      beginner: "Explain like I'm 12: use real-world everyday analogies, simple language, no confusing jargon, and clear foundational intuition.",
      intermediate: "Explain for university students or working professionals: provide conceptual depth, key terminology, practical use cases, and mechanism breakdowns.",
      advanced: "Explain at an expert/specialist level: cover rigorous theoretical underpinnings, edge cases, trade-offs, architecture, and mathematical/formal principles.",
    }[level];

    const prompt = `Explain the following topic:
Topic: "${topic}"
Target Level: ${level.toUpperCase()} (${levelGuide})

Structure your explanation with:
1. ### Quick Summary (In 2 sentences)
2. ### The Big Intuition (Everyday analogy or real-world mental model)
3. ### Step-by-Step Mechanism / Breakdown
4. ### Real-World Applications & Examples
5. ### Key Takeaways & Definitions
6. ### 3 Thought-Provoking Follow-Up Questions`;

    return { prompt, systemInstruction };
  }
}

export const aiService = new AiService();
