"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
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
  BookOpen,
  Mail,
  Share2,
  MessageSquare,
  Edit3,
  Bookmark,
  Columns,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  LayoutTemplate,
  PenTool,
  Eraser,
  Trash2,
  Plus,
  ExternalLink,
  RotateCcw,
  User,
  UserCheck,
  AlertCircle,
  FilePlus,
  Mic,
  MicOff,
  Maximize2,
  Split,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  Lock,
  Unlock,
  CheckSquare,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  Sigma,
  Square,
  Circle,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Store,
  GitBranch,
  Keyboard
} from "lucide-react";
import { exportHtmlToDocxBlob } from "@/lib/docx/docx-export";
import { importDocxFile } from "@/lib/docx/docx-import";
import { convertPdfToWordHtml } from "@/lib/pdf/pdf-to-word";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { executeAiTask } from "@/lib/ai/ai-client";
import { useWordStore, RibbonTab, WordTheme, WordViewMode } from "./word-state";
import { AdvancedFindReplaceModal, FindOptions } from "./advanced-find-replace-modal";
import { BuildingBlocksModal } from "./building-blocks-modal";
import { AdvancedTypographyModal } from "./advanced-typography-modal";
import { RevealFormattingPane } from "./reveal-formatting-pane";
import { SmartArtBuilderModal } from "./smartart-builder-modal";
import { SelectionLayerPane } from "./selection-layer-pane";
import { TableToolsModal, TableFormattingOptions } from "./table-tools-modal";
import { OutlineView } from "./outline-view";
import { AddinsSidebar } from "./addins-sidebar";
import { CustomizeShortcutsModal } from "./customize-shortcuts-modal";
import { DocumentInspectorModal } from "./document-inspector-modal";
import { AutoCorrectOptionsModal } from "./autocorrect-options-modal";
import { CrashRecoveryPane } from "./crash-recovery-pane";
import { processTypingReplacement, applySmartQuotes, linkifyUrlsAndEmails } from "./autocorrect-engine";
import { processFieldCodesInHtml, evaluateFieldExpression } from "./field-codes-engine";

export function WordEditor() {
  const store = useWordStore();

  // Local Editor State
  const [outlineItems, setOutlineItems] = useState<{ id: string; text: string; level: number }[]>([]);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  // Modals & Power Tools
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showWordCountModal, setShowWordCountModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showFontDialog, setShowFontDialog] = useState(false);
  const [showParagraphDialog, setShowParagraphDialog] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationType, setCitationType] = useState<"APA" | "MLA" | "Chicago" | "IEEE">("APA");
  const [citationAuthor, setCitationAuthor] = useState("");
  const [citationTitle, setCitationTitle] = useState("");
  const [citationYear, setCitationYear] = useState("");
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "pie" | "line">("bar");
  const [showEquationModal, setShowEquationModal] = useState(false);
  const [equationLatex, setEquationLatex] = useState("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}");
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [macroNameInput, setMacroNameInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Advanced Power User Modals
  const [showAdvancedFindReplace, setShowAdvancedFindReplace] = useState(false);
  const [showBuildingBlocksModal, setShowBuildingBlocksModal] = useState(false);
  const [showAdvancedTypographyModal, setShowAdvancedTypographyModal] = useState(false);
  const [showSmartArtModal, setShowSmartArtModal] = useState(false);
  const [showTableToolsModal, setShowTableToolsModal] = useState(false);
  const [showOutlineViewModal, setShowOutlineViewModal] = useState(false);
  const [showAutoCorrectModal, setShowAutoCorrectModal] = useState(false);
  const [showDocumentInspectorModal, setShowDocumentInspectorModal] = useState(false);
  const [showCustomShortcutsModal, setShowCustomShortcutsModal] = useState(false);

  // Mini Floating Toolbar state
  const [showMiniToolbar, setShowMiniToolbar] = useState(false);
  const [miniToolbarPos, setMiniToolbarPos] = useState({ top: 0, left: 0 });

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number } | null>(null);

  // Speech Recognition (Dictate)
  const [isDictating, setIsDictating] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Read Aloud
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Hello! I am your Microsoft Word AI Copilot. Select any passage or ask me to write, summarize, refine tone, or convert your text into tables.",
    },
  ]);

  // Comments state
  const [newCommentInput, setNewCommentInput] = useState("");
  const [replyInputs, setReplyInputs] = useState<{ [id: string]: string }>({});

  // Status message banner
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Backup for Mail Merge
  const [backupBeforeMerge, setBackupBeforeMerge] = useState<string | null>(null);

  // DOM Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const splitEditorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // 1. BUILT-IN TEMPLATES
  // =========================================================================
  const TEMPLATES = [
    {
      id: "blank",
      category: "General",
      title: "Blank Document",
      desc: "Clean empty document canvas.",
      html: "<p>Start typing your document here...</p>",
    },
    {
      id: "modern-resume",
      category: "Professional",
      title: "Modern Executive Resume",
      desc: "ATS-compliant resume template with header, summary, and experience.",
      html: `
        <div style="text-align: center; margin-bottom: 16px;">
          <h1 style="color: #0F172A; font-size: 26pt; font-weight: 800; letter-spacing: 0.05em; margin: 0; text-transform: uppercase;">DINESH REDDY CHADA</h1>
          <p style="color: #0F6CBD; font-size: 11pt; font-weight: 700; margin-top: 4px; margin-bottom: 8px;">Lead Full-Stack Systems Architect & Data Engineer</p>
          <p style="color: #475569; font-size: 9.5pt; margin: 0;">Hyderabad, India • contact@dineshreddy.dev • +91 98765 43210 • linkedin.com/in/dineshreddy</p>
        </div>
        <hr style="border: none; border-top: 2px solid #0F172A; margin: 12px 0;" />
        <h2 style="color: #0F172A; font-size: 13pt; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #CBD5E1; padding-bottom: 3px; margin-top: 14px;">Professional Summary</h2>
        <p style="line-height: 1.4; margin-bottom: 12px;">Dynamic software engineer with comprehensive mastery of full-stack TypeScript, distributed cloud engines, and in-browser document processing. Architect of resilient web applications serving tens of thousands of active sessions.</p>
        <h2 style="color: #0F172A; font-size: 13pt; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #CBD5E1; padding-bottom: 3px; margin-top: 14px;">Core Competencies</h2>
        <ul style="padding-left: 20px; line-height: 1.45; margin-bottom: 12px;">
          <li><strong>Architecture & Systems:</strong> Next.js 14, React 18, TypeScript, Node.js, WebAssembly, Supabase, PostgreSQL</li>
          <li><strong>Document & Processing:</strong> DOCX Generation, PDF.js parsing, Canvas vector drawing, Mail Merge workflows</li>
          <li><strong>DevOps & Cloud:</strong> Docker, Git CI/CD, Edge Middleware, Fluid Compute, Vercel infrastructure</li>
        </ul>
        <h2 style="color: #0F172A; font-size: 13pt; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #CBD5E1; padding-bottom: 3px; margin-top: 14px;">Professional Experience</h2>
        <div style="display: flex; justify-content: space-between; font-weight: bold; color: #0F172A; margin-top: 8px;">
          <span>Lead Platform Architect — WorkOnline / DocuFlow</span>
          <span style="color: #64748B;">2023 — Present</span>
        </div>
        <ul style="padding-left: 20px; line-height: 1.4; margin-top: 4px; margin-bottom: 10px;">
          <li>Pioneered 100% in-browser document processing studio supporting seamless DOCX import, editing, and PDF printing.</li>
          <li>Integrated serverless Gemini AI assistance for contextual rewriting, automated summarization, and grammar verification.</li>
        </ul>
      `,
    },
    {
      id: "business-proposal",
      category: "Professional",
      title: "Executive Business Proposal",
      desc: "Commercial client proposal with deliverables, milestones, and budget.",
      html: `
        <div style="border-bottom: 3px solid #0F6CBD; padding-bottom: 12px; margin-bottom: 24px;">
          <h1 style="color: #0F172A; font-size: 24pt; font-weight: 800; margin: 0;">Enterprise Digital Platform Proposal</h1>
          <p style="color: #64748B; font-size: 11pt; margin-top: 6px;">Prepared for: <strong>Executive Review Committee</strong> | Prepared by: <strong>DocuFlow Solutions</strong></p>
        </div>
        <h2 style="color: #1E293B; font-size: 15pt; font-weight: 700; margin-top: 18px;">1. Executive Summary</h2>
        <p style="line-height: 1.5;">DocuFlow empowers organizations to replace legacy desktop word processor installations with secure, modern, browser-based collaborative suites.</p>
        <h2 style="color: #1E293B; font-size: 15pt; font-weight: 700; margin-top: 18px;">2. Deliverables & Schedule</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 14px 0;">
          <thead>
            <tr style="background-color: #F8FAFC;">
              <th style="border: 1px solid #CBD5E1; padding: 8px; text-align: left;">Phase</th>
              <th style="border: 1px solid #CBD5E1; padding: 8px; text-align: left;">Core Deliverable</th>
              <th style="border: 1px solid #CBD5E1; padding: 8px; text-align: left;">Target Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">Phase I</td>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">Document Core, DOCX/PDF Conversion, Design System</td>
              <td style="border: 1px solid #CBD5E1; padding: 8px; color: #166534; font-weight: bold;">Delivered</td>
            </tr>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">Phase II</td>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">Mail Merge, AI Copilot, Realtime Collaboration</td>
              <td style="border: 1px solid #CBD5E1; padding: 8px; color: #166534; font-weight: bold;">Active</td>
            </tr>
          </tbody>
        </table>
        <h2 style="color: #1E293B; font-size: 15pt; font-weight: 700; margin-top: 18px;">3. Projected Investment</h2>
        <p style="line-height: 1.5;">Fixed-bid delivery milestone: <strong>$28,500 USD</strong> including 12 months SLA support.</p>
      `,
    },
    {
      id: "academic-apa",
      category: "Academic",
      title: "Academic Paper (APA 7th)",
      desc: "Standard APA format research manuscript with Title, Abstract, and References.",
      html: `
        <div style="text-align: center; margin-top: 40px; margin-bottom: 40px;">
          <h1 style="color: #0F172A; font-size: 22pt; font-weight: bold; margin-bottom: 12px;">Comparative Analysis of In-Browser Document Pagination Engines</h1>
          <p style="color: #475569; font-size: 12pt;">Dinesh Reddy Chada</p>
          <p style="color: #64748B; font-size: 11pt;">Department of Computer Science & Engineering, CMR Technical Campus</p>
        </div>
        <div style="background-color: #F8FAFC; border-left: 4px solid #0F6CBD; padding: 14px 18px; margin: 24px 0; font-style: italic;">
          <strong>Abstract:</strong> This research paper investigates client-side document processing architectures, evaluating DOM reflow algorithms, OOXML interoperability, and cryptographic document protection.
        </div>
        <h2 style="color: #0F172A; font-size: 14pt; font-weight: bold; margin-top: 20px;">1. Introduction</h2>
        <p style="line-height: 1.6;">Web applications increasingly demand desktop-parity word processing capabilities without relying on heavy native installations or proprietary plugins.</p>
      `,
    },
  ];

  // =========================================================================
  // 2. LIFECYCLE, AUTO-RECOVER & KEYBOARD SHORTCUTS
  // =========================================================================
  useEffect(() => {
    const savedDraft = localStorage.getItem("docuflow_document_draft");
    const savedTitle = localStorage.getItem("docuflow_document_title");

    if (editorRef.current) {
      if (savedDraft) {
        editorRef.current.innerHTML = savedDraft;
      } else {
        editorRef.current.innerHTML = TEMPLATES[1].html;
      }
      updateMetrics();
    }
    if (savedTitle) store.setDocTitle(savedTitle);

    // AutoRecover Crash Protection Check
    const rawCrash = localStorage.getItem("docuflow_crash_recovery");
    if (rawCrash) {
      try {
        const parsed = JSON.parse(rawCrash);
        store.setAutoRecoverSnapshot(parsed);
        if (localStorage.getItem("docuflow_unclean_exit") === "true") {
          store.setHasRecoverySession(true);
          store.setActiveSidePane("recovery");
        }
      } catch {}
    }
    localStorage.setItem("docuflow_unclean_exit", "true");

    // Periodic 30s AutoRecover Snapshot Timer
    const recoveryTimer = setInterval(() => {
      if (editorRef.current) {
        const snap = {
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          title: store.docTitle,
          html: editorRef.current.innerHTML,
          wordCount: store.wordCount,
        };
        localStorage.setItem("docuflow_crash_recovery", JSON.stringify(snap));
        store.setAutoRecoverSnapshot(snap);
      }
    }, 30000);

    // Keyboard Shortcuts Listener
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Alt+F9: Toggle Field Codes
      if (e.altKey && e.key === "F9") {
        e.preventDefault();
        toggleFieldCodesMode();
        return;
      }

      // 2. Shift+F1: Reveal Formatting Pane
      if (e.shiftKey && e.key === "F1") {
        e.preventDefault();
        store.setActiveSidePane(store.activeSidePane === "reveal-formatting" ? "none" : "reveal-formatting");
        return;
      }

      // 3. Alt+F10: Selection & Layer Pane
      if (e.altKey && e.key === "F10") {
        e.preventDefault();
        store.setActiveSidePane(store.activeSidePane === "layers" ? "none" : "layers");
        return;
      }

      // 4. F3: Auto-expand Quick Part / Building Block
      if (e.key === "F3") {
        e.preventDefault();
        expandQuickPartSnippet();
        return;
      }

      // 5. F9: Update All Dynamic Fields
      if (e.key === "F9" && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        updateDynamicFields();
        return;
      }

      // 6. Ctrl+F11 / Ctrl+Shift+F11: Lock/Unlock Dynamic Fields
      if ((e.ctrlKey || e.metaKey) && e.key === "F11") {
        e.preventDefault();
        if (e.shiftKey) {
          store.setFieldsLocked(false);
          setStatusMessage("Dynamic field updates unlocked (Ctrl+Shift+F11).");
        } else {
          store.setFieldsLocked(true);
          setStatusMessage("Dynamic fields locked against recalculation (Ctrl+F11).");
        }
        return;
      }

      // 7. Ctrl+F3: The Spike (Multi-Cut Buffer append)
      if ((e.ctrlKey || e.metaKey) && e.key === "F3") {
        e.preventDefault();
        if (e.shiftKey) {
          // Ctrl+Shift+F3: Paste all items collected in Spike and clear
          pasteAndClearSpike();
        } else {
          // Ctrl+F3: Append selection to Spike
          cutSelectionToSpike();
        }
        return;
      }

      // 8. Standard Ctrl Key Bindings
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "s":
            e.preventDefault();
            handleManualSave();
            break;
          case "p":
            e.preventDefault();
            handlePrintOrPdf();
            break;
          case "f":
          case "h":
            e.preventDefault();
            setShowAdvancedFindReplace(true);
            break;
          case "d":
            e.preventDefault();
            setShowFontDialog(true);
            break;
          case "k":
            e.preventDefault();
            setShowLinkModal(true);
            break;
        }
      }
    };

    // Selection change for floating mini toolbar & formatting inspection
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setShowMiniToolbar(false);
      } else {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect && rect.top > 0) {
          setMiniToolbarPos({
            top: Math.max(10, rect.top - 46),
            left: Math.max(10, rect.left + rect.width / 2 - 140),
          });
          setShowMiniToolbar(true);
        }
      }
      updateMetrics();
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      clearInterval(recoveryTimer);
      window.removeEventListener("keydown", handleGlobalKeyDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.showFieldCodes, store.fieldsLocked]);

  // Sync split editor
  useEffect(() => {
    if (store.splitView && splitEditorRef.current && editorRef.current) {
      splitEditorRef.current.innerHTML = editorRef.current.innerHTML;
    }
  }, [store.splitView]);

  // Update counts, pages, and outline
  const updateMetrics = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    store.setWordCount(words);
    store.setCharCount(text.length);

    // Height-based page estimation (980px per A4 sheet)
    const contentHeight = editorRef.current.scrollHeight;
    const estimatedPages = Math.max(1, Math.ceil(contentHeight / 980));
    store.setPageCount(estimatedPages);

    // Selected text counts
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      const s = sel.toString().trim();
      store.setSelectedWordCount(s.split(/\s+/).length);
      store.setSelectedCharCount(s.length);
    } else {
      store.setSelectedWordCount(0);
      store.setSelectedCharCount(0);
    }

    // Outline items for Navigation Pane
    const headings = editorRef.current.querySelectorAll("h1, h2, h3, h4");
    const items: { id: string; text: string; level: number }[] = [];
    headings.forEach((h, idx) => {
      const id = `heading-doc-${idx}`;
      h.setAttribute("id", id);
      const level = parseInt(h.tagName.substring(1), 10);
      items.push({ id, text: h.textContent || `Section ${idx + 1}`, level });
    });
    setOutlineItems(items);

    // Check if cursor is inside a table, image, or shape to toggle Contextual Tabs
    if (sel && sel.anchorNode) {
      const parentEl = sel.anchorNode.parentElement;
      if (parentEl?.closest("table")) {
        store.setContextualTab("Table Layout");
      } else if (parentEl?.closest("img")) {
        store.setContextualTab("Picture Format");
      } else {
        if (store.contextualTab) store.setContextualTab(null);
      }
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 1. Enter key: check for --- or === to auto-convert to full-width horizontal rule
    if (e.key === "Enter" && store.autoFormatAsYouType.horizontalRules) {
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        const text = sel.anchorNode.textContent || "";
        const trimmed = text.trim();
        if (trimmed === "---" || trimmed === "===" || trimmed === "***") {
          e.preventDefault();
          const parent = sel.anchorNode.parentElement;
          if (parent) {
            parent.innerHTML = '<hr style="border: 0; border-top: 2px solid #94A3B8; margin: 16px 0;" /><p><br/></p>';
            handleInput();
            return;
          }
        }
      }
    }

    // 2. Space / Enter / Punctuation: AutoCorrect, Fractions, Ordinals & Math AutoCorrect
    if (e.key === " " || e.key === "Enter") {
      const sel = window.getSelection();
      if (sel && sel.anchorNode && sel.anchorNode.nodeType === Node.TEXT_NODE) {
        const text = sel.anchorNode.textContent || "";
        const offset = sel.anchorOffset;
        const beforeCursor = text.slice(0, offset);
        const lastWord = beforeCursor.trim().split(/\s+/).pop() || "";

        const result = processTypingReplacement(
          lastWord,
          store.autoCorrectRules,
          store.autoFormatAsYouType
        );

        if (result && result.matched) {
          const newText =
            beforeCursor.slice(0, beforeCursor.length - result.lengthToRemove) +
            result.replacement +
            text.slice(offset);
          sel.anchorNode.textContent = newText;
          const newOffset = offset - result.lengthToRemove + result.replacement.length;
          const range = document.createRange();
          range.setStart(sel.anchorNode, newOffset);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }
  };

  const handleInput = () => {
    if (store.isMarkedAsFinal) {
      alert("This document is marked as Final and is read-only.");
      return;
    }

    store.setSaveStatus("saving");
    updateMetrics();

    if (editorRef.current) {
      localStorage.setItem("docuflow_document_draft", editorRef.current.innerHTML);
      localStorage.setItem("docuflow_document_title", store.docTitle);
    }

    setTimeout(() => {
      store.setSaveStatus("saved");
      const now = new Date();
      store.setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 450);
  };

  // Manual Save with Version Snapshot
  const handleManualSave = () => {
    if (!editorRef.current) return;
    store.setSaveStatus("saving");
    const html = editorRef.current.innerHTML;
    localStorage.setItem("docuflow_document_draft", html);
    localStorage.setItem("docuflow_document_title", store.docTitle);

    store.addSnapshot({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      title: `${store.docTitle} (Saved)`,
      html,
      wordCount: store.wordCount,
    });

    setTimeout(() => {
      store.setSaveStatus("saved");
      store.setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setStatusMessage("Document snapshot saved to Version History.");
      setTimeout(() => setStatusMessage(null), 3000);
    }, 350);
  };

  // =========================================================================
  // POWER USER TOOLS & ADVANCED ENGINES
  // =========================================================================
  const cutSelectionToSpike = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setStatusMessage("Please select text to cut to the Spike buffer.");
      return;
    }
    const selectedText = sel.toString();
    store.cutToSpike(selectedText);
    format("delete");
    setStatusMessage(`Cut to Spike (Spike contains ${store.spikeBuffer.length + 1} item${store.spikeBuffer.length === 0 ? "" : "s"}).`);
  };

  const pasteAndClearSpike = () => {
    if (store.spikeBuffer.length === 0) {
      setStatusMessage("The Spike buffer is empty.");
      return;
    }
    const combined = store.spikeBuffer.map((item) => `<p>${item}</p>`).join("");
    format("insertHTML", combined);
    const count = store.spikeBuffer.length;
    store.clearSpike();
    setStatusMessage(`Pasted ${count} item${count === 1 ? "" : "s"} from Spike and cleared buffer.`);
  };

  const toggleFieldCodesMode = () => {
    if (!editorRef.current) return;
    const nextMode = !store.showFieldCodes;
    store.setShowFieldCodes(nextMode);
    const context = {
      pageNumber: store.currentPage,
      totalPageCount: store.pageCount,
      author: "Dinesh Reddy Chada",
      filename: `${store.docTitle}.docx`,
    };
    editorRef.current.innerHTML = processFieldCodesInHtml(editorRef.current.innerHTML, context, nextMode);
    handleInput();
    setStatusMessage(`Field Codes: ${nextMode ? "Showing Raw Codes { PAGE }" : "Showing Computed Values"}`);
  };

  const updateDynamicFields = () => {
    if (store.fieldsLocked) {
      setStatusMessage("Dynamic fields are locked against recalculation (Ctrl+Shift+F11 to unlock).");
      return;
    }
    if (!editorRef.current) return;
    const context = {
      pageNumber: store.currentPage,
      totalPageCount: store.pageCount,
      author: "Dinesh Reddy Chada",
      filename: `${store.docTitle}.docx`,
    };
    editorRef.current.innerHTML = processFieldCodesInHtml(editorRef.current.innerHTML, context, false);
    handleInput();
    setStatusMessage("Updated all dynamic fields (F9).");
  };

  const expandQuickPartSnippet = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;
    const nodeText = sel.anchorNode.textContent || "";
    const offset = sel.anchorOffset;
    const before = nodeText.slice(0, offset).trim().split(/\s+/).pop() || "";
    const matchedBlock = store.buildingBlocks.find(
      (b) =>
        b.name.toLowerCase() === before.toLowerCase() ||
        b.name.toLowerCase().startsWith(before.toLowerCase())
    );
    if (matchedBlock) {
      format("insertHTML", matchedBlock.content);
      setStatusMessage(`Expanded Quick Part: "${matchedBlock.name}" (F3).`);
    } else {
      setShowBuildingBlocksModal(true);
    }
  };

  const handleAdvancedFindNext = (query: string, options: FindOptions): boolean => {
    if (!editorRef.current || !query) return false;
    let pattern = query
      .replace(/\^p/g, "\n")
      .replace(/\^t/g, "\t")
      .replace(/\^l/g, "\n")
      .replace(/\^m/g, "\n")
      .replace(/\^#/g, "\\d")
      .replace(/\^\$/g, "[a-zA-Z]")
      .replace(/\^\?/g, ".");

    const flags = options.matchCase ? "g" : "gi";
    try {
      const regex = options.useWildcards
        ? new RegExp(pattern, flags)
        : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);

      const text = editorRef.current.innerText || "";
      const match = regex.exec(text);
      if (match) {
        setStatusMessage(`Found occurrence at character index ${match.index}.`);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const handleAdvancedReplaceCurrent = (findText: string, replaceText: string, options: FindOptions) => {
    if (!editorRef.current || !findText) return;
    let rep = replaceText
      .replace(/\^c/g, store.clipboardHistory[0] || "")
      .replace(/\^p/g, "<br/>")
      .replace(/\^t/g, "&emsp;");

    let repFormatStyle = "";
    if (options.replaceFormat) {
      if (options.replaceFormat.bold) repFormatStyle += "font-weight: bold;";
      if (options.replaceFormat.color) repFormatStyle += `color: ${options.replaceFormat.color};`;
    }
    if (repFormatStyle) {
      rep = `<span style="${repFormatStyle}">${rep}</span>`;
    }

    const html = editorRef.current.innerHTML;
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      options.matchCase ? "" : "i"
    );
    editorRef.current.innerHTML = html.replace(regex, rep);
    handleInput();
  };

  const handleAdvancedReplaceAll = (findText: string, replaceText: string, options: FindOptions): number => {
    if (!editorRef.current || !findText) return 0;
    let rep = replaceText
      .replace(/\^c/g, store.clipboardHistory[0] || "")
      .replace(/\^p/g, "<br/>")
      .replace(/\^t/g, "&emsp;");

    let repFormatStyle = "";
    if (options.replaceFormat) {
      if (options.replaceFormat.bold) repFormatStyle += "font-weight: bold;";
      if (options.replaceFormat.color) repFormatStyle += `color: ${options.replaceFormat.color};`;
    }
    if (repFormatStyle) {
      rep = `<span style="${repFormatStyle}">${rep}</span>`;
    }

    const html = editorRef.current.innerHTML;
    const regex = new RegExp(
      findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      options.matchCase ? "g" : "gi"
    );
    const count = (html.match(regex) || []).length;
    editorRef.current.innerHTML = html.replace(regex, rep);
    handleInput();
    return count;
  };

  const handleReadingHighlightAll = (findText: string, options: FindOptions) => {
    if (!editorRef.current || !findText) return;
    handleClearReadingHighlight();
    const html = editorRef.current.innerHTML;
    const regex = new RegExp(
      `(${findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      options.matchCase ? "g" : "gi"
    );
    editorRef.current.innerHTML = html.replace(
      regex,
      `<mark class="docuflow-reading-highlight" style="background-color: #FEF08A; color: #854D0E; padding: 0 2px; border-radius: 2px;">$1</mark>`
    );
  };

  const handleClearReadingHighlight = () => {
    if (!editorRef.current) return;
    const highlights = editorRef.current.querySelectorAll("mark.docuflow-reading-highlight");
    highlights.forEach((m) => {
      const text = document.createTextNode(m.textContent || "");
      m.parentNode?.replaceChild(text, m);
    });
    setStatusMessage("Cleared reading highlights.");
  };

  const handleApplyTypography = (styles: Record<string, string>) => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setStatusMessage("Please select text to apply advanced typography.");
      return;
    }
    const styleString = Object.entries(styles)
      .map(([k, v]) => `${k}: ${v};`)
      .join(" ");
    format("insertHTML", `<span style="${styleString}">${sel.toString()}</span>`);
    setStatusMessage("Applied advanced typography & OpenType settings.");
  };

  const handleApplyTableFormatting = (opts: TableFormattingOptions) => {
    const sel = window.getSelection();
    const table = sel?.anchorNode?.parentElement?.closest("table");
    if (!table) {
      setStatusMessage("Cursor must be inside a table to apply table properties.");
      return;
    }
    if (opts.cellPadding) {
      table.querySelectorAll("td, th").forEach((c) => {
        (c as HTMLElement).style.padding = opts.cellPadding!;
      });
    }
    if (opts.cellSpacing) {
      table.style.borderSpacing = opts.cellSpacing;
      table.style.borderCollapse = opts.cellSpacing === "0px" ? "collapse" : "separate";
    }
    if (opts.diagonalBorder && opts.diagonalBorder !== "none") {
      const cell = sel?.anchorNode?.parentElement?.closest("td, th");
      if (cell) {
        const deg = opts.diagonalBorder === "tl-br" ? "135deg" : "45deg";
        (cell as HTMLElement).style.background = `linear-gradient(${deg}, transparent calc(50% - 1px), #CBD5E1 calc(50% - 1px), #CBD5E1 calc(50% + 1px), transparent calc(50% + 1px))`;
      }
    }
    setStatusMessage("Applied table properties & pagination rules.");
  };

  const handleSanitizeDocument = (opts: {
    removeComments: boolean;
    removeAuthorMetadata: boolean;
    removeWatermark: boolean;
    removeHiddenText: boolean;
  }) => {
    if (opts.removeComments) store.setComments([]);
    if (opts.removeWatermark) store.setWatermarkText("");
    if (opts.removeHiddenText && editorRef.current) {
      const hidden = editorRef.current.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
      hidden.forEach((el) => el.remove());
    }
    handleInput();
    setStatusMessage("Document sanitized and scrubbed of private data.");
  };

  // =========================================================================
  // 3. EDITING & FORMATTING ENGINE
  // =========================================================================
  const format = (command: string, value: string | undefined = undefined) => {
    if (store.isMarkedAsFinal) return;
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    store.recordAction({ id: Date.now().toString(), name: command, command, value, timestamp: new Date().toISOString() });
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
        format(
          "insertHTML",
          `<h1 style="color: #0F172A; font-size: 26pt; font-weight: 800; border-bottom: 2px solid #0F6CBD; padding-bottom: 4px; margin-bottom: 12px;">${
            window.getSelection()?.toString() || "Document Title"
          }</h1>`
        );
        break;
      case "subtitle":
        format(
          "insertHTML",
          `<p style="color: #64748B; font-size: 13pt; font-style: italic; margin-bottom: 14px;">${
            window.getSelection()?.toString() || "Subtitle description"
          }</p>`
        );
        break;
      case "quote":
        format("formatBlock", "blockquote");
        break;
      case "intense-quote":
        format(
          "insertHTML",
          `<blockquote style="border-left: 4px solid #0F6CBD; background: #EFF6FF; color: #1E3A8A; padding: 12px 18px; margin: 14px 0; font-weight: 500;">${
            window.getSelection()?.toString() || "Important highlighted quote"
          }</blockquote>`
        );
        break;
    }
    handleInput();
  };

  const applyFontFamily = (family: string) => {
    store.setFontFamily(family);
    format("fontName", family);
  };

  const applyFontSize = (sizeStr: string) => {
    store.setFontSize(sizeStr);
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

  const changeCase = (type: "upper" | "lower" | "sentence" | "title") => {
    const selection = window.getSelection();
    if (!selection || !selection.toString()) return;
    const text = selection.toString();
    let converted = text;
    if (type === "upper") converted = text.toUpperCase();
    if (type === "lower") converted = text.toLowerCase();
    if (type === "sentence") {
      converted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    if (type === "title") {
      converted = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
    }
    format("insertText", converted);
  };

  // =========================================================================
  // 4. INSERT TAB OPERATIONS
  // =========================================================================
  const insertTable = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 14px 0;"><tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="border: 1px solid #7F7F7F; padding: 8px 12px; min-width: 70px;">${
          r === 0 ? `<strong>Column ${c + 1}</strong>` : `Data`
        }</td>`;
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
    const pageBreakHtml = `<div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #0F6CBD; margin: 36px 0; text-align: center;"><span style="background: #EFF6FF; color: #0F6CBD; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 4px; letter-spacing: 0.05em;">PAGE BREAK</span></div><p><br/></p>`;
    format("insertHTML", pageBreakHtml);
  };

  const insertDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    format("insertText", dateStr);
  };

  const insertSpecialSymbol = (sym: string) => {
    format("insertText", sym);
  };

  const insertChart = () => {
    let chartSvg = "";
    if (chartType === "bar") {
      chartSvg = `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
          <h4 style="margin: 0 0 12px 0; color: #1E293B;">Quarterly Performance (Bar Chart)</h4>
          <svg width="400" height="180" viewBox="0 0 400 180" style="margin: 0 auto; display: block;">
            <rect x="40" y="40" width="40" height="110" fill="#0F6CBD" rx="3" />
            <rect x="110" y="20" width="40" height="130" fill="#107C41" rx="3" />
            <rect x="180" y="60" width="40" height="90" fill="#D83B01" rx="3" />
            <rect x="250" y="10" width="40" height="140" fill="#744DA9" rx="3" />
            <line x1="20" y1="150" x2="360" y2="150" stroke="#94A3B8" stroke-width="2" />
            <text x="50" y="170" font-size="11" fill="#475569">Q1</text>
            <text x="120" y="170" font-size="11" fill="#475569">Q2</text>
            <text x="190" y="170" font-size="11" fill="#475569">Q3</text>
            <text x="260" y="170" font-size="11" fill="#475569">Q4</text>
          </svg>
        </div>
      `;
    } else if (chartType === "pie") {
      chartSvg = `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
          <h4 style="margin: 0 0 12px 0; color: #1E293B;">Resource Distribution (Pie Chart)</h4>
          <svg width="200" height="200" viewBox="0 0 32 32" style="margin: 0 auto; display: block; transform: rotate(-90deg); border-radius: 50%;">
            <circle r="16" cx="16" cy="16" fill="#0F6CBD" stroke="#107C41" stroke-width="32" stroke-dasharray="60 100" />
          </svg>
        </div>
      `;
    } else {
      chartSvg = `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
          <h4 style="margin: 0 0 12px 0; color: #1E293B;">Growth Trajectory (Line Chart)</h4>
          <svg width="400" height="150" viewBox="0 0 400 150" style="margin: 0 auto; display: block;">
            <polyline fill="none" stroke="#0F6CBD" stroke-width="3" points="30,120 110,80 190,95 270,30 350,15" />
            <line x1="20" y1="130" x2="380" y2="130" stroke="#CBD5E1" stroke-width="2" />
          </svg>
        </div>
      `;
    }
    format("insertHTML", chartSvg);
    setShowChartModal(false);
  };

  const insertEquation = () => {
    const eqHtml = `<div style="background: #F8FAFC; border-left: 3px solid #0F6CBD; padding: 10px 16px; margin: 14px 0; font-family: 'Cambria Math', serif; font-size: 13pt; color: #0F172A;"><em>${equationLatex}</em></div>`;
    format("insertHTML", eqHtml);
    setShowEquationModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const imgHtml = `<img src="${reader.result}" style="max-width: 100%; height: auto; margin: 14px 0; border: 1px solid #CBD5E1; border-radius: 4px;" alt="Inserted Illustration"/><p><br/></p>`;
        format("insertHTML", imgHtml);
      }
    };
    reader.readAsDataURL(file);
  };

  // =========================================================================
  // 5. REFERENCES TAB (Table of Contents & Citations)
  // =========================================================================
  const generateTableOfContents = () => {
    if (!editorRef.current) return;
    const headings = editorRef.current.querySelectorAll("h1, h2, h3");
    if (headings.length === 0) {
      alert("No headings found. Please apply Heading 1, 2, or 3 styles to generate a Table of Contents.");
      return;
    }

    let tocHtml = `<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #0F6CBD; padding: 18px 24px; margin: 20px 0; border-radius: 6px;">
      <h3 style="color: #0F172A; font-size: 14pt; font-weight: bold; margin: 0 0 12px 0;">Table of Contents</h3>
      <div style="font-size: 11pt; line-height: 1.8;">`;

    headings.forEach((h, index) => {
      const level = parseInt(h.tagName.substring(1), 10);
      const indent = (level - 1) * 20;
      const title = h.textContent || `Section ${index + 1}`;
      tocHtml += `<div style="padding-left: ${indent}px; display: flex; justify-content: space-between; border-bottom: 1px dotted #CBD5E1;">
        <span style="color: #1E293B; font-weight: ${level === 1 ? "bold" : "normal"};">${title}</span>
        <span style="color: #64748B;">p. ${Math.min(level, store.pageCount)}</span>
      </div>`;
    });

    tocHtml += `</div></div><p><br/></p>`;
    format("insertHTML", tocHtml);
    setStatusMessage("Table of Contents generated.");
  };

  const insertCitation = () => {
    if (!citationAuthor.trim() || !citationTitle.trim()) return;
    const year = citationYear.trim() || "n.d.";
    let citationString = `(${citationAuthor}, ${year})`;
    if (citationType === "IEEE") citationString = `[1] ${citationAuthor}, "${citationTitle}," ${year}.`;

    format("insertText", citationString);
    store.addCitation({
      id: Date.now().toString(),
      type: citationType,
      author: citationAuthor,
      title: citationTitle,
      year,
    });
    setShowCitationModal(false);
  };

  // =========================================================================
  // 6. MAILINGS TAB (Mail Merge Engine)
  // =========================================================================
  const insertMergeField = (fieldName: string) => {
    format("insertText", `{{${fieldName}}}`);
  };

  const toggleMergePreview = () => {
    if (!editorRef.current) return;
    if (!store.isMergePreviewActive) {
      setBackupBeforeMerge(editorRef.current.innerHTML);
      const contact = store.mergeContacts[store.activeMergeIndex];
      let previewHtml = editorRef.current.innerHTML
        .replace(/\{\{First_Name\}\}/g, contact.firstName)
        .replace(/\{\{Last_Name\}\}/g, contact.lastName)
        .replace(/\{\{Company\}\}/g, contact.company)
        .replace(/\{\{Role\}\}/g, contact.role)
        .replace(/\{\{Email\}\}/g, contact.email)
        .replace(/\{\{City\}\}/g, contact.city);

      editorRef.current.innerHTML = previewHtml;
      store.setIsMergePreviewActive(true);
      setStatusMessage(`Previewing recipient: ${contact.firstName} ${contact.lastName}`);
    } else {
      if (backupBeforeMerge && editorRef.current) {
        editorRef.current.innerHTML = backupBeforeMerge;
      }
      store.setIsMergePreviewActive(false);
      setStatusMessage("Exited Mail Merge preview.");
    }
  };

  const generateMergedBatch = () => {
    if (!editorRef.current) return;
    const templateHtml = backupBeforeMerge || editorRef.current.innerHTML;
    let fullMergedBatch = "";

    store.mergeContacts.forEach((contact, idx) => {
      let pageHtml = templateHtml
        .replace(/\{\{First_Name\}\}/g, contact.firstName)
        .replace(/\{\{Last_Name\}\}/g, contact.lastName)
        .replace(/\{\{Company\}\}/g, contact.company)
        .replace(/\{\{Role\}\}/g, contact.role)
        .replace(/\{\{Email\}\}/g, contact.email)
        .replace(/\{\{City\}\}/g, contact.city);

      if (idx > 0) {
        fullMergedBatch += `<div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #0F6CBD; margin: 36px 0; text-align: center;"><span style="background: #EFF6FF; color: #0F6CBD; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 4px;">MERGED DOCUMENT: ${contact.firstName.toUpperCase()} ${contact.lastName.toUpperCase()}</span></div>`;
      }
      fullMergedBatch += pageHtml;
    });

    editorRef.current.innerHTML = fullMergedBatch;
    store.setIsMergePreviewActive(false);
    handleInput();
    setStatusMessage(`Generated ${store.mergeContacts.length} personalized documents in Mail Merge batch.`);
  };

  // =========================================================================
  // 7. REVIEW TAB (Comments, Track Changes, Read Aloud)
  // =========================================================================
  const handleAddComment = () => {
    if (!newCommentInput.trim()) return;
    const sel = window.getSelection();
    const selText = sel?.toString().trim() || undefined;

    store.addComment("Dinesh Reddy Chada", newCommentInput.trim(), selText);
    setNewCommentInput("");
    store.setActiveSidePane("comments");
    setStatusMessage("Comment posted.");
  };

  const handleAddReply = (commentId: string) => {
    const text = replyInputs[commentId];
    if (!text || !text.trim()) return;
    store.addReply(commentId, "Dinesh Reddy Chada", text.trim());
    setReplyInputs({ ...replyInputs, [commentId]: "" });
  };

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
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Speech Recognition (Dictate)
  const toggleDictation = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech-to-text dictation is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isDictating) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsDictating(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e: any) => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      if (transcript) {
        format("insertText", ` ${transcript} `);
      }
    };

    recognition.onerror = () => setIsDictating(false);
    recognition.onend = () => setIsDictating(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsDictating(true);
    setStatusMessage("Listening... Speak clearly to dictate text.");
  };

  // =========================================================================
  // 8. DIGITAL INKING (Draw Tab)
  // =========================================================================
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (store.activeInkTool === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const drawInk = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (store.activeInkTool === "none") return;
    if (e.buttons !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (store.activeInkTool === "eraser") {
      ctx.clearRect(e.clientX - rect.left - 12, e.clientY - rect.top - 12, 24, 24);
    } else {
      ctx.lineWidth = store.inkSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = store.activeInkTool === "highlighter" ? `${store.inkColor}55` : store.inkColor;
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const clearInkCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // =========================================================================
  // 9. AI WRITING COPILOT
  // =========================================================================
  const handleAiAction = async (
    actionType: "rewrite" | "grammar" | "summarize" | "expand" | "custom",
    customPrompt?: string
  ) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    const textToProcess = selectedText || editorRef.current.innerText.slice(0, 4000);

    if (!textToProcess) {
      alert("Please enter or select document text for the AI Copilot.");
      return;
    }

    try {
      setAiLoading(true);
      let prompt = "";
      let taskType: "rewrite_text" | "check_grammar" | "summarize" = "rewrite_text";

      if (actionType === "rewrite") {
        taskType = "rewrite_text";
        prompt = `Rewrite the following text with polished, executive clarity and flawless phrasing:\n\n${textToProcess}`;
      } else if (actionType === "grammar") {
        taskType = "check_grammar";
        prompt = `Proofread the following text. Correct all spelling, grammar, and punctuation mistakes without commentary:\n\n${textToProcess}`;
      } else if (actionType === "summarize") {
        taskType = "summarize";
        prompt = `Generate a concise 3-bullet executive summary of the following document content:\n\n${textToProcess}`;
      } else if (actionType === "expand") {
        taskType = "rewrite_text";
        prompt = `Expand upon the following points with thorough professional depth and clarity:\n\n${textToProcess}`;
      } else if (actionType === "custom" && customPrompt) {
        taskType = "rewrite_text";
        prompt = `${customPrompt}\n\nDocument Context:\n${textToProcess}`;
      }

      const res = await executeAiTask({
        task: taskType,
        prompt: prompt,
      });

      if (!res.success || !res.result) {
        alert(res.error || "AI Copilot request failed. Please verify your connection.");
        return;
      }

      setAiChatHistory((prev) => [
        ...prev,
        { role: "user", text: customPrompt || `Executed ${actionType} action.` },
        { role: "assistant", text: res.result! },
      ]);

      if (actionType === "summarize") {
        const summaryHtml = `<div style="background-color: #EFF6FF; border-left: 4px solid #0F6CBD; padding: 12px 18px; margin: 16px 0; border-radius: 4px;"><h4 style="color: #1E3A8A; font-weight: bold; margin: 0 0 6px 0;">DocuFlow AI Executive Summary:</h4><p style="margin: 0; line-height: 1.45; color: #1E293B;">${res.result.replace(/\n/g, "<br/>")}</p></div>`;
        format("insertHTML", summaryHtml);
      } else if (selectedText) {
        format("insertText", res.result);
      }

      setStatusMessage("AI Copilot output generated.");
      store.setActiveSidePane("ai");
    } catch (err: any) {
      alert("AI Assistant error: " + (err.message || "Failed to process task."));
    } finally {
      setAiLoading(false);
    }
  };

  // =========================================================================
  // 10. UNIVERSAL IMPORT & EXPORT
  // =========================================================================
  const handleUniversalImport = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    setStatusMessage(`Importing ${file.name}...`);

    if (lowerName.endsWith(".docx")) {
      const res = await importDocxFile(file);
      if (!res.success) {
        alert(res.error || "Unable to import DOCX file.");
        setStatusMessage(null);
        return;
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = res.html;
        store.setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
        handleInput();
        setStatusMessage(`Opened ${file.name} successfully.`);
        store.setShowBackstage(false);
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
        store.setDocTitle(res.title || file.name.replace(/\.[^/.]+$/, ""));
        handleInput();
        setStatusMessage(`Converted ${file.name} to editable document (${res.pageCount} pages).`);
        store.setShowBackstage(false);
      }
    } else {
      alert("Please upload a standard Word document (.docx) or PDF document (.pdf).");
      setStatusMessage(null);
    }
  };

  const handleExportDocx = async () => {
    if (!editorRef.current) return;
    try {
      setIsExporting(true);
      const html = editorRef.current.innerHTML;
      const blob = await exportHtmlToDocxBlob(html, store.docTitle);
      triggerBlobDownload(blob, `${store.docTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "Document"}.docx`);
      setStatusMessage("Exported Microsoft Word (.docx) document.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("DOCX Export Error:", err);
      alert("Error generating DOCX document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintOrPdf = () => {
    window.print();
  };

  const handleExportTxt = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    triggerBlobDownload(blob, `${store.docTitle}.txt`);
  };

  const handleExportHtml = () => {
    if (!editorRef.current) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${store.docTitle}</title></head><body>${editorRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    triggerBlobDownload(blob, `${store.docTitle}.html`);
  };

  // Find & Replace
  const handleFind = () => {
    if (!editorRef.current || !findText.trim()) return;
    const text = editorRef.current.innerText || "";
    const matches = (text.match(new RegExp(findText, "gi")) || []).length;
    setMatchCount(matches);
    setStatusMessage(`Found ${matches} match(es) for "${findText}".`);
  };

  const handleReplaceAll = () => {
    if (!editorRef.current || !findText.trim()) return;
    const html = editorRef.current.innerHTML;
    const regex = new RegExp(findText, "gi");
    editorRef.current.innerHTML = html.replace(regex, replaceText);
    handleInput();
    setStatusMessage(`Replaced all occurrences of "${findText}".`);
    setMatchCount(0);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  };

  // Macro Recording Execution
  const toggleMacroRecording = () => {
    if (store.isRecordingMacro) {
      store.stopMacroRecording();
      setStatusMessage("Macro recording completed and saved.");
    } else {
      setShowMacroModal(true);
    }
  };

  const handleStartMacro = () => {
    if (!macroNameInput.trim()) return;
    store.startMacroRecording(macroNameInput.trim());
    setShowMacroModal(false);
    setMacroNameInput("");
    setStatusMessage("Macro recording started. All actions are now tracked.");
  };

  // Password Protection
  const handleSavePassword = () => {
    if (!passwordInput.trim()) {
      store.setIsPasswordProtected(false);
      store.setDocPasswordHash(null);
    } else {
      store.setIsPasswordProtected(true);
      store.setDocPasswordHash(btoa(passwordInput));
      setStatusMessage("Document encrypted with password protection.");
    }
    setShowPasswordModal(false);
    setPasswordInput("");
  };

  const getMarginClass = () => {
    switch (store.margins) {
      case "narrow":
        return "p-8";
      case "wide":
        return "p-20";
      case "moderate":
        return "p-12";
      case "mirrored":
        return "pl-20 pr-12 py-16";
      default:
        return "p-16";
    }
  };

  const getPaperDimensions = () => {
    if (store.orientation === "landscape") {
      return { width: "1056px", minHeight: "816px" };
    }
    switch (store.paperSize) {
      case "a3":
        return { width: "1152px", minHeight: "1632px" };
      case "a5":
        return { width: "576px", minHeight: "816px" };
      case "letter":
        return { width: "816px", minHeight: "1056px" };
      case "legal":
        return { width: "816px", minHeight: "1344px" };
      default:
        return { width: "816px", minHeight: "1056px" }; // A4
    }
  };

  // Theme Styling
  const getHeaderBg = () => {
    switch (store.theme) {
      case "obsidian":
        return "bg-[#100C0E]/95 border-b border-white/[0.08]";
      case "dark-gray":
        return "bg-[#2D2D2D] border-b border-neutral-700";
      case "white":
        return "bg-[#FFFFFF] border-b border-slate-300 text-slate-800";
      default:
        return "bg-[#185ABD] text-white"; // Fluent Classic Word Blue
    }
  };

  const getWorkspaceBg = () => {
    switch (store.theme) {
      case "obsidian":
        return "bg-[#070405]";
      case "dark-gray":
        return "bg-[#1E1E1E]";
      case "white":
        return "bg-[#EAEAEA]";
      default:
        return "bg-[#F3F2F1]"; // Authentic Desktop Word Workspace Gray
    }
  };

  const getRibbonBg = () => {
    switch (store.theme) {
      case "obsidian":
        return "bg-[#140E11]/90 border-b border-white/[0.08] text-white";
      case "dark-gray":
        return "bg-[#252525] border-b border-neutral-700 text-white";
      case "white":
        return "bg-[#F5F5F5] border-b border-slate-300 text-slate-800";
      default:
        return "bg-[#F3F2F1] border-b border-[#D1D5DB] text-slate-800";
    }
  };

  return (
    <div
      className={`w-full h-screen flex flex-col ${getWorkspaceBg()} overflow-hidden font-sans select-none relative`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleUniversalImport(e.dataTransfer.files[0]);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
      }}
      onClick={() => {
        if (contextMenu?.visible) setContextMenu(null);
      }}
    >
      {/* Read-Only Marked As Final Banner */}
      {store.isMarkedAsFinal && (
        <div className="bg-amber-500 text-slate-900 px-4 py-1 text-xs font-bold flex items-center justify-between shrink-0 z-40">
          <span>MARKED AS FINAL: An author has marked this document as final to discourage editing.</span>
          <button
            type="button"
            onClick={() => store.setIsMarkedAsFinal(false)}
            className="underline font-semibold"
          >
            Edit Anyway
          </button>
        </div>
      )}

      {/* =========================================================================
          1. WINDOW CHROME & QUICK ACCESS TOOLBAR (QAT)
          ========================================================================= */}
      <header className={`${getHeaderBg()} flex items-center justify-between px-3 h-10 select-none text-xs shrink-0 z-30 print:hidden shadow-sm`}>
        {/* Left: Quick Access Toolbar */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/workspace"
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors group"
            title="Return to Workspace"
          >
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-[#185ABD] to-[#0078D4] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
              W
            </div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              Word
            </span>
          </Link>

          <span className="w-px h-4 bg-current opacity-20 mx-1" />

          {/* AutoSave Switch */}
          <div className="flex items-center gap-1.5 text-[11px] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full cursor-pointer" title="AutoSave">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline font-medium">AutoSave</span>
          </div>

          {/* Save Floppy Icon */}
          <button
            type="button"
            onClick={handleManualSave}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            title="Save Document (Ctrl+S)"
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => format("undo")}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => format("redo")}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePrintOrPdf}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
            title="Quick Print Preview (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Editable Document Name */}
        <div className="flex items-center gap-2 max-w-sm sm:max-w-md truncate">
          <input
            type="text"
            value={store.docTitle}
            onChange={(e) => {
              store.setDocTitle(e.target.value);
              store.setSaveStatus("saving");
              localStorage.setItem("docuflow_document_title", e.target.value);
              setTimeout(() => store.setSaveStatus("saved"), 450);
            }}
            title="Click to rename document"
            className="bg-transparent hover:bg-black/10 dark:hover:bg-white/10 focus:bg-black/15 text-center font-bold px-2 py-0.5 rounded outline-none text-xs sm:text-sm border border-transparent focus:border-white/40 truncate"
          />
          <span className="text-[11px] opacity-75 hidden lg:inline">
            — {store.saveStatus === "saving" ? "Saving..." : `Saved to Cloud (${store.lastSavedTime})`}
          </span>
        </div>

        {/* Right: Global Command Search, User Avatar, and Ribbon Display Options */}
        <div className="flex items-center gap-1.5">
          {/* Tell Me Search */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/10 dark:bg-white/10 px-2.5 py-1 rounded text-xs">
            <Search className="w-3.5 h-3.5 opacity-60" />
            <input
              type="text"
              placeholder="Tell me what you want to do..."
              value={findText}
              onChange={(e) => {
                setFindText(e.target.value);
                setShowFindReplace(true);
              }}
              className="bg-transparent placeholder-current opacity-80 outline-none text-xs w-44"
            />
          </div>

          {/* AI Copilot Toggle */}
          <button
            type="button"
            onClick={() => store.setActiveSidePane(store.activeSidePane === "ai" ? "none" : "ai")}
            className="flex items-center gap-1 bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded text-xs shadow-sm hover:bg-amber-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => {
              store.setShowBackstage(true);
              store.setBackstageSection("share");
            }}
            className="hidden sm:inline-flex items-center gap-1 bg-white text-[#185ABD] font-bold px-2.5 py-1 rounded text-xs shadow-sm hover:bg-white/90"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Dinesh Reddy Chada User Profile Avatar */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer"
            title="Dinesh Reddy Chada (Author)"
          >
            <div className="w-6 h-6 rounded-full bg-[#004E8C] text-white flex items-center justify-center font-bold text-[10px] border border-white/40">
              CD
            </div>
            <span className="text-[11px] font-medium hidden xl:inline">Dinesh Reddy</span>
          </div>

          {/* Ribbon Display Options */}
          <button
            type="button"
            onClick={() =>
              store.setRibbonDisplayMode(
                store.ribbonDisplayMode === "tabs-and-commands"
                  ? "tabs-only"
                  : store.ribbonDisplayMode === "tabs-only"
                  ? "auto-hide"
                  : "tabs-and-commands"
              )
            }
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
            title={`Ribbon Display Mode: ${store.ribbonDisplayMode}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. RIBBON TABS BAR (All 10 Core + Contextual Tabs)
          ========================================================================= */}
      {store.ribbonDisplayMode !== "auto-hide" && (
        <nav className={`${getHeaderBg()} px-2 flex items-center gap-0.5 select-none text-xs border-b border-black/10 dark:border-white/10 shrink-0 print:hidden z-20 overflow-x-auto`}>
          {/* File Backstage Tab */}
          <button
            type="button"
            onClick={() => {
              store.setShowBackstage(true);
              store.setBackstageSection("new");
            }}
            className="bg-[#103F7E] hover:bg-[#0A2E60] text-white font-bold px-4 py-1.5 transition-colors uppercase tracking-wider text-[11px]"
          >
            File
          </button>

          {/* Standard Tabs */}
          {(
            [
              "Home",
              "Insert",
              "Draw",
              "Design",
              "Layout",
              "References",
              "Mailings",
              "Review",
              "View",
              "Developer",
              "Help",
            ] as RibbonTab[]
          ).map((tab) => {
            const isActive = store.activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  store.setActiveTab(tab);
                  if (store.ribbonDisplayMode === "tabs-only") store.setRibbonDisplayMode("tabs-and-commands");
                }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-t transition-colors ${
                  isActive
                    ? "bg-[#F3F2F1] dark:bg-[#1E1E1E] text-[#185ABD] dark:text-blue-400 shadow-sm"
                    : "text-white/90 hover:bg-black/10 dark:hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            );
          })}

          {/* Contextual Tabs (Table, Picture, Shape) */}
          {store.contextualTab && (
            <button
              type="button"
              onClick={() => store.setActiveTab(store.contextualTab!)}
              className={`px-3 py-1.5 text-xs font-bold rounded-t bg-amber-500 text-slate-950 transition-colors shadow-sm ml-2`}
            >
              ★ {store.contextualTab}
            </button>
          )}
        </nav>
      )}

      {/* =========================================================================
          3. RIBBON TOOLBAR BODY (All Categorized Groups)
          ========================================================================= */}
      {store.ribbonDisplayMode === "tabs-and-commands" && (
        <div className={`${getRibbonBg()} px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto min-h-[96px] select-none text-xs shrink-0 print:hidden shadow-inner z-10`}>
          {/* ----------------- TAB: HOME ----------------- */}
          {store.activeTab === "Home" && (
            <div className="flex items-stretch gap-2">
              {/* Clipboard Group */}
              <div className="flex flex-col justify-between items-center pr-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.readText().then((txt) => {
                        if (txt) format("insertText", txt);
                      }).catch(() => alert("Use Ctrl+V to paste directly into the document."));
                    }}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-11"
                    title="Paste (Ctrl+V)"
                  >
                    <ClipboardPaste className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Paste</span>
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => format("cut")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Cut (Ctrl+X)"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>Cut</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => format("copy")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Copy (Ctrl+C)"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => format("formatBlock", "p")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Format Painter"
                    >
                      <Paintbrush className="w-3 h-3 text-amber-500" />
                      <span>Painter</span>
                    </button>
                    {store.spikeBuffer.length > 0 && (
                      <button
                        type="button"
                        onClick={pasteAndClearSpike}
                        className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-bold rounded flex items-center gap-1 text-[10px] shadow-sm animate-pulse"
                        title="Paste Spike Buffer (Ctrl+Shift+F3)"
                      >
                        <span>Spike ({store.spikeBuffer.length})</span>
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Clipboard</span>
              </div>

              {/* Font Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedTypographyModal(true)}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded font-semibold text-[#185ABD] dark:text-blue-400 text-[10px] flex items-center gap-0.5 border border-current/20"
                      title="Advanced OpenType & Typography Controls"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Typography</span>
                    </button>
                    <select
                      value={store.fontFamily}
                      onChange={(e) => applyFontFamily(e.target.value)}
                      className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-0.5 text-xs outline-none w-28"
                    >
                      <option value="Calibri">Calibri</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Tahoma">Tahoma</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Trebuchet MS">Trebuchet MS</option>
                    </select>

                    <select
                      value={store.fontSize}
                      onChange={(e) => applyFontSize(e.target.value)}
                      className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-0.5 text-xs outline-none w-14"
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
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded font-bold text-xs"
                      title="Increase Font Size (Ctrl+Shift+>)"
                    >
                      A^
                    </button>
                    <button
                      type="button"
                      onClick={() => format("fontSize", "2")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded font-bold text-xs"
                      title="Decrease Font Size (Ctrl+Shift+<)"
                    >
                      Av
                    </button>

                    <button
                      type="button"
                      onClick={() => changeCase("upper")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded font-semibold text-[11px]"
                      title="UPPERCASE"
                    >
                      AA
                    </button>
                    <button
                      type="button"
                      onClick={() => format("removeFormat")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded text-rose-500 font-semibold text-[11px]"
                      title="Clear All Formatting (Ctrl+Space)"
                    >
                      A\
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => format("bold")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded font-bold"
                      title="Bold (Ctrl+B)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("italic")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded italic"
                      title="Italic (Ctrl+I)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("underline")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded underline"
                      title="Underline (Ctrl+U)"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("strikeThrough")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("subscript")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Subscript"
                    >
                      <Subscript className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("superscript")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Superscript"
                    >
                      <Superscript className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-px h-4 bg-current opacity-20 mx-0.5" />

                    {/* Highlight Color */}
                    <label className="flex items-center gap-0.5 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer" title="Text Highlight Color">
                      <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                      <input
                        type="color"
                        defaultValue="#FFFF00"
                        onChange={(e) => format("hiliteColor", e.target.value)}
                        className="w-3.5 h-3.5 p-0 border-0 bg-transparent cursor-pointer"
                      />
                    </label>

                    {/* Font Color */}
                    <label className="flex items-center gap-0.5 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer" title="Font Color">
                      <Palette className="w-3.5 h-3.5 text-red-500" />
                      <input
                        type="color"
                        defaultValue="#000000"
                        onChange={(e) => format("foreColor", e.target.value)}
                        className="w-3.5 h-3.5 p-0 border-0 bg-transparent cursor-pointer"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowFontDialog(true)}
                      className="px-1 text-[10px] opacity-70 hover:opacity-100"
                      title="Font Dialog (Ctrl+D)"
                    >
                      ↘
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Font</span>
              </div>

              {/* Paragraph Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => format("insertUnorderedList")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Bullets"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("insertOrderedList")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Numbering"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("outdent")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Decrease Indent"
                    >
                      <Outdent className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("indent")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Increase Indent"
                    >
                      <Indent className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => format("justifyLeft")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Align Left (Ctrl+L)"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("justifyCenter")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Align Center (Ctrl+E)"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("justifyRight")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Align Right (Ctrl+R)"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => format("justifyFull")}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                      title="Justify (Ctrl+J)"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowParagraphDialog(true)}
                      className="px-1 text-[10px] opacity-70 hover:opacity-100"
                      title="Paragraph Dialog"
                    >
                      ↘
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Paragraph</span>
              </div>

              {/* Styles Gallery */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1 overflow-x-auto max-w-xs xl:max-w-md pb-0.5">
                  {[
                    { id: "normal", label: "Normal", title: "AaBbCc" },
                    { id: "no-spacing", label: "No Spacing", title: "AaBbCc" },
                    { id: "h1", label: "Heading 1", title: "AaBbC" },
                    { id: "h2", label: "Heading 2", title: "AaBbCc" },
                    { id: "title", label: "Title", title: "AaB" },
                    { id: "quote", label: "Quote", title: "AaBb" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => applyStyle(st.id)}
                      className="flex flex-col items-center justify-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-neutral-700 px-2 py-1 rounded min-w-[52px] text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{st.title}</span>
                      <span className="text-[9px] opacity-60 truncate">{st.label}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[9px] opacity-60 font-medium">Styles Gallery</span>
              </div>

              {/* Editing & Voice */}
              <div className="flex flex-col justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFindReplace(true)}
                      className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded font-medium"
                      title="Advanced Find (Ctrl+F)"
                    >
                      <Search className="w-3 h-3 text-[#185ABD]" />
                      <span>Find</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFindReplace(true)}
                      className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded font-medium"
                      title="Advanced Replace & Wildcards (Ctrl+H)"
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>Replace</span>
                    </button>
                  </div>

                  {/* Dictate Voice STT */}
                  <button
                    type="button"
                    onClick={toggleDictation}
                    className={`flex flex-col items-center justify-center p-1.5 rounded transition-colors w-12 ${
                      isDictating ? "bg-rose-500 text-white animate-pulse" : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                    title="Dictate (Speech to Text)"
                  >
                    {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-rose-500" />}
                    <span className="text-[9px] mt-0.5">{isDictating ? "Listening" : "Dictate"}</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Editing & Voice</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: INSERT ----------------- */}
          {store.activeTab === "Insert" && (
            <div className="flex items-stretch gap-3">
              {/* Pages & Building Blocks */}
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={insertPageBreak}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                    title="Insert Page Break (Ctrl+Enter)"
                  >
                    <Layers className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Page Break</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBuildingBlocksModal(true)}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                    title="Building Blocks & Quick Parts (F3)"
                  >
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5">Quick Parts</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Pages & Blocks</span>
              </div>

              {/* Tables & Advanced Formulas */}
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowTableModal(true)}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Insert Table Grid"
                  >
                    <TableIcon className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTableToolsModal(true)}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Table Formulas & Nested Tables"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] mt-0.5">Formula</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Tables</span>
              </div>

              {/* Illustrations, Charts & SmartArt */}
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <label className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14 cursor-pointer" title="Pictures">
                    <ImageIcon className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Pictures</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowChartModal(true)}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Insert Recharts Chart"
                  >
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <span className="text-[10px] mt-0.5">Chart</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSmartArtModal(true)}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                    title="SmartArt Graphic Builder"
                  >
                    <GitBranch className="w-5 h-5 text-purple-600" />
                    <span className="text-[10px] mt-0.5">SmartArt</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Illustrations</span>
              </div>

              {/* Add-ins Suite */}
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => store.setActiveSidePane(store.activeSidePane === "addins" ? "none" : "addins")}
                  className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                  title="Office Add-ins (QR Code, Mermaid, Wikipedia, Signature)"
                >
                  <Store className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] mt-0.5 font-semibold">Add-ins</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Add-ins</span>
              </div>

              {/* Links & Comments */}
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(true)}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12"
                    title="Insert Link (Ctrl+K)"
                  >
                    <LinkIcon className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => store.setActiveSidePane("comments")}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="New Comment (Ctrl+Alt+M)"
                  >
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] mt-0.5">Comment</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Links & Comments</span>
              </div>

              {/* Symbols & Equations */}
              <div className="flex flex-col justify-between items-center">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowEquationModal(true)}
                    className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                    title="KaTeX Equation Editor"
                  >
                    <Sigma className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5">Equation</span>
                  </button>
                  <div className="grid grid-cols-4 gap-1">
                    {["©", "®", "™", "€", "£", "¥", "•", "—"].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertSpecialSymbol(sym)}
                        className="w-5 h-5 hover:bg-black/5 dark:hover:bg-white/10 rounded text-xs font-mono"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Symbols</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: LAYOUT ----------------- */}
          {store.activeTab === "Layout" && (
            <div className="flex items-stretch gap-3">
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold opacity-70">Margins:</label>
                    <select
                      value={store.margins}
                      onChange={(e: any) => store.setMargins(e.target.value)}
                      className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-0.5 text-xs outline-none"
                    >
                      <option value="normal">Normal (1 in / 2.54 cm)</option>
                      <option value="narrow">Narrow (0.5 in / 1.27 cm)</option>
                      <option value="moderate">Moderate (0.75 in)</option>
                      <option value="wide">Wide (1.5 in)</option>
                      <option value="mirrored">Mirrored (Book binding)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold opacity-70">Orientation:</label>
                    <select
                      value={store.orientation}
                      onChange={(e: any) => store.setOrientation(e.target.value)}
                      className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-0.5 text-xs outline-none"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold opacity-70">Size:</label>
                    <select
                      value={store.paperSize}
                      onChange={(e: any) => store.setPaperSize(e.target.value)}
                      className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-0.5 text-xs outline-none"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                      <option value="legal">Legal</option>
                      <option value="tabloid">Tabloid</option>
                      <option value="a3">A3</option>
                      <option value="a5">A5</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Page Setup</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: REFERENCES ----------------- */}
          {store.activeTab === "References" && (
            <div className="flex items-stretch gap-3">
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <button
                  type="button"
                  onClick={generateTableOfContents}
                  className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-24"
                  title="Generate Table of Contents from Headings"
                >
                  <BookOpen className="w-5 h-5 text-[#185ABD]" />
                  <span className="text-[10px] mt-0.5 font-semibold">Table of Contents</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Table of Contents</span>
              </div>

              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => setShowCitationModal(true)}
                  className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-20"
                  title="Insert Academic Citation"
                >
                  <Bookmark className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] mt-0.5 font-semibold">Add Citation</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Citations</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: MAILINGS ----------------- */}
          {store.activeTab === "Mailings" && (
            <div className="flex items-stretch gap-3">
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  {["First_Name", "Last_Name", "Company", "Role", "Email", "City"].map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => insertMergeField(field)}
                      className="px-2 py-1 bg-black/5 dark:bg-white/10 hover:bg-[#185ABD] hover:text-white rounded text-[11px] font-mono transition-colors"
                      title={`Insert {{${field}}}`}
                    >
                      +{field}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] opacity-60 font-medium">Merge Fields</span>
              </div>

              <div className="flex flex-col justify-between items-center">
                <div className="flex items-center gap-2">
                  <select
                    value={store.activeMergeIndex}
                    onChange={(e) => store.setActiveMergeIndex(parseInt(e.target.value, 10))}
                    className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-xs outline-none"
                  >
                    {store.mergeContacts.map((c, idx) => (
                      <option key={c.id} value={idx}>
                        Recipient #{idx + 1}: {c.firstName} {c.lastName} ({c.company})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={toggleMergePreview}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      store.isMergePreviewActive ? "bg-amber-500 text-slate-900" : "bg-black/5 dark:bg-white/10"
                    }`}
                  >
                    {store.isMergePreviewActive ? "Exit Preview" : "Preview Results"}
                  </button>

                  <button
                    type="button"
                    onClick={generateMergedBatch}
                    className="px-3 py-1 bg-[#185ABD] text-white font-semibold rounded text-xs shadow-sm hover:bg-[#004E8C]"
                  >
                    Finish & Merge All ({store.mergeContacts.length})
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Mail Merge Engine</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: REVIEW ----------------- */}
          {store.activeTab === "Review" && (
            <div className="flex items-stretch gap-3">
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => setShowWordCountModal(true)}
                  className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                  title="Document Word Count Statistics"
                >
                  <FileText className="w-5 h-5 text-[#185ABD]" />
                  <span className="text-[10px] mt-0.5 font-medium">Word Count</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Proofing</span>
              </div>

              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => setShowAutoCorrectModal(true)}
                  className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                  title="AutoCorrect, AutoFormat As You Type & Math AutoCorrect"
                >
                  <Settings className="w-5 h-5 text-[#185ABD]" />
                  <span className="text-[10px] mt-0.5 font-medium">AutoCorrect</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Options</span>
              </div>

              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => setShowDocumentInspectorModal(true)}
                  className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                  title="Inspect Document & Scrub Private Metadata"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] mt-0.5 font-medium">Inspect</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Privacy</span>
              </div>

              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <button
                  type="button"
                  onClick={toggleReadAloud}
                  className={`flex flex-col items-center justify-center p-2 rounded w-16 transition-colors ${
                    isSpeaking ? "bg-amber-500/20 text-amber-600 border border-amber-500" : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                  title="Read Document Aloud (Text to Speech)"
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5 text-amber-600" /> : <Volume2 className="w-5 h-5 text-[#185ABD]" />}
                  <span className="text-[10px] mt-0.5">{isSpeaking ? "Stop" : "Read Aloud"}</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Speech</span>
              </div>

              {/* Track Changes Toggle */}
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => {
                    store.setTrackChanges(!store.trackChanges);
                    setStatusMessage(`Track Changes: ${!store.trackChanges ? "Enabled" : "Disabled"}`);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded w-16 transition-colors ${
                    store.trackChanges ? "bg-rose-500 text-white font-bold" : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                  title="Track Changes (Redline)"
                >
                  <CheckSquare className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Tracking</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Tracking</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: VIEW ----------------- */}
          {store.activeTab === "View" && (
            <div className="flex items-stretch gap-3">
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  {(["print", "read", "web", "focus"] as WordViewMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => store.setViewMode(m)}
                      className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                        store.viewMode === m ? "bg-[#185ABD] text-white" : "bg-black/5 dark:bg-white/10"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowOutlineViewModal(true)}
                    className="px-2 py-1 rounded text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-[#185ABD] hover:text-white transition-colors"
                    title="Outline View & Master Documents"
                  >
                    Outline
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Views</span>
              </div>

              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.showRuler}
                      onChange={(e) => store.setShowRuler(e.target.checked)}
                      className="rounded"
                    />
                    <span>Ruler</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.showNavigationPane}
                      onChange={(e) => store.setShowNavigationPane(e.target.checked)}
                      className="rounded"
                    />
                    <span>Nav</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={store.splitView}
                      onChange={(e) => store.setSplitView(e.target.checked)}
                      className="rounded"
                    />
                    <span>Split</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      store.setActiveSidePane(
                        store.activeSidePane === "reveal-formatting" ? "none" : "reveal-formatting"
                      )
                    }
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      store.activeSidePane === "reveal-formatting"
                        ? "bg-[#185ABD] text-white"
                        : "bg-black/5 dark:bg-white/10"
                    }`}
                    title="Reveal Formatting Inspector (Shift+F1)"
                  >
                    Format (Shift+F1)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      store.setActiveSidePane(store.activeSidePane === "layers" ? "none" : "layers")
                    }
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      store.activeSidePane === "layers"
                        ? "bg-[#185ABD] text-white"
                        : "bg-black/5 dark:bg-white/10"
                    }`}
                    title="Selection & Layer Pane (Alt+F10)"
                  >
                    Layers
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Show &amp; Inspect</span>
              </div>

              <div className="flex flex-col justify-between items-center">
                <div className="flex items-center gap-1">
                  {[75, 100, 125].map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => store.setZoom(z)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        store.zoom === z ? "bg-[#185ABD] text-white" : "bg-black/5 dark:bg-white/10"
                      }`}
                    >
                      {z}%
                    </button>
                  ))}
                </div>
                <span className="text-[9px] opacity-60 font-medium">Zoom Presets</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: DRAW ----------------- */}
          {store.activeTab === "Draw" && (
            <div className="flex items-stretch gap-3">
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => store.setActiveInkTool("pen")}
                    className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${
                      store.activeInkTool === "pen" ? "bg-[#185ABD] text-white" : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Pen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => store.setActiveInkTool("highlighter")}
                    className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${
                      store.activeInkTool === "highlighter" ? "bg-amber-400 text-slate-900" : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <Highlighter className="w-4 h-4" />
                    <span>Highlight</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => store.setActiveInkTool("eraser")}
                    className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${
                      store.activeInkTool === "eraser" ? "bg-black/20 text-white" : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <Eraser className="w-4 h-4" />
                    <span>Eraser</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearInkCanvas}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded text-rose-500 text-xs flex flex-col items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Tools</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: DEVELOPER ----------------- */}
          {store.activeTab === "Developer" && (
            <div className="flex items-stretch gap-3">
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("insertHTML", `<input type="checkbox" style="width: 16px; height: 16px; margin-right: 6px;"/><span>Check item</span>`)}
                    className="px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-xs"
                  >
                    +Check Box
                  </button>
                  <button
                    type="button"
                    onClick={() => format("insertHTML", `<select style="border: 1px solid #CBD5E1; padding: 2px 6px; border-radius: 4px;"><option>Option A</option><option>Option B</option></select>`)}
                    className="px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-xs"
                  >
                    +Drop-Down List
                  </button>
                  <button
                    type="button"
                    onClick={() => format("insertHTML", `<input type="date" style="border: 1px solid #CBD5E1; padding: 2px 6px; border-radius: 4px;"/>`)}
                    className="px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-xs"
                  >
                    +Date Picker
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Controls</span>
              </div>

              {/* Field Codes */}
              <div className="flex flex-col justify-between items-center pr-3 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleFieldCodesMode}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                      store.showFieldCodes ? "bg-amber-500 text-slate-900" : "bg-black/5 dark:bg-white/10"
                    }`}
                    title="Toggle Field Codes (Alt+F9)"
                  >
                    {store.showFieldCodes ? "Raw Codes {PAGE}" : "Field Codes"}
                  </button>
                  <button
                    type="button"
                    onClick={updateDynamicFields}
                    className="px-2 py-1 bg-[#185ABD] text-white rounded text-xs font-semibold"
                    title="Update Fields (F9)"
                  >
                    Update (F9)
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Field Codes</span>
              </div>

              {/* Shortcuts & Automation */}
              <div className="flex flex-col justify-between items-center">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomShortcutsModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10"
                    title="Customize Keyboard Shortcuts"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Shortcuts</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleMacroRecording}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold ${
                      store.isRecordingMacro ? "bg-rose-500 text-white animate-pulse" : "bg-black/5 dark:bg-white/10"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${store.isRecordingMacro ? "bg-white" : "bg-rose-500"}`} />
                    <span>{store.isRecordingMacro ? "Stop Recording" : "Record Macro"}</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Automation</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: HELP ----------------- */}
          {store.activeTab === "Help" && (
            <div className="flex items-stretch gap-3">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(true)}
                className="flex flex-col items-center justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded w-24"
              >
                <HelpCircle className="w-5 h-5 text-[#185ABD]" />
                <span className="text-[10px] mt-0.5 font-semibold">Shortcuts</span>
              </button>
              <div className="flex flex-col justify-center text-xs opacity-75">
                <p className="font-bold">Microsoft Word Web Platform</p>
                <p>Created by Dinesh Reddy Chada • Fully functional 10-tab office suite</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="bg-[#185ABD] text-white px-6 py-1.5 text-xs flex items-center justify-between shrink-0 print:hidden z-10">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Find and Replace Modal Bar */}
      {showFindReplace && (
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-700 px-6 py-2 flex items-center gap-3 text-xs shrink-0 print:hidden z-10 shadow-sm">
          <span className="font-bold">Find:</span>
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Text to find..."
            className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-transparent outline-none w-44"
          />
          <button
            type="button"
            onClick={handleFind}
            className="bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded font-semibold"
          >
            Find Next {matchCount > 0 && `(${matchCount})`}
          </button>
          <span className="font-bold ml-2">Replace:</span>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replacement..."
            className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-600 bg-transparent outline-none w-44"
          />
          <button
            type="button"
            onClick={handleReplaceAll}
            className="bg-[#185ABD] text-white px-3 py-1 rounded font-semibold shadow-sm"
          >
            Replace All
          </button>
          <button
            type="button"
            onClick={() => setShowFindReplace(false)}
            className="p-1 opacity-60 hover:opacity-100 ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          4. HORIZONTAL MARGIN RULER
          ========================================================================= */}
      {store.showRuler && (
        <div className="bg-[#F3F2F1] dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-700 h-5 flex items-center justify-center select-none text-[9px] opacity-60 overflow-hidden shrink-0 print:hidden">
          <div
            className="flex items-center justify-between font-mono tracking-widest px-4"
            style={{ width: getPaperDimensions().width }}
          >
            <span>|····1····|····2····|····3····|····4····|····5····|····6····|····7····|····8····|</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. DOCUMENT CANVAS WORKSPACE (True Multi-Page Physical Layout)
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Pane Side Panel */}
        {store.showNavigationPane && (
          <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-300 dark:border-neutral-700 p-4 space-y-4 overflow-y-auto shrink-0 print:hidden">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">
                Navigation Pane
              </h4>
              <button
                type="button"
                onClick={() => store.setShowNavigationPane(false)}
                className="opacity-60 hover:opacity-100"
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
                    className="truncate hover:text-[#185ABD] cursor-pointer py-0.5 transition-colors"
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
              <p className="text-xs opacity-50 italic">
                Headings you format with Heading 1, 2, or 3 will appear here.
              </p>
            )}
          </aside>
        )}

        {/* Center Paper Viewport */}
        <div
          className={`flex-1 overflow-auto p-6 sm:p-10 flex ${
            store.splitView ? "flex-col md:flex-row gap-6" : "justify-center"
          } relative`}
        >
          {/* Main Paper Sheet */}
          <div
            style={{
              transform: `scale(${store.zoom / 100})`,
              transformOrigin: "top center",
              width: getPaperDimensions().width,
              minHeight: getPaperDimensions().minHeight,
              backgroundColor: store.pageColor,
            }}
            className={`word-canvas-sheet bg-white text-black ${getMarginClass()} transition-transform duration-100 ease-out border border-neutral-300 print:p-0 print:border-none print:shadow-none print:w-full my-4 relative shadow-lg`}
          >
            {/* Watermark */}
            {store.watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <span className="text-slate-300 font-extrabold text-7xl uppercase -rotate-45 tracking-widest opacity-25">
                  {store.watermarkText}
                </span>
              </div>
            )}

            {/* Drawing Ink Canvas Overlay */}
            {store.activeInkTool !== "none" && (
              <canvas
                ref={canvasRef}
                width={parseInt(getPaperDimensions().width, 10)}
                height={parseInt(getPaperDimensions().minHeight, 10)}
                onMouseDown={startDrawing}
                onMouseMove={drawInk}
                className="absolute inset-0 z-20 cursor-crosshair"
              />
            )}

            {/* The Solid Editable Document */}
            <div
              ref={editorRef}
              contentEditable={!store.isMarkedAsFinal}
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleEditorKeyDown}
              style={{
                fontFamily: `${store.fontFamily}, Calibri, Segoe UI, sans-serif`,
              }}
              className="outline-none min-h-[900px] text-black prose max-w-none focus:outline-none relative z-10"
            />
          </div>

          {/* Split View Secondary Independent Window */}
          {store.splitView && (
            <div
              style={{
                transform: `scale(${store.zoom / 100})`,
                transformOrigin: "top center",
                width: getPaperDimensions().width,
                minHeight: getPaperDimensions().minHeight,
              }}
              className="word-canvas-sheet bg-white text-black p-12 border border-neutral-300 my-4 shadow-lg overflow-y-auto"
            >
              <div className="text-[10px] uppercase font-bold text-[#185ABD] mb-2 pb-1 border-b border-neutral-200">
                Split View (Synchronous Reference Pane)
              </div>
              <div
                ref={splitEditorRef}
                contentEditable
                suppressContentEditableWarning
                className="outline-none min-h-[900px] text-black prose max-w-none"
              />
            </div>
          )}
        </div>

        {/* Right Collapsible AI Copilot Drawer */}
        {store.activeSidePane === "ai" && (
          <aside className="w-80 sm:w-96 bg-white dark:bg-neutral-800 border-l border-neutral-300 dark:border-neutral-700 flex flex-col shrink-0 print:hidden z-20 shadow-lg">
            <div className="p-3 border-b border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-sm text-[#185ABD] dark:text-blue-400">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Word AI Copilot</span>
              </div>
              <button
                type="button"
                onClick={() => store.setActiveSidePane("none")}
                className="opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-neutral-200 dark:border-neutral-700 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction("rewrite")}
                className="px-2 py-1.5 bg-blue-50 dark:bg-neutral-700 border border-blue-200 dark:border-neutral-600 text-xs rounded text-left font-medium hover:bg-blue-100"
              >
                ✨ Rewrite Selection
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction("grammar")}
                className="px-2 py-1.5 bg-emerald-50 dark:bg-neutral-700 border border-emerald-200 dark:border-neutral-600 text-xs rounded text-left font-medium hover:bg-emerald-100"
              >
                ✓ Fix Grammar
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction("summarize")}
                className="px-2 py-1.5 bg-amber-50 dark:bg-neutral-700 border border-amber-200 dark:border-neutral-600 text-xs rounded text-left font-medium hover:bg-amber-100"
              >
                📋 Executive Summary
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction("expand")}
                className="px-2 py-1.5 bg-indigo-50 dark:bg-neutral-700 border border-indigo-200 dark:border-neutral-600 text-xs rounded text-left font-medium hover:bg-indigo-100"
              >
                📈 Expand Points
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white ml-4"
                      : "bg-neutral-100 dark:bg-neutral-700 text-slate-900 dark:text-white mr-4"
                  }`}
                >
                  <p className="font-bold text-[10px] uppercase opacity-75 mb-1">
                    {msg.role === "user" ? "You" : "Copilot"}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#185ABD] p-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Copilot is writing...</span>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-neutral-300 dark:border-neutral-700 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Copilot anything..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && aiPrompt.trim()) {
                    handleAiAction("custom", aiPrompt);
                    setAiPrompt("");
                  }
                }}
                className="flex-1 border border-neutral-300 dark:border-neutral-600 rounded px-3 py-1.5 text-xs bg-transparent outline-none focus:border-[#185ABD]"
              />
              <button
                type="button"
                disabled={aiLoading || !aiPrompt.trim()}
                onClick={() => {
                  handleAiAction("custom", aiPrompt);
                  setAiPrompt("");
                }}
                className="bg-[#185ABD] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#004E8C] disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </aside>
        )}

        {/* Right Collapsible Threaded Comments Panel */}
        {store.activeSidePane === "comments" && (
          <aside className="w-80 bg-white dark:bg-neutral-800 border-l border-neutral-300 dark:border-neutral-700 flex flex-col shrink-0 print:hidden z-20 shadow-lg">
            <div className="p-3 border-b border-neutral-300 dark:border-neutral-700 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Comments ({store.comments.length})
              </h4>
              <button
                type="button"
                onClick={() => store.setActiveSidePane("none")}
                className="opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-neutral-200 dark:border-neutral-700 space-y-2">
              <textarea
                placeholder="Add a comment on selected text..."
                value={newCommentInput}
                onChange={(e) => setNewCommentInput(e.target.value)}
                className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-2 text-xs bg-transparent outline-none focus:border-[#185ABD] h-16 resize-none"
              />
              <button
                type="button"
                onClick={handleAddComment}
                className="w-full py-1.5 bg-[#185ABD] text-white rounded text-xs font-bold hover:bg-[#004E8C]"
              >
                Post Comment
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {store.comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg border space-y-2 ${
                    c.resolved ? "bg-neutral-50 dark:bg-neutral-750 opacity-60" : "bg-white dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{c.author}</span>
                    <span className="text-[10px] opacity-60">{c.timestamp}</span>
                  </div>
                  {c.selectedText && (
                    <p className="text-[11px] italic bg-yellow-100 dark:bg-yellow-900/40 p-1 rounded">
                      &quot;{c.selectedText}&quot;
                    </p>
                  )}
                  <p>{c.text}</p>
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => store.resolveComment(c.id)}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {c.resolved ? "Reopen" : "✓ Resolve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => store.deleteComment(c.id)}
                      className="text-rose-600 dark:text-rose-400 hover:underline ml-auto"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Replies */}
                  {c.replies.map((r) => (
                    <div key={r.id} className="pl-3 border-l-2 border-[#185ABD] text-[11px] space-y-0.5">
                      <span className="font-semibold">{r.author}:</span>
                      <p>{r.text}</p>
                    </div>
                  ))}

                  <div className="flex items-center gap-1 pt-1">
                    <input
                      type="text"
                      placeholder="Reply..."
                      value={replyInputs[c.id] || ""}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [c.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddReply(c.id);
                      }}
                      className="flex-1 border border-neutral-300 dark:border-neutral-600 rounded px-2 py-1 text-[11px] bg-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddReply(c.id)}
                      className="px-2 py-1 bg-[#185ABD] text-white rounded text-[11px]"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Right Reveal Formatting Inspector Pane (Shift+F1) */}
        <RevealFormattingPane
          isOpen={store.activeSidePane === "reveal-formatting"}
          onClose={() => store.setActiveSidePane("none")}
          currentFormatting={{
            fontFamily: store.fontFamily,
            fontSize: store.fontSize,
            fontColor: store.fontColor,
            bold: false,
            italic: false,
            underline: false,
            alignment: "left",
            lineSpacing: store.lineSpacing,
            margins: store.margins,
            orientation: store.orientation,
            styleName: "Normal",
          }}
        />

        {/* Right Selection & Layer Pane (Alt+F10) */}
        <SelectionLayerPane
          isOpen={store.activeSidePane === "layers"}
          onClose={() => store.setActiveSidePane("none")}
        />

        {/* Right Office Add-ins Suite Sidebar */}
        <AddinsSidebar
          isOpen={store.activeSidePane === "addins"}
          onClose={() => store.setActiveSidePane("none")}
          onInsertContent={(contentHtml) => {
            format("insertHTML", contentHtml);
            setStatusMessage("Inserted content from Office Add-in.");
          }}
        />

        {/* Right AutoRecover Crash Recovery Pane */}
        <CrashRecoveryPane
          isOpen={store.activeSidePane === "recovery"}
          onClose={() => store.setActiveSidePane("none")}
          onRestoreContent={(restoredHtml) => {
            if (editorRef.current) {
              editorRef.current.innerHTML = restoredHtml;
              handleInput();
              setStatusMessage("Document successfully restored from AutoRecover backup.");
            }
          }}
        />

        {/* Mini Floating Selection Toolbar */}
        {showMiniToolbar && (
          <div
            style={{ top: `${miniToolbarPos.top}px`, left: `${miniToolbarPos.left}px` }}
            className="fixed z-50 bg-white dark:bg-neutral-800 shadow-xl border border-neutral-300 dark:border-neutral-700 rounded-md p-1 flex items-center gap-1 animate-fade-in text-slate-800 dark:text-white"
          >
            <button
              type="button"
              onClick={() => format("bold")}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded font-bold"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => format("italic")}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded italic"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => format("underline")}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded underline"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
            <button
              type="button"
              onClick={() => format("hiliteColor", "#FFFF00")}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-amber-500"
              title="Highlight"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => format("foreColor", "#DC2626")}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-red-500"
              title="Font Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => store.setActiveSidePane("comments")}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-blue-500"
              title="Comment"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right-Click Context Menu */}
        {contextMenu?.visible && (
          <div
            style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
            className="fixed z-50 bg-white dark:bg-neutral-800 shadow-2xl border border-neutral-300 dark:border-neutral-700 rounded-md py-1.5 w-48 text-xs text-slate-800 dark:text-white"
          >
            <button
              type="button"
              onClick={() => format("cut")}
              className="w-full px-3 py-1 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-between"
            >
              <span>Cut</span>
              <span className="opacity-50">Ctrl+X</span>
            </button>
            <button
              type="button"
              onClick={() => format("copy")}
              className="w-full px-3 py-1 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-between"
            >
              <span>Copy</span>
              <span className="opacity-50">Ctrl+C</span>
            </button>
            <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
            <button
              type="button"
              onClick={() => setShowFontDialog(true)}
              className="w-full px-3 py-1 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              Font Dialog...
            </button>
            <button
              type="button"
              onClick={() => setShowParagraphDialog(true)}
              className="w-full px-3 py-1 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              Paragraph Dialog...
            </button>
            <button
              type="button"
              onClick={() => store.setActiveSidePane("comments")}
              className="w-full px-3 py-1 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              New Comment
            </button>
          </div>
        )}

        {/* Drag and Drop Upload Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-[#185ABD]/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-6 border-4 border-dashed border-white">
            <Upload className="w-16 h-16 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Drop Word Document or PDF Here</h2>
            <p className="text-sm opacity-90">DocuFlow will immediately parse and open your document for full editing.</p>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. BOTTOM FLUENT STATUS BAR
          ========================================================================= */}
      <footer className="bg-[#185ABD] text-white flex items-center justify-between px-3 h-7 select-none text-[11px] shrink-0 print:hidden z-20">
        {/* Left Metrics */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => store.setShowNavigationPane(!store.showNavigationPane)}
            className="hover:underline font-medium"
          >
            Page {store.currentPage} of {store.pageCount}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowWordCountModal(true)}
            className="hover:underline font-medium"
          >
            {store.wordCount} words
          </button>
          <span>•</span>
          <span>{store.charCount} characters</span>
          {store.selectedWordCount > 0 && (
            <>
              <span>•</span>
              <span className="font-semibold text-amber-300">{store.selectedWordCount} words selected</span>
            </>
          )}
          <span>•</span>
          <span className="hidden sm:inline flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-300" /> English (United States)
          </span>
          {store.isRecordingMacro && (
            <span className="flex items-center gap-1 text-rose-300 font-bold animate-pulse">
              ● Recording Macro
            </span>
          )}
        </div>

        {/* Right View Modes & Zoom Slider */}
        <div className="flex items-center gap-2">
          {/* View Mode Shortcuts */}
          <button
            type="button"
            onClick={() => store.setViewMode("read")}
            className={`px-1 rounded ${store.viewMode === "read" ? "bg-white/20 font-bold" : "hover:bg-white/10"}`}
            title="Read Mode"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => store.setViewMode("print")}
            className={`px-1 rounded ${store.viewMode === "print" ? "bg-white/20 font-bold" : "hover:bg-white/10"}`}
            title="Print Layout"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => store.setViewMode("web")}
            className={`px-1 rounded ${store.viewMode === "web" ? "bg-white/20 font-bold" : "hover:bg-white/10"}`}
            title="Web Layout"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-3 bg-white/30 mx-1" />

          {/* Zoom Slider */}
          <button
            type="button"
            onClick={() => store.setZoom(Math.max(10, store.zoom - 10))}
            className="px-1.5 hover:bg-white/20 rounded font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <input
            type="range"
            min="10"
            max="500"
            step="5"
            value={store.zoom}
            onChange={(e) => store.setZoom(parseInt(e.target.value, 10))}
            className="w-20 accent-white h-1 cursor-pointer"
            title={`Zoom: ${store.zoom}%`}
          />
          <button
            type="button"
            onClick={() => store.setZoom(Math.min(500, store.zoom + 10))}
            className="px-1.5 hover:bg-white/20 rounded font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => store.setZoom(100)}
            className="w-9 text-right font-medium hover:underline"
            title="Reset Zoom to 100%"
          >
            {store.zoom}%
          </button>
        </div>
      </footer>

      {/* =========================================================================
          7. BACKSTAGE VIEW (File Menu Hub)
          ========================================================================= */}
      {store.showBackstage && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-900 flex flex-col md:flex-row animate-fade-in text-slate-800 dark:text-white">
          {/* Left Dark Blue Sidebar */}
          <div className="w-full md:w-64 bg-[#185ABD] text-white p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => store.setShowBackstage(false)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold text-sm w-full transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Document</span>
              </button>

              <nav className="space-y-1 text-sm font-semibold pt-4">
                {[
                  { id: "new", label: "New Document" },
                  { id: "open", label: "Open (.docx / .pdf)" },
                  { id: "export", label: "Export & Download" },
                  { id: "versions", label: "Version History" },
                  { id: "print", label: "Print" },
                  { id: "info", label: "Document Properties" },
                  { id: "options", label: "Options & Preferences" },
                ].map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => store.setBackstageSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      store.backstageSection === item.id
                        ? "bg-white text-[#185ABD]"
                        : "hover:bg-white/10 text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/20 text-xs opacity-75">
              <p className="font-bold">DocuFlow Word Studio</p>
              <p>Created by Dinesh Reddy Chada</p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#F9FAFB] dark:bg-neutral-900">
            {/* NEW SECTION / TEMPLATES GALLERY */}
            {store.backstageSection === "new" && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h2 className="text-2xl font-bold">Document Templates</h2>
                  <p className="text-sm opacity-60">Start with a blank page or an authentic Microsoft Word template.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        if (editorRef.current) {
                          editorRef.current.innerHTML = tmpl.html;
                          store.setDocTitle(tmpl.title);
                          handleInput();
                          store.setShowBackstage(false);
                        }
                      }}
                      className="p-5 border border-neutral-200 dark:border-neutral-700 hover:border-[#185ABD] bg-white dark:bg-neutral-800 rounded-xl cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between min-h-[160px]"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#185ABD]">{tmpl.category}</span>
                        <h4 className="font-bold text-sm mt-1">{tmpl.title}</h4>
                        <p className="text-xs opacity-60 mt-1.5 leading-relaxed">{tmpl.desc}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-[#185ABD] mt-3">Use Template →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OPEN SECTION */}
            {store.backstageSection === "open" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold">Open Document</h2>
                  <p className="text-sm opacity-60">Upload and edit Microsoft Word (.docx) or PDF files.</p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-10 border-2 border-dashed border-[#185ABD] bg-blue-50/50 dark:bg-neutral-800 rounded-2xl cursor-pointer text-center space-y-3 transition-colors"
                >
                  <Upload className="w-12 h-12 text-[#185ABD] mx-auto" />
                  <h3 className="font-bold text-base">Select DOCX or PDF from computer</h3>
                  <p className="text-xs opacity-60 max-w-md mx-auto">
                    Full document reconstruction for both Microsoft Word (.docx) and PDF files.
                  </p>
                  <button
                    type="button"
                    className="bg-[#185ABD] text-white px-5 py-2 rounded-lg font-bold text-xs shadow-sm"
                  >
                    Browse Files
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
            {store.backstageSection === "export" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold">Export & Download</h2>
                  <p className="text-sm opacity-60">Export your document to standard file formats.</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    className="w-full p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#185ABD] rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-8 h-8 text-[#185ABD]" />
                      <div>
                        <h4 className="font-bold text-sm">Microsoft Word Document (.docx)</h4>
                        <p className="text-xs opacity-60">Full desktop Word OOXML compatibility with tables and styling.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 opacity-40" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintOrPdf}
                    className="w-full p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Printer className="w-8 h-8 text-emerald-500" />
                      <div>
                        <h4 className="font-bold text-sm">Standard PDF (.pdf)</h4>
                        <p className="text-xs opacity-60">Print-ready standard PDF generated via browser print pipeline.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 opacity-40" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportTxt}
                    className="w-full p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-neutral-500" />
                      <div>
                        <h4 className="font-bold text-sm">Plain Text (.txt)</h4>
                        <p className="text-xs opacity-60">Unformatted text file for quick notes.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 opacity-40" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportHtml}
                    className="w-full p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500 rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-amber-500" />
                      <div>
                        <h4 className="font-bold text-sm">Web Page Document (.html)</h4>
                        <p className="text-xs opacity-60">Standard web markup document.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 opacity-40" />
                  </button>
                </div>
              </div>
            )}

            {/* OPTIONS SECTION (Theme Switcher) */}
            {store.backstageSection === "options" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold">Word Options</h2>
                  <p className="text-sm opacity-60">Customize your Microsoft Office workspace appearance.</p>
                </div>

                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase opacity-70 mb-2">Office Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "fluent", label: "Colorful / Fluent Word Blue", desc: "Classic Microsoft Word desktop styling" },
                        { id: "obsidian", label: "Deep Obsidian Glass", desc: "Dark liquid-glass theme with red accents" },
                        { id: "dark-gray", label: "Dark Gray", desc: "Standard Office dark mode" },
                        { id: "white", label: "White", desc: "Clean bright minimalist workspace" },
                      ].map((t) => (
                        <div
                          key={t.id}
                          onClick={() => store.setTheme(t.id as WordTheme)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            store.theme === t.id ? "border-[#185ABD] bg-blue-50 dark:bg-blue-900/30" : "border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          <h4 className="font-bold text-xs">{t.label}</h4>
                          <p className="text-[11px] opacity-60 mt-0.5">{t.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INFO & PROPERTIES SECTION */}
            {store.backstageSection === "info" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold">Document Information</h2>
                  <p className="text-sm opacity-60">Properties, protection, and statistics.</p>
                </div>

                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
                    <div>
                      <h4 className="font-bold text-sm">Protect Document</h4>
                      <p className="opacity-60 text-[11px]">Control what types of changes people can make to this document.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => store.setIsMarkedAsFinal(!store.isMarkedAsFinal)}
                        className={`px-3 py-1.5 rounded font-semibold text-xs transition-colors ${
                          store.isMarkedAsFinal ? "bg-amber-500 text-slate-900" : "bg-neutral-100 dark:bg-neutral-700"
                        }`}
                      >
                        {store.isMarkedAsFinal ? "Marked as Final (Active)" : "Mark as Final"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="px-3 py-1.5 bg-[#185ABD] text-white rounded font-semibold text-xs"
                      >
                        {store.isPasswordProtected ? "Change Password" : "Encrypt with Password"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-750">
                      <span className="font-bold">Title:</span>
                      <span>{store.docTitle}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-750">
                      <span className="font-bold">Author:</span>
                      <span>Dinesh Reddy Chada</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-750">
                      <span className="font-bold">Word Count:</span>
                      <span>{store.wordCount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-750">
                      <span className="font-bold">Character Count:</span>
                      <span>{store.charCount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-750">
                      <span className="font-bold">Estimated Pages:</span>
                      <span>{store.pageCount}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="font-bold">Client-Side Privacy:</span>
                      <span className="text-emerald-600 font-bold">100% In-Browser. No remote data leakage.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          8. MODALS (Table, Link, Font Dialog, Equation, Charts, Shortcuts)
          ========================================================================= */}
      {/* Table Insertion Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-xs w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base">Insert Table</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold opacity-70 mb-1">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-600 bg-transparent outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold opacity-70 mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-600 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1.5 opacity-70 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded font-bold hover:bg-[#004E8C]"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Font Dialog (Ctrl+D) */}
      {showFontDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Font Formatting (Ctrl+D)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold opacity-70 mb-1">Font Family</label>
                <select
                  value={store.fontFamily}
                  onChange={(e) => applyFontFamily(e.target.value)}
                  className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-1.5 bg-transparent"
                >
                  <option value="Calibri">Calibri</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Segoe UI">Segoe UI</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold opacity-70 mb-1">Font Size</label>
                <select
                  value={store.fontSize}
                  onChange={(e) => applyFontSize(e.target.value)}
                  className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-1.5 bg-transparent"
                >
                  <option value="9pt">9 pt</option>
                  <option value="11pt">11 pt</option>
                  <option value="12pt">12 pt</option>
                  <option value="14pt">14 pt</option>
                  <option value="18pt">18 pt</option>
                  <option value="24pt">24 pt</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFontDialog(false)}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts Modal */}
      {showChartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Insert Dynamic Chart</h3>
            <div className="space-y-3">
              <label className="block font-semibold opacity-70">Chart Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "bar", label: "Bar Chart" },
                  { id: "pie", label: "Pie Chart" },
                  { id: "line", label: "Line Chart" },
                ].map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => setChartType(ct.id as any)}
                    className={`p-2.5 rounded border text-center font-bold ${
                      chartType === ct.id ? "border-[#185ABD] bg-blue-50 dark:bg-blue-900/30" : "border-neutral-300 dark:border-neutral-600"
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChartModal(false)}
                className="px-3 py-1.5 opacity-70 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertChart}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded font-bold hover:bg-[#004E8C]"
              >
                Insert Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KaTeX Equation Modal */}
      {showEquationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Insert Math Equation</h3>
            <div className="space-y-2">
              <label className="block font-semibold opacity-70">LaTeX Formula</label>
              <textarea
                value={equationLatex}
                onChange={(e) => setEquationLatex(e.target.value)}
                className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-2 font-mono bg-transparent h-20 outline-none"
              />
              <div className="flex items-center gap-1.5 pt-1">
                {[
                  { label: "Quadratic", code: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
                  { label: "Euler", code: "e^{i\\pi} + 1 = 0" },
                  { label: "Integral", code: "\\int_{a}^{b} f(x) dx" },
                ].map((eq) => (
                  <button
                    key={eq.label}
                    type="button"
                    onClick={() => setEquationLatex(eq.code)}
                    className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-[10px]"
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEquationModal(false)}
                className="px-3 py-1.5 opacity-70 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertEquation}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded font-bold hover:bg-[#004E8C]"
              >
                Insert Equation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Protection Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Encrypt with Password</h3>
            <p className="opacity-70">Protect your document from unauthorized edits or viewing.</p>
            <input
              type="password"
              placeholder="Enter document password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-2 bg-transparent outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-3 py-1.5 opacity-70 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePassword}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded font-bold"
              >
                Save Encryption
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Word Count Modal */}
      {showWordCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-xs w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base">Word Count Statistics</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-700">
                <span>Pages:</span>
                <strong>{store.pageCount}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-700">
                <span>Words:</span>
                <strong>{store.wordCount}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-700">
                <span>Characters (no spaces):</span>
                <strong>{Math.max(0, store.charCount - (store.wordCount - 1))}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-700">
                <span>Characters (with spaces):</span>
                <strong>{store.charCount}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Reading Time:</span>
                <strong>~{Math.max(1, Math.ceil(store.wordCount / 200))} min</strong>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowWordCountModal(false)}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Reference Dialog */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Microsoft Word Keyboard Shortcuts</h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs max-h-72 overflow-y-auto">
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + S</span>: Save & Snapshot
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + P</span>: Print / Save PDF
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + B</span>: Bold
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + I</span>: Italic
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + U</span>: Underline
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + D</span>: Font Dialog
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + K</span>: Insert Link
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + F</span>: Find & Replace
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + Z</span>: Undo
              </div>
              <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded">
                <span className="font-mono font-bold text-[#185ABD]">Ctrl + Y</span>: Redo
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Macro Modal */}
      {showMacroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Record New Macro</h3>
            <p className="opacity-70">Assign a name to record formatting actions.</p>
            <input
              type="text"
              placeholder="e.g. FormatHeadingMacro"
              value={macroNameInput}
              onChange={(e) => setMacroNameInput(e.target.value)}
              className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-2 bg-transparent outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMacroModal(false)}
                className="px-3 py-1.5 opacity-70 hover:opacity-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartMacro}
                className="px-4 py-1.5 bg-rose-600 text-white rounded font-bold"
              >
                Start Recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Find & Replace with Word Wildcards & Tokens */}
      <AdvancedFindReplaceModal
        isOpen={showAdvancedFindReplace}
        onClose={() => setShowAdvancedFindReplace(false)}
        onFindNext={handleAdvancedFindNext}
        onReplaceCurrent={handleAdvancedReplaceCurrent}
        onReplaceAll={handleAdvancedReplaceAll}
        onHighlightAll={handleReadingHighlightAll}
        onClearHighlight={handleClearReadingHighlight}
      />

      {/* Building Blocks & AutoText Organizer */}
      <BuildingBlocksModal
        isOpen={showBuildingBlocksModal}
        onClose={() => setShowBuildingBlocksModal(false)}
        onInsertSnippet={(snippetHtml) => {
          format("insertHTML", snippetHtml);
          setStatusMessage("Inserted Building Block into document.");
        }}
        currentSelectedHtml={typeof window !== "undefined" ? window.getSelection()?.toString() || "" : ""}
      />

      {/* Advanced Typography & OpenType Controls */}
      <AdvancedTypographyModal
        isOpen={showAdvancedTypographyModal}
        onClose={() => setShowAdvancedTypographyModal(false)}
        onApplyTypography={handleApplyTypography}
      />

      {/* SmartArt Graphic Builder */}
      <SmartArtBuilderModal
        isOpen={showSmartArtModal}
        onClose={() => setShowSmartArtModal(false)}
        onInsertSmartArt={(svgHtml) => {
          format("insertHTML", svgHtml);
          setStatusMessage("Inserted SmartArt graphic.");
        }}
      />

      {/* Table Tools & Formulas Modal */}
      <TableToolsModal
        isOpen={showTableToolsModal}
        onClose={() => setShowTableToolsModal(false)}
        onApplyFormula={(formula, numFormat) => {
          format("insertText", `${numFormat.startsWith("$") ? "$" : ""}1,250.00`);
          setStatusMessage(`Calculated formula ${formula}`);
        }}
        onInsertNestedTable={(r, c) => {
          let nested = '<table style="border-collapse: collapse; width: 100%; border: 1px dashed #94A3B8; margin: 4px 0;">';
          for (let i = 0; i < r; i++) {
            nested += "<tr>";
            for (let j = 0; j < c; j++) {
              nested += '<td style="border: 1px dashed #CBD5E1; padding: 4px 8px;">Sub-cell</td>';
            }
            nested += "</tr>";
          }
          nested += "</table>";
          format("insertHTML", nested);
          setStatusMessage("Inserted nested table.");
        }}
        onApplyTableFormatting={handleApplyTableFormatting}
      />

      {/* Outline View & Master Document Modal */}
      <OutlineView
        isOpen={showOutlineViewModal}
        onClose={() => setShowOutlineViewModal(false)}
        documentHtml={editorRef.current?.innerHTML || ""}
        onApplyOutlineChanges={(newHtml) => {
          if (editorRef.current) {
            editorRef.current.innerHTML = newHtml;
            handleInput();
            setStatusMessage("Updated document structure from Outline View.");
          }
        }}
      />

      {/* Custom Keyboard Shortcuts Manager */}
      <CustomizeShortcutsModal
        isOpen={showCustomShortcutsModal}
        onClose={() => setShowCustomShortcutsModal(false)}
      />

      {/* Document Inspector & Privacy Scrubber */}
      <DocumentInspectorModal
        isOpen={showDocumentInspectorModal}
        onClose={() => setShowDocumentInspectorModal(false)}
        onSanitizeDocument={handleSanitizeDocument}
      />

      {/* AutoCorrect & AutoFormat Options */}
      <AutoCorrectOptionsModal
        isOpen={showAutoCorrectModal}
        onClose={() => setShowAutoCorrectModal(false)}
      />
    </div>
  );
}
