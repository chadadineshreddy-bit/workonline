"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Scissors,
  Copy,
  ClipboardPaste,
  Paintbrush,
  Undo2,
  Redo2,
  Download,
  Upload,
  Printer,
  Search,
  Sparkles,
  Maximize,
  Minimize,
  Highlighter,
  Palette,
  Volume2,
  VolumeX,
  FileText,
  FileCheck,
  Check,
  X,
  ArrowLeft,
  Layers,
  HelpCircle,
  Clock,
  Settings,
  ChevronDown,
  Info,
  Calendar,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react";
import { exportHtmlToDocxBlob } from "@/lib/docx/docx-export";
import { importDocxFile } from "@/lib/docx/docx-import";
import { convertPdfToWordHtml } from "@/lib/pdf/pdf-to-word";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { executeAiTask } from "@/lib/ai/ai-client";

type RibbonTab = "File" | "Home" | "Insert" | "Layout" | "Review" | "View" | "AI";

export function WordEditor() {
  const [docTitle, setDocTitle] = useState("Document1");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");
  const [activeTab, setActiveTab] = useState<RibbonTab>("Home");

  // Metrics
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  // View Settings
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  const [showOutline, setShowOutline] = useState(false);
  const [outlineItems, setOutlineItems] = useState<{ id: string; text: string; level: number }[]>([]);
  const [pageMargins, setPageMargins] = useState<"normal" | "narrow" | "moderate" | "wide">("normal");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [fontFamily, setFontFamily] = useState("Calibri");
  const [fontSize, setFontSize] = useState("11pt");

  // Modals & Panels
  const [showBackstage, setShowBackstage] = useState(false);
  const [backstageSection, setBackstageSection] = useState<"info" | "new" | "open" | "save" | "export" | "print">("new");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showWordCountModal, setShowWordCountModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Audio Speech (Read Aloud)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI Assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultNotice, setAiResultNotice] = useState<string | null>(null);

  // Drag and drop overlay
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Sample Content
  const defaultTemplate = `
    <h1 style="color: #2F5597; font-size: 22pt; font-weight: bold; margin-bottom: 4px;">Executive Project Summary</h1>
    <p style="color: #595959; font-size: 11pt; margin-bottom: 16px;">Prepared for: <strong>Strategic Review Board</strong> | Author: <em>Dinesh Reddy Chada</em></p>
    <hr style="border: none; border-top: 1px solid #D1D5DB; margin: 16px 0;" />
    <h2 style="color: #2F5597; font-size: 15pt; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">1. Project Objectives</h2>
    <p style="line-height: 1.4; margin-bottom: 10px;">This initiative delivers an enterprise-grade document creation, formatting, and conversion suite running entirely client-side. The workspace combines desktop word-processing ergonomics with fast serverless AI capabilities.</p>
    <h2 style="color: #2F5597; font-size: 15pt; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">2. Architecture & Operational Milestones</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 14px 0;">
      <thead>
        <tr style="background-color: #F2F4F8;">
          <th style="border: 1px solid #7F7F7F; padding: 8px; text-align: left; font-weight: bold;">Workstream</th>
          <th style="border: 1px solid #7F7F7F; padding: 8px; text-align: left; font-weight: bold;">Implementation</th>
          <th style="border: 1px solid #7F7F7F; padding: 8px; text-align: left; font-weight: bold;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #7F7F7F; padding: 8px;">Word Engine</td>
          <td style="border: 1px solid #7F7F7F; padding: 8px;">Ribbon UI, Mammoth DOCX Parsing & DOCX Generation</td>
          <td style="border: 1px solid #7F7F7F; padding: 8px; color: #166534; font-weight: bold;">Complete</td>
        </tr>
        <tr>
          <td style="border: 1px solid #7F7F7F; padding: 8px;">PDF Converter</td>
          <td style="border: 1px solid #7F7F7F; padding: 8px;">Direct PDF text extraction & structured Word reconstruction</td>
          <td style="border: 1px solid #7F7F7F; padding: 8px; color: #166534; font-weight: bold;">Complete</td>
        </tr>
        <tr>
          <td style="border: 1px solid #7F7F7F; padding: 8px;">AI Copilot</td>
          <td style="border: 1px solid #7F7F7F; padding: 8px;">Contextual rewriting, grammar verification & summarization</td>
          <td style="border: 1px solid #7F7F7F; padding: 8px; color: #166534; font-weight: bold;">Operational</td>
        </tr>
      </tbody>
    </table>
    <h2 style="color: #2F5597; font-size: 15pt; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">3. Key Recommendations</h2>
    <ul style="padding-left: 24px; margin-bottom: 12px; line-height: 1.4;">
      <li style="margin-bottom: 4px;">Leverage multi-format import (.docx and .pdf) to edit existing documents instantly.</li>
      <li style="margin-bottom: 4px;">Utilize authentic Word styles for consistent typographic hierarchy.</li>
      <li style="margin-bottom: 4px;">Export to standards-compliant DOCX or high-fidelity print PDF at any time.</li>
    </ul>
  `;

  // Sample Resume Template
  const resumeTemplate = `
    <div style="text-align: center; margin-bottom: 16px;">
      <h1 style="color: #1F3864; font-size: 26pt; font-weight: bold; letter-spacing: 0.05em; margin: 0; text-transform: uppercase;">DINESH REDDY CHADA</h1>
      <p style="color: #595959; font-size: 11pt; margin-top: 4px; margin-bottom: 12px;">Software Engineer & Data Systems Specialist</p>
      <p style="color: #262626; font-size: 9.5pt; margin: 0;">Hyderabad, India | contact@dineshreddy.dev | +91 98765 43210 | linkedin.com/in/dineshreddy</p>
    </div>
    <hr style="border: none; border-top: 2px solid #2F5597; margin: 12px 0;" />
    
    <h2 style="color: #2F5597; font-size: 13.5pt; font-weight: bold; text-transform: uppercase; margin-top: 14px; margin-bottom: 6px; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px;">Professional Summary</h2>
    <p style="line-height: 1.35; margin-bottom: 10px;">Results-oriented engineer with solid expertise in full-stack web applications, distributed data systems, and cloud infrastructure. Proven track record of developing modern software architectures and delivering high-performance tools with clean, accessible design.</p>
    
    <h2 style="color: #2F5597; font-size: 13.5pt; font-weight: bold; text-transform: uppercase; margin-top: 14px; margin-bottom: 6px; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px;">Technical Core Competencies</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 8px 0; border: none;">
      <tbody>
        <tr>
          <td style="border: none; padding: 4px 8px 4px 0; width: 25%; font-weight: bold; color: #1F3864;">Languages & Core:</td>
          <td style="border: none; padding: 4px 0;">TypeScript, JavaScript, Python, SQL, HTML5, CSS3 / Tailwind</td>
        </tr>
        <tr>
          <td style="border: none; padding: 4px 8px 4px 0; font-weight: bold; color: #1F3864;">Frameworks & Tools:</td>
          <td style="border: none; padding: 4px 0;">Next.js, React, Node.js, Express, Fastify, Docker, Git</td>
        </tr>
        <tr>
          <td style="border: none; padding: 4px 8px 4px 0; font-weight: bold; color: #1F3864;">Data & Analytics:</td>
          <td style="border: none; padding: 4px 0;">PostgreSQL, MongoDB, Power BI, Tableau, Redis, Vector Databases</td>
        </tr>
      </tbody>
    </table>

    <h2 style="color: #2F5597; font-size: 13.5pt; font-weight: bold; text-transform: uppercase; margin-top: 14px; margin-bottom: 6px; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px;">Professional Experience</h2>
    <div style="margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; color: #1F3864;">
        <span>Lead Full-Stack Developer — WorkOnline Systems</span>
        <span style="font-style: italic;">2023 — Present</span>
      </div>
      <ul style="padding-left: 20px; margin-top: 4px; margin-bottom: 8px; line-height: 1.35;">
        <li>Spearheaded comprehensive digital document studio and PDF conversion ecosystem serving daily active users.</li>
        <li>Implemented in-browser client-side document processing algorithms eliminating server latency and maintaining strict user privacy.</li>
        <li>Integrated AI productivity modules delivering sub-second document summaries and resume feedback.</li>
      </ul>
    </div>

    <h2 style="color: #2F5597; font-size: 13.5pt; font-weight: bold; text-transform: uppercase; margin-top: 14px; margin-bottom: 6px; border-bottom: 1px solid #D1D5DB; padding-bottom: 2px;">Education</h2>
    <div style="display: flex; justify-content: space-between; font-weight: bold; color: #1F3864;">
      <span>B.Tech in Computer Science & Data Science</span>
      <span>2022 — 2026</span>
    </div>
    <p style="color: #595959; margin: 2px 0 8px 0;">CMR Technical Campus | CGPA: 7.85 / 10.0</p>
  `;

  // Load from local storage or set initial
  useEffect(() => {
    const savedDraft = localStorage.getItem("workonline_editor_draft");
    const savedTitle = localStorage.getItem("workonline_editor_title");
    if (editorRef.current) {
      if (savedDraft) {
        editorRef.current.innerHTML = savedDraft;
      } else {
        editorRef.current.innerHTML = defaultTemplate;
      }
      updateMetrics();
    }
    if (savedTitle) setDocTitle(savedTitle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update counts, pages and outline
  const updateMetrics = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);

    // Approximate page count (approx 450 words per single-spaced A4 page or height / 1056)
    const contentHeight = editorRef.current.scrollHeight;
    const estimatedPages = Math.max(1, Math.ceil(contentHeight / 980));
    setPageCount(estimatedPages);

    // Headings outline
    const headings = editorRef.current.querySelectorAll("h1, h2, h3");
    const items: { id: string; text: string; level: number }[] = [];
    headings.forEach((h, index) => {
      const id = `heading-${index}`;
      h.setAttribute("id", id);
      const level = parseInt(h.tagName.substring(1), 10);
      items.push({ id, text: h.textContent || `Section ${index + 1}`, level });
    });
    setOutlineItems(items);
  };

  const handleInput = () => {
    setSaveStatus("saving");
    updateMetrics();

    if (editorRef.current) {
      localStorage.setItem("workonline_editor_draft", editorRef.current.innerHTML);
      localStorage.setItem("workonline_editor_title", docTitle);
    }

    setTimeout(() => {
      setSaveStatus("saved");
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 450);
  };

  // Standard Document Executive Commands
  const format = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const applyHeading = (tag: string) => {
    format("formatBlock", tag);
  };

  const applyStyle = (styleName: string) => {
    if (!editorRef.current) return;
    switch (styleName) {
      case "normal":
        format("formatBlock", "p");
        break;
      case "no-spacing":
        format("formatBlock", "p");
        format("insertHTML", `<p style="margin: 0; line-height: 1.15;">${window.getSelection()?.toString() || ""}</p>`);
        break;
      case "h1":
        format("formatBlock", "h1");
        break;
      case "h2":
        format("formatBlock", "h2");
        break;
      case "h3":
        format("formatBlock", "h3");
        break;
      case "title":
        format("insertHTML", `<h1 style="color: #1F3864; font-size: 26pt; font-weight: bold; border-bottom: 2px solid #2F5597; padding-bottom: 4px; margin-bottom: 12px;">${window.getSelection()?.toString() || "Document Title"}</h1>`);
        break;
      case "subtitle":
        format("insertHTML", `<p style="color: #595959; font-size: 13pt; font-style: italic; margin-bottom: 14px;">${window.getSelection()?.toString() || "Subtitle description"}</p>`);
        break;
      case "quote":
        format("formatBlock", "blockquote");
        break;
    }
    handleInput();
  };

  const applyFontFamily = (family: string) => {
    setFontFamily(family);
    format("fontName", family);
  };

  const applyFontSize = (sizeStr: string) => {
    setFontSize(sizeStr);
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = sizeStr;
    try {
      range.surroundContents(span);
    } catch {
      document.execCommand("fontSize", false, "3");
    }
    handleInput();
  };

  const changeCase = (type: "upper" | "lower" | "title") => {
    const selection = window.getSelection();
    if (!selection || !selection.toString()) return;
    const text = selection.toString();
    let converted = text;
    if (type === "upper") converted = text.toUpperCase();
    if (type === "lower") converted = text.toLowerCase();
    if (type === "title") {
      converted = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    }
    format("insertText", converted);
  };

  const insertTable = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;"><tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="border: 1px solid #7F7F7F; padding: 8px; min-width: 60px;">${r === 0 ? `<strong>Header ${c + 1}</strong>` : `Data`}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br/></p>`;

    format("insertHTML", tableHtml);
    setShowTableModal(false);
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    if (!editorRef.current) return;
    editorRef.current.focus();

    const textToDisplay = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #0563C1; text-decoration: underline;">${textToDisplay}</a>`;
    format("insertHTML", linkHtml);
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const insertPageBreak = () => {
    const pageBreakHtml = `<div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #94a3b8; margin: 32px 0; text-align: center;"><span style="background: #e2e8f0; color: #475569; font-size: 10px; font-weight: bold; padding: 2px 10px; border-radius: 4px; letter-spacing: 0.05em;">PAGE BREAK</span></div><p><br/></p>`;
    format("insertHTML", pageBreakHtml);
  };

  const insertDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    format("insertText", dateStr);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const imgHtml = `<img src="${reader.result}" style="max-width: 100%; height: auto; margin: 14px 0; border: 1px solid #D1D5DB;" alt="Document illustration"/><p><br/></p>`;
        format("insertHTML", imgHtml);
      }
    };
    reader.readAsDataURL(file);
  };

  // Find and replace
  const handleFindReplace = () => {
    if (!editorRef.current || !findText.trim()) return;
    const html = editorRef.current.innerHTML;
    const regex = new RegExp(findText, "gi");
    editorRef.current.innerHTML = html.replace(regex, replaceText);
    handleInput();
    setStatusMessage(`Replaced all occurrences of "${findText}".`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Universal Document Open (DOCX & PDF)
  const handleUniversalImport = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    setStatusMessage(`Loading ${file.name}...`);

    if (lowerName.endsWith(".docx")) {
      const res = await importDocxFile(file);
      if (!res.success) {
        alert(res.error || "Unable to import DOCX file.");
        setStatusMessage(null);
        return;
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = res.html;
        setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
        handleInput();
        setStatusMessage(`Opened ${file.name} successfully.`);
        setShowBackstage(false);
      }
    } else if (lowerName.endsWith(".pdf")) {
      const res = await convertPdfToWordHtml(file);
      if (!res.success) {
        alert(res.error || "Unable to parse PDF.");
        setStatusMessage(null);
        return;
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = res.html;
        setDocTitle(res.title || file.name.replace(/\.[^/.]+$/, ""));
        handleInput();
        setStatusMessage(`Converted ${file.name} to editable Word document (${res.pageCount} pages).`);
        setShowBackstage(false);
      }
    } else {
      alert("Please select a standard Word document (.docx) or PDF document (.pdf).");
      setStatusMessage(null);
    }
  };

  // Drag and Drop handling
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUniversalImport(e.dataTransfer.files[0]);
    }
  };

  // Export to genuine DOCX
  const handleExportDocx = async () => {
    if (!editorRef.current) return;
    try {
      setIsExporting(true);
      const html = editorRef.current.innerHTML;
      const blob = await exportHtmlToDocxBlob(html, docTitle);
      triggerBlobDownload(blob, `${docTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "Document"}.docx`);
      setStatusMessage("Exported Microsoft Word (.docx) document.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("DOCX Export Error:", err);
      alert("Error generating DOCX document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF / Print
  const handlePrintOrPdf = () => {
    window.print();
  };

  // Export to TXT
  const handleExportTxt = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    triggerBlobDownload(blob, `${docTitle}.txt`);
  };

  // Speech Synthesizer (Read Aloud)
  const toggleReadAloud = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = window.getSelection()?.toString() || editorRef.current?.innerText || "";
    if (!textToRead.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // AI Document Assistant Task Execution
  const handleAiAction = async (actionType: "rewrite" | "grammar" | "summarize" | "expand") => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    const textToProcess = selectedText || editorRef.current.innerText.slice(0, 4000);

    if (!textToProcess) {
      alert("Please select text or add document content for the AI Assistant.");
      return;
    }

    try {
      setAiLoading(true);
      setAiResultNotice(null);

      let prompt = "";
      let taskType: "rewrite_text" | "check_grammar" | "summarize" = "rewrite_text";

      if (actionType === "rewrite") {
        taskType = "rewrite_text";
        prompt = `You are an expert executive editor. Rewrite the following text to make it exceptionally professional, clear, and impactful while preserving all key information:\n\n${textToProcess}`;
      } else if (actionType === "grammar") {
        taskType = "check_grammar";
        prompt = `Proofread the following text. Fix all grammatical mistakes, spelling errors, and punctuation flaws. Return the corrected version only without commentary:\n\n${textToProcess}`;
      } else if (actionType === "summarize") {
        taskType = "summarize";
        prompt = `Generate a concise 3-bullet executive summary of the following document content:\n\n${textToProcess}`;
      } else if (actionType === "expand") {
        taskType = "rewrite_text";
        prompt = `Elaborate and provide thorough professional depth and clarity to the following points:\n\n${textToProcess}`;
      }

      const res = await executeAiTask({
        task: taskType,
        prompt: prompt,
      });

      if (!res.success || !res.result) {
        alert(res.error || "AI service temporarily unavailable. Please try again.");
        return;
      }

      if (actionType === "summarize") {
        // Insert summary box at top
        const summaryHtml = `<div style="background-color: #F0F4F8; border-left: 4px solid #2F5597; padding: 12px 16px; margin: 16px 0; border-radius: 2px;"><h4 style="color: #1F3864; font-weight: bold; margin: 0 0 6px 0;">Executive AI Summary:</h4><p style="margin: 0; line-height: 1.4;">${res.result.replace(/\n/g, "<br/>")}</p></div>`;
        format("insertHTML", summaryHtml);
      } else if (selectedText) {
        format("insertText", res.result);
      } else {
        // Replace or append
        format("insertHTML", `<p>${res.result.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`);
      }

      setAiResultNotice(`AI ${actionType} completed successfully.`);
      setTimeout(() => setAiResultNotice(null), 4000);
    } catch (err: any) {
      alert("AI Assistant error: " + (err.message || "Failed to process request."));
    } finally {
      setAiLoading(false);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Margin padding styling
  const getMarginClass = () => {
    switch (pageMargins) {
      case "narrow":
        return "p-8 sm:p-10";
      case "wide":
        return "p-16 sm:p-24";
      case "moderate":
        return "p-10 sm:p-14";
      default:
        return "p-12 sm:p-16";
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col bg-[#EAEAEA] text-slate-800 overflow-hidden font-sans select-none relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
    >
      {/* =========================================================================
          1. TOP BLUE TITLE BAR (Classic Microsoft Word Blue: #2B579A)
          ========================================================================= */}
      <header className="bg-[#2B579A] text-white flex items-center justify-between px-3 h-10 select-none text-xs shrink-0 print:hidden shadow-sm z-30">
        {/* Left: Quick Access Toolbar */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/workspace"
            className="flex items-center gap-1 px-2 py-1 hover:bg-white/15 rounded text-white/95 font-medium transition-colors"
            title="Return to WorkOnline Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">WorkOnline</span>
          </Link>

          <span className="w-px h-4 bg-white/25 mx-1" />

          {/* Floppy Disk Quick Save */}
          <button
            type="button"
            onClick={handleInput}
            className="p-1 hover:bg-white/15 rounded text-white transition-colors"
            title="Save Document (Ctrl+S)"
          >
            <Check className="w-4 h-4" />
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => format("undo")}
            className="p-1 hover:bg-white/15 rounded text-white transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => format("redo")}
            className="p-1 hover:bg-white/15 rounded text-white transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* AutoSave Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-white/90 bg-white/10 px-2 py-0.5 rounded ml-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AutoSave On</span>
          </div>
        </div>

        {/* Center: Document Title & Save Status */}
        <div className="flex items-center gap-2 max-w-sm sm:max-w-md truncate">
          <input
            type="text"
            value={docTitle}
            onChange={(e) => {
              setDocTitle(e.target.value);
              setSaveStatus("saving");
              localStorage.setItem("workonline_editor_title", e.target.value);
              setTimeout(() => setSaveStatus("saved"), 400);
            }}
            title="Click to rename document"
            className="bg-transparent hover:bg-white/15 focus:bg-white/20 text-white font-bold text-center px-2 py-0.5 rounded outline-none text-xs sm:text-sm border border-transparent focus:border-white/40 truncate"
          />
          <span className="text-[11px] text-white/80 hidden lg:inline">
            — Word ({saveStatus === "saving" ? "Saving..." : `Saved locally ${lastSavedTime}`})
          </span>
        </div>

        {/* Right: User initials, Fullscreen, and Share */}
        <div className="flex items-center gap-2">
          {/* Export Dropdown Trigger */}
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExporting}
            className="hidden sm:inline-flex items-center gap-1 bg-white text-[#2B579A] hover:bg-white/90 font-bold px-2.5 py-1 rounded text-xs shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Exporting..." : "Share / Export"}</span>
          </button>

          {/* User Badge: Dinesh Reddy Chada */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/15 rounded cursor-pointer"
            title="Dinesh Reddy Chada (Document Creator)"
          >
            <div className="w-6 h-6 rounded-full bg-[#185ABD] text-white flex items-center justify-center font-bold text-[10px] border border-white/40">
              CD
            </div>
            <span className="text-[11px] font-medium hidden xl:inline text-white/95">Dinesh Reddy</span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:bg-white/15 rounded text-white"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. RIBBON TABS HEADER
          ========================================================================= */}
      <nav className="bg-[#2B579A] px-2 flex items-center gap-0.5 select-none text-xs border-b border-[#214376] shrink-0 print:hidden z-20">
        {/* File Tab (Solid Darker Blue Backstage opener) */}
        <button
          type="button"
          onClick={() => {
            setShowBackstage(true);
            setBackstageSection("new");
          }}
          className="bg-[#103F7E] hover:bg-[#0A2E60] text-white font-bold px-4 py-1.5 transition-colors uppercase tracking-wider text-[11px]"
        >
          File
        </button>

        {/* Workspace Ribbon Tabs */}
        {(["Home", "Insert", "Layout", "Review", "View", "AI"] as RibbonTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                isActive
                  ? "bg-[#F3F2F1] text-[#2B579A] shadow-sm"
                  : "text-white/90 hover:bg-white/15 hover:text-white"
              }`}
            >
              {tab === "AI" ? "AI Copilot ✨" : tab}
            </button>
          );
        })}

        {/* Search tool: Tell me what you want to do */}
        <div className="ml-auto hidden md:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/90 px-3 py-1 rounded text-xs transition-colors">
          <Search className="w-3.5 h-3.5 text-white/70" />
          <input
            type="text"
            placeholder="Tell me what you want to do..."
            value={findText}
            onChange={(e) => {
              setFindText(e.target.value);
              setShowFindReplace(true);
            }}
            className="bg-transparent text-white placeholder-white/70 outline-none text-xs w-44"
          />
        </div>
      </nav>

      {/* =========================================================================
          3. RIBBON TOOLBAR BODY (Partitioned groups with vertical dividers)
          ========================================================================= */}
      <div className="bg-[#F3F2F1] text-slate-800 border-b border-[#D1D5DB] px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto min-h-[94px] select-none text-xs shrink-0 print:hidden shadow-inner z-10">
        {/* ----------------- TAB: HOME ----------------- */}
        {activeTab === "Home" && (
          <div className="flex items-stretch gap-2">
            {/* Clipboard Group */}
            <div className="flex flex-col justify-between items-center pr-2 border-r border-[#D1D5DB]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.readText().then((clipText) => {
                      if (clipText) format("insertText", clipText);
                    }).catch(() => {
                      alert("Please use Ctrl+V to paste content directly into the document.");
                    });
                  }}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-white/80 rounded w-12 text-slate-700"
                  title="Paste (Ctrl+V)"
                >
                  <ClipboardPaste className="w-5 h-5 text-[#2B579A]" />
                  <span className="text-[10px] mt-0.5">Paste</span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => format("cut")}
                    className="p-1 hover:bg-white/80 rounded text-slate-700 flex items-center gap-1 text-[11px]"
                    title="Cut (Ctrl+X)"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Cut</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("copy")}
                    className="p-1 hover:bg-white/80 rounded text-slate-700 flex items-center gap-1 text-[11px]"
                    title="Copy (Ctrl+C)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("formatBlock", "p")}
                    className="p-1 hover:bg-white/80 rounded text-slate-700 flex items-center gap-1 text-[11px]"
                    title="Format Painter"
                  >
                    <Paintbrush className="w-3.5 h-3.5 text-amber-600" />
                    <span>Painter</span>
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Clipboard</span>
            </div>

            {/* Font Group */}
            <div className="flex flex-col justify-between items-center px-2 border-r border-[#D1D5DB]">
              <div className="space-y-1">
                {/* Row 1: Font Family, Size, Grow/Shrink, Clear */}
                <div className="flex items-center gap-1">
                  <select
                    value={fontFamily}
                    onChange={(e) => applyFontFamily(e.target.value)}
                    className="bg-white border border-[#D1D5DB] rounded px-1.5 py-0.5 text-xs text-slate-800 outline-none w-28"
                  >
                    <option value="Calibri">Calibri (Body)</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Courier New">Courier New</option>
                  </select>

                  <select
                    value={fontSize}
                    onChange={(e) => applyFontSize(e.target.value)}
                    className="bg-white border border-[#D1D5DB] rounded px-1.5 py-0.5 text-xs text-slate-800 outline-none w-14"
                  >
                    <option value="9pt">9</option>
                    <option value="10pt">10</option>
                    <option value="11pt">11</option>
                    <option value="12pt">12</option>
                    <option value="14pt">14</option>
                    <option value="16pt">16</option>
                    <option value="18pt">18</option>
                    <option value="20pt">20</option>
                    <option value="24pt">24</option>
                    <option value="28pt">28</option>
                    <option value="36pt">36</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => format("fontSize", "4")}
                    className="p-1 hover:bg-white/80 rounded font-bold text-xs"
                    title="Increase Font Size"
                  >
                    A^
                  </button>
                  <button
                    type="button"
                    onClick={() => format("fontSize", "2")}
                    className="p-1 hover:bg-white/80 rounded font-bold text-xs"
                    title="Decrease Font Size"
                  >
                    Av
                  </button>

                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      type="button"
                      onClick={() => changeCase("upper")}
                      className="p-1 hover:bg-white/80 rounded text-[11px] font-semibold"
                      title="UPPERCASE"
                    >
                      AA
                    </button>
                    <button
                      type="button"
                      onClick={() => format("removeFormat")}
                      className="p-1 hover:bg-white/80 rounded text-[11px] font-semibold text-rose-600"
                      title="Clear All Formatting"
                    >
                      A\
                    </button>
                  </div>
                </div>

                {/* Row 2: Bold, Italic, Underline, Strikethrough, Sub, Super, Colors */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("bold")}
                    className="p-1 hover:bg-white/80 rounded font-bold"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("italic")}
                    className="p-1 hover:bg-white/80 rounded italic"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("underline")}
                    className="p-1 hover:bg-white/80 rounded underline"
                    title="Underline (Ctrl+U)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("strikeThrough")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("subscript")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Subscript"
                  >
                    <Subscript className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("superscript")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Superscript"
                  >
                    <Superscript className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-px h-4 bg-[#D1D5DB] mx-0.5" />

                  {/* Text Highlight Color */}
                  <label className="flex items-center gap-0.5 p-1 hover:bg-white/80 rounded cursor-pointer" title="Highlight Color">
                    <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                    <input
                      type="color"
                      defaultValue="#FFFF00"
                      onChange={(e) => format("hiliteColor", e.target.value)}
                      className="w-3.5 h-3.5 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </label>

                  {/* Font Color */}
                  <label className="flex items-center gap-0.5 p-1 hover:bg-white/80 rounded cursor-pointer" title="Font Color">
                    <Palette className="w-3.5 h-3.5 text-[#2F5597]" />
                    <input
                      type="color"
                      defaultValue="#000000"
                      onChange={(e) => format("foreColor", e.target.value)}
                      className="w-3.5 h-3.5 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </label>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Font</span>
            </div>

            {/* Paragraph Group */}
            <div className="flex flex-col justify-between items-center px-2 border-r border-[#D1D5DB]">
              <div className="space-y-1">
                {/* Row 1: Bullets, Numbered, Indent, Outdent */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("insertUnorderedList")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Bullets"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("insertOrderedList")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Numbering"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("outdent")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Decrease Indent"
                  >
                    <Outdent className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("indent")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Increase Indent"
                  >
                    <Indent className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Row 2: Align Left, Center, Right, Justify */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("justifyLeft")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("justifyCenter")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Align Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("justifyRight")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("justifyFull")}
                    className="p-1 hover:bg-white/80 rounded"
                    title="Justify"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Paragraph</span>
            </div>

            {/* Styles Gallery Group */}
            <div className="flex flex-col justify-between items-center px-2 border-r border-[#D1D5DB]">
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-sm xl:max-w-md pb-0.5">
                <button
                  type="button"
                  onClick={() => applyStyle("normal")}
                  className="flex flex-col items-center justify-center border border-[#D1D5DB] bg-white hover:bg-blue-50 px-2 py-1 rounded min-w-[54px] text-left transition-colors"
                  title="Normal Text"
                >
                  <span className="text-xs font-medium text-slate-800">AaBbCc</span>
                  <span className="text-[9px] text-slate-500">Normal</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyStyle("no-spacing")}
                  className="flex flex-col items-center justify-center border border-[#D1D5DB] bg-white hover:bg-blue-50 px-2 py-1 rounded min-w-[54px] text-left transition-colors"
                  title="No Spacing"
                >
                  <span className="text-xs font-medium text-slate-800">AaBbCc</span>
                  <span className="text-[9px] text-slate-500 truncate">No Spac...</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyStyle("h1")}
                  className="flex flex-col items-center justify-center border border-[#D1D5DB] bg-white hover:bg-blue-50 px-2 py-1 rounded min-w-[54px] text-left transition-colors"
                  title="Heading 1"
                >
                  <span className="text-xs font-bold text-[#2F5597]">AaBbC</span>
                  <span className="text-[9px] text-[#2F5597]">Heading 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyStyle("h2")}
                  className="flex flex-col items-center justify-center border border-[#D1D5DB] bg-white hover:bg-blue-50 px-2 py-1 rounded min-w-[54px] text-left transition-colors"
                  title="Heading 2"
                >
                  <span className="text-xs font-bold text-[#2F5597]">AaBbCc</span>
                  <span className="text-[9px] text-[#2F5597]">Heading 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyStyle("title")}
                  className="flex flex-col items-center justify-center border border-[#D1D5DB] bg-white hover:bg-blue-50 px-2 py-1 rounded min-w-[54px] text-left transition-colors"
                  title="Document Title"
                >
                  <span className="text-sm font-bold text-[#1F3864]">AaB</span>
                  <span className="text-[9px] text-[#1F3864]">Title</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyStyle("subtitle")}
                  className="flex flex-col items-center justify-center border border-[#D1D5DB] bg-white hover:bg-blue-50 px-2 py-1 rounded min-w-[54px] text-left transition-colors"
                  title="Subtitle"
                >
                  <span className="text-xs italic text-slate-600">AaBbCc</span>
                  <span className="text-[9px] text-slate-500">Subtitle</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Styles</span>
            </div>

            {/* Editing Group */}
            <div className="flex flex-col justify-between items-center px-2">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setShowFindReplace(!showFindReplace)}
                  className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/80 rounded text-slate-700"
                >
                  <Search className="w-3.5 h-3.5 text-[#2B579A]" />
                  <span>Find</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFindReplace(true)}
                  className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/80 rounded text-slate-700"
                >
                  <Check className="w-3.5 h-3.5 text-[#2B579A]" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorRef.current) {
                      const range = document.createRange();
                      range.selectNodeContents(editorRef.current);
                      const sel = window.getSelection();
                      sel?.removeAllRanges();
                      sel?.addRange(range);
                    }
                  }}
                  className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/80 rounded text-slate-700"
                >
                  <span>Select All</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Editing</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: INSERT ----------------- */}
        {activeTab === "Insert" && (
          <div className="flex items-stretch gap-3">
            {/* Pages */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={insertPageBreak}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-16"
                  title="Insert Page Break"
                >
                  <Layers className="w-5 h-5 text-[#2B579A]" />
                  <span className="text-[10px] mt-0.5">Page Break</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Pages</span>
            </div>

            {/* Tables */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <button
                type="button"
                onClick={() => setShowTableModal(true)}
                className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-16"
                title="Insert Table"
              >
                <TableIcon className="w-5 h-5 text-[#2B579A]" />
                <span className="text-[10px] mt-0.5">Table</span>
              </button>
              <span className="text-[10px] text-slate-500 font-medium">Tables</span>
            </div>

            {/* Illustrations */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <label className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-16 cursor-pointer" title="Insert Picture">
                <ImageIcon className="w-5 h-5 text-[#2B579A]" />
                <span className="text-[10px] mt-0.5">Pictures</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Illustrations</span>
            </div>

            {/* Links & Elements */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(true)}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-14"
                  title="Insert Link"
                >
                  <LinkIcon className="w-5 h-5 text-[#2B579A]" />
                  <span className="text-[10px] mt-0.5">Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => format("insertHorizontalRule")}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-14"
                  title="Horizontal Divider"
                >
                  <Minus className="w-5 h-5 text-slate-600" />
                  <span className="text-[10px] mt-0.5">Line</span>
                </button>
                <button
                  type="button"
                  onClick={insertDateTime}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-14"
                  title="Date and Time"
                >
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] mt-0.5">Date</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Elements</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: LAYOUT ----------------- */}
        {activeTab === "Layout" && (
          <div className="flex items-stretch gap-3">
            {/* Page Setup */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">Margins:</label>
                  <select
                    value={pageMargins}
                    onChange={(e: any) => setPageMargins(e.target.value)}
                    className="bg-white border border-[#D1D5DB] rounded px-2 py-0.5 text-xs text-slate-800 outline-none"
                  >
                    <option value="normal">Normal (1 in / 2.54 cm)</option>
                    <option value="narrow">Narrow (0.5 in / 1.27 cm)</option>
                    <option value="moderate">Moderate (0.75 in)</option>
                    <option value="wide">Wide (1.5 in)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-slate-700">Orientation:</label>
                  <select
                    value={orientation}
                    onChange={(e: any) => setOrientation(e.target.value)}
                    className="bg-white border border-[#D1D5DB] rounded px-2 py-0.5 text-xs text-slate-800 outline-none"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Page Setup</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: REVIEW ----------------- */}
        {activeTab === "Review" && (
          <div className="flex items-stretch gap-3">
            {/* Proofing & Statistics */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowWordCountModal(true)}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-16"
                  title="Document Word Count & Statistics"
                >
                  <FileText className="w-5 h-5 text-[#2B579A]" />
                  <span className="text-[10px] mt-0.5">Word Count</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Proofing</span>
            </div>

            {/* Speech */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <button
                type="button"
                onClick={toggleReadAloud}
                className={`flex flex-col items-center justify-center p-2 rounded text-slate-700 w-16 transition-colors ${
                  isSpeaking ? "bg-amber-100 text-amber-900 border border-amber-300" : "hover:bg-white/80"
                }`}
                title="Read Document Aloud (Text to Speech)"
              >
                {isSpeaking ? <VolumeX className="w-5 h-5 text-amber-700" /> : <Volume2 className="w-5 h-5 text-[#2B579A]" />}
                <span className="text-[10px] mt-0.5">{isSpeaking ? "Stop" : "Read Aloud"}</span>
              </button>
              <span className="text-[10px] text-slate-500 font-medium">Speech</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: VIEW ----------------- */}
        {activeTab === "View" && (
          <div className="flex items-stretch gap-3">
            {/* Show / Hide */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <div className="flex flex-col gap-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRuler}
                    onChange={(e) => setShowRuler(e.target.checked)}
                    className="rounded text-[#2B579A]"
                  />
                  <span>Ruler</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOutline}
                    onChange={(e) => setShowOutline(e.target.checked)}
                    className="rounded text-[#2B579A]"
                  />
                  <span>Navigation Pane</span>
                </label>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Show</span>
            </div>

            {/* Zoom Presets */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <div className="flex items-center gap-1.5">
                {[75, 100, 125].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoom(z)}
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      zoom === z ? "bg-[#2B579A] text-white" : "bg-white hover:bg-slate-100 text-slate-700 border border-[#D1D5DB]"
                    }`}
                  >
                    {z}%
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Zoom</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: AI COPILOT ----------------- */}
        {activeTab === "AI" && (
          <div className="flex items-stretch gap-3">
            <div className="flex flex-col justify-between items-center pr-3 border-r border-[#D1D5DB]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAiAction("rewrite")}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-20 transition-colors"
                  title="Rewrite and polish tone"
                >
                  <Sparkles className="w-5 h-5 text-[#2B579A]" />
                  <span className="text-[10px] mt-0.5 font-semibold">AI Rewrite</span>
                </button>

                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAiAction("grammar")}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-20 transition-colors"
                  title="Proofread grammar & spelling"
                >
                  <Check className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] mt-0.5 font-semibold">Fix Grammar</span>
                </button>

                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAiAction("summarize")}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-20 transition-colors"
                  title="Insert Executive Summary"
                >
                  <FileText className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] mt-0.5 font-semibold">Summarize</span>
                </button>

                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => handleAiAction("expand")}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/80 rounded text-slate-700 w-20 transition-colors"
                  title="Elaborate details"
                >
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] mt-0.5 font-semibold">Expand</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Smart AI Tools</span>
            </div>

            {aiLoading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#2B579A] animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI Assistant is writing...</span>
              </div>
            )}
            {aiResultNotice && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                <Check className="w-4 h-4" />
                <span>{aiResultNotice}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Find and Replace Bar */}
      {showFindReplace && (
        <div className="bg-[#E9EEF4] border-b border-[#D1D5DB] px-6 py-2 flex items-center gap-3 text-xs shrink-0 print:hidden z-10">
          <span className="font-bold text-slate-700">Find:</span>
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Text to find..."
            className="px-2.5 py-1 rounded border border-[#D1D5DB] bg-white text-slate-800 outline-none w-48"
          />
          <span className="font-bold text-slate-700">Replace:</span>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replacement..."
            className="px-2.5 py-1 rounded border border-[#D1D5DB] bg-white text-slate-800 outline-none w-48"
          />
          <button
            type="button"
            onClick={handleFindReplace}
            className="bg-[#2B579A] text-white px-3 py-1 rounded font-semibold hover:bg-[#185ABD] transition-colors"
          >
            Replace All
          </button>
          <button
            type="button"
            onClick={() => setShowFindReplace(false)}
            className="p-1 text-slate-500 hover:text-slate-800 ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-1.5 text-xs text-blue-900 flex items-center justify-between shrink-0 print:hidden">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          4. HORIZONTAL MARGIN RULER
          ========================================================================= */}
      {showRuler && (
        <div className="bg-[#F3F2F1] border-b border-[#D1D5DB] h-5 flex items-center justify-center select-none text-[9px] text-slate-500 overflow-hidden shrink-0 print:hidden">
          <div
            className="flex items-center justify-between text-slate-400 font-mono tracking-widest px-4"
            style={{ width: orientation === "portrait" ? "816px" : "1056px" }}
          >
            <span>|····1····|····2····|····3····|····4····|····5····|····6····|····7····|</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. DOCUMENT CANVAS WORKSPACE (Gray Desktop Canvas + White Paper Sheet)
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Pane (Outline) */}
        {showOutline && (
          <aside className="w-64 bg-white border-r border-[#D1D5DB] p-4 space-y-4 overflow-y-auto shrink-0 print:hidden">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Navigation
              </h4>
              <button
                type="button"
                onClick={() => setShowOutline(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {outlineItems.length > 0 ? (
              <ul className="space-y-1 text-xs">
                {outlineItems.map((item) => (
                  <li
                    key={item.id}
                    style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    className="truncate text-slate-600 hover:text-[#2B579A] cursor-pointer py-0.5"
                    onClick={() => {
                      const target = document.getElementById(item.id);
                      if (target) target.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    • {item.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Document headings (H1, H2, H3) will appear here.
              </p>
            )}
          </aside>
        )}

        {/* Center Paper Canvas */}
        <div className="flex-1 overflow-auto p-6 sm:p-10 flex justify-center bg-[#EAEAEA]">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              width: orientation === "portrait" ? "816px" : "1056px",
              minHeight: orientation === "portrait" ? "1056px" : "816px",
            }}
            className={`word-canvas-sheet bg-white text-black ${getMarginClass()} transition-transform duration-100 ease-out border border-[#D1D5DB] print:p-0 print:border-none print:shadow-none print:w-full my-4`}
          >
            {/* The editable document */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              style={{
                fontFamily: `${fontFamily}, Calibri, Segoe UI, sans-serif`,
              }}
              className="outline-none min-h-[900px] text-black prose max-w-none focus:outline-none"
            />
          </div>
        </div>

        {/* Drag & Drop Upload Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-[#185ABD]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white p-6 border-4 border-dashed border-white">
            <Upload className="w-16 h-16 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Drop Word Document or PDF Here</h2>
            <p className="text-sm opacity-90">WorkOnline will immediately open and convert your document for live editing.</p>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. BOTTOM STATUS BAR (Classic Word Status: #2B579A)
          ========================================================================= */}
      <footer className="bg-[#2B579A] text-white flex items-center justify-between px-3 h-7 select-none text-[11px] shrink-0 print:hidden z-20">
        {/* Left Stats */}
        <div className="flex items-center gap-3">
          <span>Page 1 of {pageCount}</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowWordCountModal(true)}
            className="hover:underline font-medium"
          >
            {wordCount} words
          </button>
          <span>•</span>
          <span>{charCount} characters</span>
          <span>•</span>
          <span className="hidden sm:inline flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-300" /> English (United States)
          </span>
        </div>

        {/* Right: Zoom slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="px-1.5 hover:bg-white/20 rounded font-bold"
            title="Zoom Out"
          >
            -
          </button>

          <input
            type="range"
            min="50"
            max="150"
            step="5"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value, 10))}
            className="w-20 accent-white h-1 cursor-pointer"
            title={`Zoom: ${zoom}%`}
          />

          <button
            type="button"
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="px-1.5 hover:bg-white/20 rounded font-bold"
            title="Zoom In"
          >
            +
          </button>

          <span className="w-10 text-right font-medium">{zoom}%</span>
        </div>
      </footer>

      {/* =========================================================================
          7. BACKSTAGE OVERLAY (File Menu View)
          ========================================================================= */}
      {showBackstage && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col md:flex-row animate-fade-in text-slate-800">
          {/* Left Dark Blue Navigation Sidebar */}
          <div className="w-full md:w-64 bg-[#185ABD] text-white p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowBackstage(false)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-sm w-full transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Document</span>
              </button>

              <nav className="space-y-1 text-sm font-semibold pt-4">
                <button
                  type="button"
                  onClick={() => setBackstageSection("new")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    backstageSection === "new" ? "bg-white text-[#185ABD]" : "hover:bg-white/10 text-white"
                  }`}
                >
                  New Document
                </button>
                <button
                  type="button"
                  onClick={() => setBackstageSection("open")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    backstageSection === "open" ? "bg-white text-[#185ABD]" : "hover:bg-white/10 text-white"
                  }`}
                >
                  Open (.docx or .pdf)
                </button>
                <button
                  type="button"
                  onClick={() => setBackstageSection("export")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    backstageSection === "export" ? "bg-white text-[#185ABD]" : "hover:bg-white/10 text-white"
                  }`}
                >
                  Export & Download
                </button>
                <button
                  type="button"
                  onClick={() => setBackstageSection("print")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    backstageSection === "print" ? "bg-white text-[#185ABD]" : "hover:bg-white/10 text-white"
                  }`}
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setBackstageSection("info")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    backstageSection === "info" ? "bg-white text-[#185ABD]" : "hover:bg-white/10 text-white"
                  }`}
                >
                  Document Info
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-white/20 text-xs text-white/80">
              <p className="font-bold">WorkOnline Word Studio</p>
              <p>Created by Dinesh Reddy Chada</p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#F9FAFB]">
            {/* NEW SECTION */}
            {backstageSection === "new" && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">New Document</h2>
                  <p className="text-sm text-slate-600">Select a template or start with a blank canvas.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Blank */}
                  <div
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.innerHTML = "<p>Start typing your new document here...</p>";
                        setDocTitle("Document1");
                        handleInput();
                        setShowBackstage(false);
                      }
                    }}
                    className="p-5 border-2 border-dashed border-slate-300 hover:border-[#185ABD] bg-white rounded-xl cursor-pointer hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[160px] text-center"
                  >
                    <FileText className="w-10 h-10 text-slate-400 mb-2" />
                    <span className="font-bold text-sm text-slate-800">Blank Document</span>
                    <span className="text-xs text-slate-500 mt-1">Clean slate</span>
                  </div>

                  {/* Professional Proposal */}
                  <div
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.innerHTML = defaultTemplate;
                        setDocTitle("Executive Project Summary");
                        handleInput();
                        setShowBackstage(false);
                      }
                    }}
                    className="p-5 border border-slate-200 hover:border-[#185ABD] bg-white rounded-xl cursor-pointer hover:shadow-md transition-all flex flex-col min-h-[160px]"
                  >
                    <div className="h-2 w-12 bg-[#2B579A] rounded mb-3" />
                    <span className="font-bold text-sm text-slate-800">Executive Proposal</span>
                    <span className="text-xs text-slate-500 mt-1">Standard business proposal with table and scope.</span>
                  </div>

                  {/* Resume Template */}
                  <div
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.innerHTML = resumeTemplate;
                        setDocTitle("Dinesh Reddy Resume");
                        handleInput();
                        setShowBackstage(false);
                      }
                    }}
                    className="p-5 border border-slate-200 hover:border-[#185ABD] bg-white rounded-xl cursor-pointer hover:shadow-md transition-all flex flex-col min-h-[160px]"
                  >
                    <div className="h-2 w-12 bg-emerald-600 rounded mb-3" />
                    <span className="font-bold text-sm text-slate-800">Modern Curriculum Vitae</span>
                    <span className="text-xs text-slate-500 mt-1">Clean IT & Engineering resume template with two-column skills.</span>
                  </div>
                </div>
              </div>
            )}

            {/* OPEN SECTION */}
            {backstageSection === "open" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Open Document</h2>
                  <p className="text-sm text-slate-600">Open and edit Microsoft Word (.docx) or PDF files directly.</p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-10 border-2 border-dashed border-[#185ABD] bg-blue-50/50 hover:bg-blue-50 rounded-2xl cursor-pointer text-center space-y-3 transition-colors"
                >
                  <Upload className="w-12 h-12 text-[#185ABD] mx-auto" />
                  <h3 className="font-bold text-base text-slate-800">Browse your computer for DOCX or PDF</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Select any .docx or .pdf file. PDF documents are automatically converted into structured, fully editable Word text, tables, and headings.
                  </p>
                  <button
                    type="button"
                    className="bg-[#185ABD] text-white px-5 py-2 rounded-lg font-bold text-xs shadow-sm"
                  >
                    Select File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUniversalImport(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* EXPORT SECTION */}
            {backstageSection === "export" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Export & Download</h2>
                  <p className="text-sm text-slate-600">Save your document to standard file formats.</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    className="w-full p-4 bg-white border border-slate-200 hover:border-[#185ABD] rounded-xl flex items-center justify-between shadow-sm text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-8 h-8 text-[#185ABD]" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Microsoft Word Document (.docx)</h4>
                        <p className="text-xs text-slate-500">Full desktop Word compatibility with preserved tables & styles.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintOrPdf}
                    className="w-full p-4 bg-white border border-slate-200 hover:border-emerald-600 rounded-xl flex items-center justify-between shadow-sm text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Printer className="w-8 h-8 text-emerald-600" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Save as PDF (.pdf)</h4>
                        <p className="text-xs text-slate-500">High-resolution print-ready PDF export via browser engine.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportTxt}
                    className="w-full p-4 bg-white border border-slate-200 hover:border-slate-400 rounded-xl flex items-center justify-between shadow-sm text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-slate-600" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Plain Text (.txt)</h4>
                        <p className="text-xs text-slate-500">Unformatted text file for quick notes and transcripts.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            {/* PRINT SECTION */}
            {backstageSection === "print" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Print</h2>
                  <p className="text-sm text-slate-600">Send directly to your printer or save as digital PDF.</p>
                </div>

                <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4">
                  <p className="text-xs text-slate-600">
                    Document Title: <strong>{docTitle}</strong><br />
                    Pages: <strong>{pageCount}</strong><br />
                    Orientation: <strong>{orientation}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={handlePrintOrPdf}
                    className="bg-[#185ABD] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow hover:bg-[#103F7E] transition-colors"
                  >
                    Open Print Dialog (Ctrl+P)
                  </button>
                </div>
              </div>
            )}

            {/* INFO SECTION */}
            {backstageSection === "info" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Document Information</h2>
                  <p className="text-sm text-slate-600">File properties and statistics.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold">Title:</span>
                    <span>{docTitle}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold">Author:</span>
                    <span>Dinesh Reddy Chada</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold">Words:</span>
                    <span>{wordCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold">Characters:</span>
                    <span>{charCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold">Estimated Pages:</span>
                    <span>{pageCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-bold">Last Saved:</span>
                    <span>{lastSavedTime} (Local Browser Storage)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-bold">Privacy:</span>
                    <span className="text-emerald-700 font-semibold">100% Client-Side. No telemetry.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          8. TABLE INSERTION MODAL
          ========================================================================= */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl max-w-xs w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Insert Table</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 outline-none text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded text-xs font-semibold hover:bg-[#103F7E]"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. LINK INSERTION MODAL
          ========================================================================= */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Insert Hyperlink</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Display Text</label>
                <input
                  type="text"
                  placeholder="Optional display text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Web Address (URL)</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 outline-none text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded text-xs font-semibold hover:bg-[#103F7E]"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. WORD COUNT MODAL
          ========================================================================= */}
      {showWordCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl max-w-xs w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Word Count</h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Pages:</span>
                <strong className="text-slate-900">{pageCount}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Words:</span>
                <strong className="text-slate-900">{wordCount}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Characters (no spaces):</span>
                <strong className="text-slate-900">{Math.max(0, charCount - (wordCount - 1))}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Characters (with spaces):</span>
                <strong className="text-slate-900">{charCount}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Estimated reading time:</span>
                <strong className="text-slate-900">~{Math.max(1, Math.ceil(wordCount / 200))} min</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowWordCountModal(false)}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded text-xs font-semibold hover:bg-[#103F7E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
