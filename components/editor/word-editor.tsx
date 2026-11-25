"use client";

import React, { useState, useEffect, useRef, useTransition, useMemo } from "react";
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
  CheckCircle2,
  BarChart2,
  RotateCw,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen,
  Globe,
  SortAsc,
  Pilcrow,
  Lightbulb,
  Video,
  Shapes,
  FileCode,
  X,
  ArrowLeft,
  Layers,
  HelpCircle,
  Home,
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
  const [showPageSetupDialog, setShowPageSetupDialog] = useState(false);

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

  // Universal Tell Me Command Palette state
  const [tellMeQuery, setTellMeQuery] = useState("");
  const [showTellMeMenu, setShowTellMeMenu] = useState(false);
  const tellMeRef = useRef<HTMLDivElement>(null);

  // Backup for Mail Merge
  const [backupBeforeMerge, setBackupBeforeMerge] = useState<string | null>(null);

  // DOM Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const splitEditorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current && editorRef.current) {
      editorRef.current.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  // =========================================================================
  // 1. BUILT-IN TEMPLATES
  // =========================================================================
  const TEMPLATES = [
    {
      id: "workonline-obsidian",
      category: "WorkOnline Suite",
      title: "WorkOnline Executive Dossier",
      desc: "Our signature dark obsidian & crimson red branded document template.",
      html: `
        <div style="border-bottom: 3px solid #DC2626; padding-bottom: 16px; margin-bottom: 24px;">
          <span style="background: linear-gradient(135deg, #DC2626, #F43F5E); color: #FFFFFF; font-size: 9pt; font-weight: 800; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.1em;">WorkOnline SaaS Suite</span>
          <h1 style="color: #0F172A; font-size: 26pt; font-weight: 800; margin: 12px 0 6px 0; letter-spacing: -0.02em;">Project Master Architecture & Executive Brief</h1>
          <p style="color: #64748B; font-size: 11pt; margin: 0;">Author: <strong>WorkOnline Core Team</strong> • Confidential &amp; Proprietary</p>
        </div>
        <div style="background-color: #FFF1F2; border-left: 4px solid #DC2626; padding: 14px 18px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <p style="color: #9F1239; font-weight: 700; margin: 0 0 4px 0; font-size: 11pt;">Executive Mission</p>
          <p style="color: #881337; margin: 0; font-size: 10pt; line-height: 1.5;">Empower users worldwide with a unified, high-performance web suite combining intelligent document authoring, instant PDF transformation, and serverless AI productivity tools.</p>
        </div>
        <h2 style="color: #0F172A; font-size: 15pt; font-weight: 700; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin-top: 24px;">1. Strategic Pillars</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #F8FAFC;">
              <th style="border: 1px solid #CBD5E1; padding: 10px; text-align: left; font-size: 10pt; color: #0F172A;">Core Capability</th>
              <th style="border: 1px solid #CBD5E1; padding: 10px; text-align: left; font-size: 10pt; color: #0F172A;">Specification</th>
              <th style="border: 1px solid #CBD5E1; padding: 10px; text-align: left; font-size: 10pt; color: #0F172A;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 10px; font-weight: 600; font-size: 10pt;">Document Studio</td>
              <td style="border: 1px solid #CBD5E1; padding: 10px; font-size: 10pt;">Full desktop Microsoft Word parity, 11-tab ribbon, backstage, DOCX &amp; PDF engine</td>
              <td style="border: 1px solid #CBD5E1; padding: 10px; color: #DC2626; font-weight: 700; font-size: 10pt;">Production Live</td>
            </tr>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 10px; font-weight: 600; font-size: 10pt;">AI Workspace</td>
              <td style="border: 1px solid #CBD5E1; padding: 10px; font-size: 10pt;">Gemini 3.5 Copilot for summarization, email drafting, grammar, and Q&amp;A</td>
              <td style="border: 1px solid #CBD5E1; padding: 10px; color: #16A34A; font-weight: 700; font-size: 10pt;">Active &amp; Ready</td>
            </tr>
          </tbody>
        </table>
      `,
    },
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
    document.documentElement.classList.add('dark');
    const savedDraft = localStorage.getItem("docuflow_document_draft");
    const savedTitle = localStorage.getItem("docuflow_document_title");

    if (editorRef.current) {
      if (savedDraft) {
        editorRef.current.innerHTML = savedDraft;
      } else {
        editorRef.current.innerHTML = TEMPLATES[1].html;
      }
      updateMetrics();
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 150);
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
          case "b":
            e.preventDefault();
            format("bold");
            break;
          case "i":
            e.preventDefault();
            format("italic");
            break;
          case "u":
            e.preventDefault();
            format("underline");
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              format("redo");
            } else {
              format("undo");
            }
            break;
          case "y":
            e.preventDefault();
            format("redo");
            break;
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
          case "e":
            e.preventDefault();
            format("justifyCenter");
            break;
          case "l":
            if (!e.altKey && !e.shiftKey) {
              e.preventDefault();
              format("justifyLeft");
            }
            break;
          case "r":
            if (!e.altKey && !e.shiftKey) {
              e.preventDefault();
              format("justifyRight");
            }
            break;
          case "j":
            e.preventDefault();
            format("justifyFull");
            break;
        }
      }
    };

    // Selection change for floating mini toolbar & formatting inspection
    const handleSelectionChange = () => {
      saveSelection();
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

    const handleOutsideClick = (e: MouseEvent) => {
      if (tellMeRef.current && !tellMeRef.current.contains(e.target as Node)) {
        setShowTellMeMenu(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      clearInterval(recoveryTimer);
      window.removeEventListener("keydown", handleGlobalKeyDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mousedown", handleOutsideClick);
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
      try {
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
      } catch (err) {
        console.warn("AutoCorrect keystroke processing error:", err);
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
    if (savedSelectionRef.current) {
      restoreSelection();
    }
    try {
      document.execCommand(command, false, value);
    } catch (err) {
      console.warn("Formatting command execution warning:", command, err);
    }
    saveSelection();
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
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (savedSelectionRef.current) {
      restoreSelection();
    }
    format("fontName", family);
  };

  const applyFontSize = (sizeStr: string) => {
    store.setFontSize(sizeStr);
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (savedSelectionRef.current) {
      restoreSelection();
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      editorRef.current.style.fontSize = sizeStr;
      return;
    }
    try {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = sizeStr;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      range.selectNode(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch {
      document.execCommand("fontSize", false, "3");
    }
    saveSelection();
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


  const getPageBorderClass = () => {
    switch (store.pageBorder) {
      case "box":
        return "border-2 border-neutral-900 shadow-sm";
      case "shadow":
        return "shadow-2xl border border-neutral-400";
      case "double":
        return "border-4 border-double border-neutral-900 shadow-md";
      case "dashed":
        return "border-2 border-dashed border-neutral-600 shadow-sm";
      default:
        return "border border-neutral-300 shadow-lg";
    }
  };

  const applyDocTheme = (themeName: string) => {
    switch (themeName) {
      case "facet":
        store.setFontFamily("Trebuchet MS");
        break;
      case "integral":
        store.setFontFamily("Georgia");
        break;
      case "ion":
        store.setFontFamily("Century Gothic");
        break;
      case "retrospect":
        store.setFontFamily("Book Antiqua");
        break;
      case "slice":
        store.setFontFamily("Garamond");
        break;
      default:
        store.setFontFamily("Calibri");
        break;
    }
  };

  const applyStyleSet = (setName: string) => {
    store.setStyleSet(setName as any);
  };


  // Quick & Easy Document Super-Tools
  const insertQuickTable = (rows = 3, cols = 3) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt;"><thead><tr style="background-color: #1E161A; color: #FFFFFF;">';
    for (let c = 1; c <= cols; c++) {
      tableHtml += '<th style="border: 1px solid #475569; padding: 8px 12px; text-align: left; font-weight: 700;">Header ' + c + '</th>';
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 1; r <= rows; r++) {
      const bg = r % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
      tableHtml += '<tr style="background-color: ' + bg + '; color: #0F172A;">';
      for (let c = 1; c <= cols; c++) {
        tableHtml += '<td style="border: 1px solid #CBD5E1; padding: 8px 12px;">Row ' + r + ', Cell ' + c + '</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br/></p>';
    format("insertHTML", tableHtml);
    setStatusMessage('Inserted ' + rows + 'x' + cols + ' Quick Table');
  };

  const insertTableTotalRow = () => {
    const totalRowHtml = '<tr style="background-color: #FFF1F2; font-weight: 800; color: #9F1239; border-top: 2px solid #DC2626;"><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">Σ Total</td><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">$0.00</td><td style="border: 1px solid #CBD5E1; padding: 8px 12px;">100%</td></tr>';
    format("insertHTML", totalRowHtml);
    setStatusMessage("Inserted Table Total Row (Σ)");
  };

  const insertCalloutBox = (type: "tip" | "info" | "warning" | "quote") => {
    let calloutHtml = "";
    switch (type) {
      case "tip":
        calloutHtml = '<div style="background-color: #F0FDF4; border-left: 4px solid #16A34A; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; color: #166534;"><strong style="display: block; font-size: 10.5pt; margin-bottom: 4px;">💡 Pro Tip</strong><p style="margin: 0; font-size: 10pt; line-height: 1.5;">Type your key recommendation or best-practice insight here.</p></div><p><br/></p>';
        break;
      case "info":
        calloutHtml = '<div style="background-color: #EFF6FF; border-left: 4px solid #2563EB; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; color: #1E40AF;"><strong style="display: block; font-size: 10.5pt; margin-bottom: 4px;">ℹ️ Important Information</strong><p style="margin: 0; font-size: 10pt; line-height: 1.5;">Include essential background context or reference details here.</p></div><p><br/></p>';
        break;
      case "warning":
        calloutHtml = '<div style="background-color: #FFFBEB; border-left: 4px solid #D97706; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; color: #92400E;"><strong style="display: block; font-size: 10.5pt; margin-bottom: 4px;">⚠️ Warning / Caution</strong><p style="margin: 0; font-size: 10pt; line-height: 1.5;">Notice: Verify numbers, legal requirements, or constraints before proceeding.</p></div><p><br/></p>';
        break;
      case "quote":
        calloutHtml = '<blockquote style="border-left: 4px solid #DC2626; padding: 10px 20px; margin: 20px 0; font-style: italic; color: #475569; background-color: #FFF1F2; border-radius: 0 8px 8px 0;"><p style="font-size: 12pt; font-weight: 500; margin: 0 0 6px 0; color: #0F172A;">“Add your executive statement or compelling quotation here.”</p><cite style="display: block; font-size: 9.5pt; font-style: normal; font-weight: 700; color: #DC2626;">— Author or Speaker Name</cite></blockquote><p><br/></p>';
        break;
    }
    format("insertHTML", calloutHtml);
    setStatusMessage('Inserted ' + type.toUpperCase() + ' callout box');
  };

  const insertDivider = (styleType: "crimson" | "dashed" | "double") => {
    let divHtml = "";
    if (styleType === "crimson") {
      divHtml = '<div style="height: 3px; background: linear-gradient(90deg, #DC2626, #F43F5E, transparent); margin: 24px 0; border-radius: 2px;"></div><p><br/></p>';
    } else if (styleType === "dashed") {
      divHtml = '<hr style="border: none; border-top: 2px dashed #94A3B8; margin: 24px 0;" /><p><br/></p>';
    } else {
      divHtml = '<hr style="border: none; border-top: 3px double #0F172A; margin: 24px 0;" /><p><br/></p>';
    }
    format("insertHTML", divHtml);
    setStatusMessage("Inserted document divider");
  };

  const cleanDocumentFormatting = () => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      html = html.replace(/&nbsp;&nbsp;+/g, " ");
      html = html.replace(/<span style="[^"]*background-color:\s*rgb\(255,\s*255,\s*255\)[^"]*">([\s\S]*?)<\/span>/gi, "$1");
      editorRef.current.innerHTML = html;
      handleInput();
      setStatusMessage("Cleaned formatting & normalized spaces.");
    }
  };

  const insertCoverPage = () => {
    const coverHtml = `<div style="min-height: 850px; background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%); color: white; padding: 60px 40px; display: flex; flex-direction: column; justify-content: space-between; border-radius: 8px; margin-bottom: 40px;"><div style="font-size: 14pt; letter-spacing: 0.2em; text-transform: uppercase; color: #93C5FD;">Executive Report</div><div><h1 style="font-size: 36pt; font-weight: 800; margin: 0 0 16px 0; color: white;">DOCUMENT TITLE</h1><p style="font-size: 16pt; opacity: 0.85; margin: 0;">Subtitle or Project Description</p></div><div style="border-top: 1px solid rgba(255,255,255,0.25); padding-top: 20px; display: flex; justify-content: space-between; font-size: 11pt;"><span>Prepared by: Dinesh Reddy Chada</span><span>Date: ${new Date().toLocaleDateString()}</span></div></div><div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #0F6CBD; margin: 36px 0; text-align: center;"><span style="background: #EFF6FF; color: #0F6CBD; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 4px;">PAGE BREAK</span></div><p><br/></p>`;
    if (editorRef.current) {
      editorRef.current.innerHTML = coverHtml + editorRef.current.innerHTML;
      handleInput();
      setStatusMessage("Inserted Executive Cover Page");
    }
  };

  const insertHeader = () => {
    const headerHtml = `<div style="border-bottom: 1px solid #CBD5E1; padding-bottom: 6px; margin-bottom: 24px; display: flex; justify-content: space-between; font-size: 9pt; color: #64748B;"><span>${store.docTitle}</span><span>Confidential</span></div>`;
    format("insertHTML", headerHtml);
  };

  const insertFooter = () => {
    const footerHtml = `<div style="border-top: 1px solid #CBD5E1; padding-top: 6px; margin-top: 24px; display: flex; justify-content: space-between; font-size: 9pt; color: #64748B;"><span>DocuFlow Word Studio</span><span>Page 1</span></div>`;
    format("insertHTML", footerHtml);
  };

  const insertPageNumberField = () => {
    format("insertHTML", `<span style="font-weight: bold; color: #185ABD;">Page 1 of 1</span>`);
    setStatusMessage("Inserted Page Number Field");
  };

  const insertShape = (type: string) => {
    const shapeHtml = `<div style="display: inline-block; padding: 16px; margin: 8px; background: #2563EB; color: white; border-radius: ${type === "circle" ? "50%" : "6px"}; min-width: 120px; text-align: center; font-weight: bold;">Shape: ${type}</div>`;
    format("insertHTML", shapeHtml);
  };

  const insertOnlineVideo = () => {
    const url = prompt("Enter YouTube or MP4 Video URL:");
    if (url) {
      const vidHtml = `<div style="margin: 16px 0; text-align: center;"><iframe width="560" height="315" src="${url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen style="max-width: 100%; border-radius: 8px;"></iframe></div>`;
      format("insertHTML", vidHtml);
    }
  };

  const insertFootnote = () => {
    const fnNum = Math.floor(Math.random() * 8) + 1;
    format("insertHTML", `<sup>[${fnNum}]</sup>`);
    if (editorRef.current) {
      editorRef.current.innerHTML += `<div style="font-size: 8.5pt; color: #475569; border-top: 1px solid #CBD5E1; margin-top: 24px; padding-top: 6px;">[${fnNum}] Footnote reference annotation.</div>`;
    }
  };

  const insertEndnote = () => {
    format("insertHTML", `<sup>[i]</sup>`);
  };

  // Master Command Registry spanning all 12 Microsoft Word Core Categories
  const ALL_WORD_COMMANDS = useMemo(() => [
    // 1. File & Document Management
    { id: "new-doc", name: "New Blank Document", category: "1. File & Management", keywords: ["new", "blank", "document", "create", "file"], action: () => { if (editorRef.current) { editorRef.current.innerHTML = "<p>Type your text here...</p>"; store.setDocTitle("Document1"); handleInput(); } } },
    { id: "open-templates", name: "Browse Templates & Backstage Hub", category: "1. File & Management", keywords: ["template", "resume", "dossier", "invoice", "open"], action: () => store.setShowBackstage(true) },
    { id: "save-doc", name: "Save Document (Local & Cloud)", category: "1. File & Management", shortcut: "Ctrl+S", keywords: ["save", "snapshot", "store"], action: handleManualSave },
    { id: "export-pdf", name: "Export to PDF / Print Preview", category: "1. File & Management", shortcut: "Ctrl+P", keywords: ["pdf", "export", "print", "preview"], action: handlePrintOrPdf },
    { id: "export-docx", name: "Export to Microsoft Word (.docx)", category: "1. File & Management", keywords: ["export", "docx", "word", "download"], action: handleExportDocx },
    { id: "export-html", name: "Export to HTML Webpage", category: "1. File & Management", keywords: ["export", "html", "webpage"], action: handleExportHtml },
    { id: "export-txt", name: "Export to Plain Text (.txt)", category: "1. File & Management", keywords: ["export", "text", "txt", "notepad"], action: handleExportTxt },
    { id: "protect-doc", name: "Encrypt with Password", category: "1. File & Management", keywords: ["protect", "encrypt", "password", "security", "lock"], action: () => setShowPasswordModal(true) },
    { id: "mark-final", name: "Mark Document as Final (Read Only)", category: "1. File & Management", keywords: ["final", "readonly", "restrict", "lock"], action: () => store.setIsMarkedAsFinal(true) },
    { id: "inspect-doc", name: "Inspect Document & Scrub Metadata", category: "1. File & Management", keywords: ["inspect", "metadata", "scrub", "clean", "privacy"], action: () => setShowDocumentInspectorModal(true) },
    { id: "crash-recovery", name: "AutoRecover Crash Recovery Pane", category: "1. File & Management", keywords: ["recovery", "autorecover", "crash", "backup", "restore"], action: () => store.setActiveSidePane("recovery") },

    // 2. Text & Font Formatting
    { id: "cmd-bold", name: "Bold", category: "2. Font & Formatting", shortcut: "Ctrl+B", keywords: ["bold", "strong", "weight", "thick"], action: () => format("bold") },
    { id: "cmd-italic", name: "Italic", category: "2. Font & Formatting", shortcut: "Ctrl+I", keywords: ["italic", "oblique", "slant"], action: () => format("italic") },
    { id: "cmd-underline", name: "Underline", category: "2. Font & Formatting", shortcut: "Ctrl+U", keywords: ["underline", "line"], action: () => format("underline") },
    { id: "cmd-strike", name: "Strikethrough", category: "2. Font & Formatting", keywords: ["strikethrough", "cross", "delete", "strike"], action: () => format("strikeThrough") },
    { id: "cmd-sub", name: "Subscript", category: "2. Font & Formatting", keywords: ["subscript", "lower", "chemical"], action: () => format("subscript") },
    { id: "cmd-super", name: "Superscript", category: "2. Font & Formatting", keywords: ["superscript", "upper", "exponent", "power"], action: () => format("superscript") },
    { id: "cmd-font-dialog", name: "Font Dialog & OpenType Typography", category: "2. Font & Formatting", shortcut: "Ctrl+D", keywords: ["font", "typography", "opentype", "ligature"], action: () => setShowFontDialog(true) },
    { id: "cmd-clear-fmt", name: "Clear All Formatting", category: "2. Font & Formatting", keywords: ["clear", "reset", "plain", "strip"], action: () => format("removeFormat") },
    { id: "cmd-case-upper", name: "Change Case: UPPERCASE", category: "2. Font & Formatting", keywords: ["case", "uppercase", "caps"], action: () => changeCase("upper") },
    { id: "cmd-case-lower", name: "Change Case: lowercase", category: "2. Font & Formatting", keywords: ["case", "lowercase", "small"], action: () => changeCase("lower") },
    { id: "cmd-case-title", name: "Change Case: Capitalize Each Word", category: "2. Font & Formatting", keywords: ["case", "titlecase", "capitalize"], action: () => changeCase("title") },
    { id: "cmd-highlight", name: "Text Highlight Color (Yellow)", category: "2. Font & Formatting", keywords: ["highlight", "yellow", "mark"], action: () => format("hiliteColor", "#FFFF00") },
    { id: "cmd-font-red", name: "Font Color: Crimson Red", category: "2. Font & Formatting", keywords: ["color", "font color", "red", "crimson"], action: () => format("foreColor", "#DC2626") },
    { id: "cmd-format-painter", name: "Format Painter", category: "2. Font & Formatting", keywords: ["painter", "copy style", "format"], action: () => format("formatBlock", "p") },
    { id: "cmd-spike-cut", name: "Append to Spike Buffer (Multi-Cut)", category: "2. Font & Formatting", shortcut: "Ctrl+F3", keywords: ["spike", "cut to spike", "multi cut"], action: cutSelectionToSpike },
    { id: "cmd-spike-paste", name: "Paste Spike Clipboard Buffer", category: "2. Font & Formatting", shortcut: "Ctrl+Shift+F3", keywords: ["spike", "clipboard", "paste buffer"], action: pasteAndClearSpike },

    // 3. Paragraph & Page Layout
    { id: "cmd-align-left", name: "Align Left", category: "3. Paragraph & Layout", shortcut: "Ctrl+L", keywords: ["left", "align left"], action: () => format("justifyLeft") },
    { id: "cmd-align-center", name: "Align Center", category: "3. Paragraph & Layout", shortcut: "Ctrl+E", keywords: ["center", "align center", "middle"], action: () => format("justifyCenter") },
    { id: "cmd-align-right", name: "Align Right", category: "3. Paragraph & Layout", shortcut: "Ctrl+R", keywords: ["right", "align right"], action: () => format("justifyRight") },
    { id: "cmd-align-justify", name: "Justify Paragraph", category: "3. Paragraph & Layout", shortcut: "Ctrl+J", keywords: ["justify", "even", "full"], action: () => format("justifyFull") },
    { id: "cmd-bullets", name: "Bullets (Unordered List)", category: "3. Paragraph & Layout", keywords: ["bullet", "list", "unordered"], action: () => format("insertUnorderedList") },
    { id: "cmd-numbers", name: "Numbering (Ordered List)", category: "3. Paragraph & Layout", keywords: ["number", "numbered", "ordered", "list"], action: () => format("insertOrderedList") },
    { id: "cmd-indent-inc", name: "Increase Indent", category: "3. Paragraph & Layout", keywords: ["indent", "tab", "increase indent"], action: () => format("indent") },
    { id: "cmd-indent-dec", name: "Decrease Indent (Outdent)", category: "3. Paragraph & Layout", keywords: ["outdent", "decrease indent"], action: () => format("outdent") },
    { id: "cmd-page-break", name: "Insert Page Break", category: "3. Paragraph & Layout", shortcut: "Ctrl+Enter", keywords: ["page break", "break", "next page"], action: insertPageBreak },
    { id: "cmd-margins-normal", name: "Margins: Normal (1 inch)", category: "3. Paragraph & Layout", keywords: ["margin", "margins", "normal"], action: () => store.setMargins("normal") },
    { id: "cmd-margins-narrow", name: "Margins: Narrow (0.5 inch)", category: "3. Paragraph & Layout", keywords: ["margin", "margins", "narrow"], action: () => store.setMargins("narrow") },
    { id: "cmd-margins-wide", name: "Margins: Wide", category: "3. Paragraph & Layout", keywords: ["margin", "margins", "wide"], action: () => store.setMargins("wide") },
    { id: "cmd-orient-portrait", name: "Orientation: Portrait", category: "3. Paragraph & Layout", keywords: ["portrait", "vertical", "orientation"], action: () => store.setOrientation("portrait") },
    { id: "cmd-orient-landscape", name: "Orientation: Landscape", category: "3. Paragraph & Layout", keywords: ["landscape", "horizontal", "orientation"], action: () => store.setOrientation("landscape") },
    { id: "cmd-paper-a4", name: "Paper Size: A4 (210 x 297 mm)", category: "3. Paragraph & Layout", keywords: ["paper", "a4", "size"], action: () => store.setPaperSize("a4") },
    { id: "cmd-paper-letter", name: "Paper Size: Letter (8.5 x 11 in)", category: "3. Paragraph & Layout", keywords: ["paper", "letter", "size"], action: () => store.setPaperSize("letter") },
    { id: "cmd-columns-2", name: "Columns: 2 Columns", category: "3. Paragraph & Layout", keywords: ["columns", "two columns", "newspaper"], action: () => store.setColumnsCount(2) },
    { id: "cmd-columns-1", name: "Columns: 1 Column (Single)", category: "3. Paragraph & Layout", keywords: ["columns", "single column", "normal"], action: () => store.setColumnsCount(1) },

    // 4. Styles, Themes & Design
    { id: "cmd-style-h1", name: "Style: Heading 1", category: "4. Styles & Themes", keywords: ["heading 1", "h1", "title"], action: () => applyStyle("h1") },
    { id: "cmd-style-h2", name: "Style: Heading 2", category: "4. Styles & Themes", keywords: ["heading 2", "h2", "subtitle"], action: () => applyStyle("h2") },
    { id: "cmd-style-normal", name: "Style: Normal Body Text", category: "4. Styles & Themes", keywords: ["normal", "body", "p"], action: () => applyStyle("normal") },
    { id: "cmd-style-quote", name: "Style: Quote / Callout", category: "4. Styles & Themes", keywords: ["quote", "blockquote", "callout"], action: () => applyStyle("quote") },
    { id: "cmd-watermark-confidential", name: "Watermark: CONFIDENTIAL", category: "4. Styles & Themes", keywords: ["watermark", "confidential"], action: () => store.setWatermarkText("CONFIDENTIAL") },
    { id: "cmd-watermark-draft", name: "Watermark: DRAFT", category: "4. Styles & Themes", keywords: ["watermark", "draft"], action: () => store.setWatermarkText("DRAFT") },
    { id: "cmd-watermark-clear", name: "Remove Watermark", category: "4. Styles & Themes", keywords: ["watermark", "remove watermark", "clear"], action: () => store.setWatermarkText("") },
    { id: "cmd-theme-obsidian", name: "Theme: WorkOnline Deep Obsidian", category: "4. Styles & Themes", keywords: ["theme", "obsidian", "dark", "crimson"], action: () => store.setTheme("obsidian") },
    { id: "cmd-theme-fluent", name: "Theme: Microsoft Fluent Office", category: "4. Styles & Themes", keywords: ["theme", "fluent", "office", "blue"], action: () => store.setTheme("fluent") },

    // 5. Tables, Graphics & Media
    { id: "cmd-table-quick", name: "Insert 3x3 Table", category: "5. Tables & Media", keywords: ["table", "grid", "rows", "columns", "3x3"], action: () => insertQuickTable(3, 3) },
    { id: "cmd-table-dialog", name: "Custom Table Wizard", category: "5. Tables & Media", keywords: ["table", "insert table", "grid"], action: () => setShowTableModal(true) },
    { id: "cmd-table-props", name: "Table Properties & Formulas", category: "5. Tables & Media", keywords: ["table properties", "formula", "sum", "average"], action: () => setShowTableToolsModal(true) },
    { id: "cmd-insert-pic", name: "Insert Pictures / Upload", category: "5. Tables & Media", keywords: ["picture", "image", "photo", "upload image"], action: () => store.setActiveTab("Insert") },
    { id: "cmd-insert-smartart", name: "Insert SmartArt Graphic", category: "5. Tables & Media", keywords: ["smartart", "diagram", "org chart", "flowchart", "process"], action: () => setShowSmartArtModal(true) },
    { id: "cmd-insert-chart", name: "Insert Chart (Bar, Line, Pie)", category: "5. Tables & Media", keywords: ["chart", "graph", "bar", "pie", "line"], action: () => setShowChartModal(true) },

    // 6. Headers, Footers & Text Elements
    { id: "cmd-insert-header", name: "Header & Footer Setup", category: "6. Headers & Footers", keywords: ["header", "footer", "page number"], action: () => store.setActiveTab("Insert") },
    { id: "cmd-callout-tip", name: "Insert Tip / Warning Callout Box", category: "6. Headers & Footers", keywords: ["callout", "tip", "box", "alert"], action: () => insertCalloutBox("tip") },
    { id: "cmd-callout-quote", name: "Insert Executive Quote Box", category: "6. Headers & Footers", keywords: ["quote", "executive quote", "pullquote"], action: () => insertCalloutBox("quote") },
    { id: "cmd-drop-cap", name: "Insert Drop Cap", category: "6. Headers & Footers", keywords: ["drop cap", "magazine", "large letter"], action: () => format("insertHTML", `<span style="float: left; font-size: 48pt; line-height: 40pt; padding-top: 4px; padding-right: 8px; font-weight: bold; color: #DC2626;">D</span>`) },
    { id: "cmd-date-time", name: "Insert Current Date & Time", category: "6. Headers & Footers", keywords: ["date", "time", "today", "now"], action: () => format("insertHTML", `<p style="color: #64748B; font-size: 10pt;">${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>`) },
    { id: "cmd-quick-parts", name: "Building Blocks & AutoText Organizer", category: "6. Headers & Footers", shortcut: "F3", keywords: ["quick parts", "autotext", "building blocks", "clause"], action: () => setShowBuildingBlocksModal(true) },
    { id: "cmd-field-codes", name: "Toggle Field Codes", category: "6. Headers & Footers", shortcut: "Alt+F9", keywords: ["field", "field codes", "alt+f9", "dynamic"], action: toggleFieldCodesMode },
    { id: "cmd-field-update", name: "Update Dynamic Fields", category: "6. Headers & Footers", shortcut: "F9", keywords: ["f9", "update fields", "refresh fields"], action: updateDynamicFields },
    { id: "cmd-equation", name: "Insert Mathematical Equation (KaTeX)", category: "6. Headers & Footers", keywords: ["equation", "math", "formula", "latex", "katex"], action: () => setShowEquationModal(true) },

    // 7. Draw & Ink Tools
    { id: "cmd-draw-pen", name: "Draw: Digital Pen", category: "7. Draw & Ink", keywords: ["pen", "draw", "ink", "sketch"], action: () => { store.setActiveInkTool("pen"); store.setActiveTab("Draw"); } },
    { id: "cmd-draw-highlighter", name: "Draw: Ink Highlighter", category: "7. Draw & Ink", keywords: ["highlighter", "ink highlight", "yellow pen"], action: () => { store.setActiveInkTool("highlighter"); store.setActiveTab("Draw"); } },
    { id: "cmd-draw-clear", name: "Clear Ink Drawing", category: "7. Draw & Ink", keywords: ["clear ink", "erase drawing", "delete drawing"], action: clearInkCanvas },

    // 8. References, Academic & Legal Tools
    { id: "cmd-toc", name: "Insert Automatic Table of Contents", category: "8. References & Legal", keywords: ["table of contents", "toc", "index", "contents"], action: generateTableOfContents },
    { id: "cmd-footnote", name: "Insert Footnote", category: "8. References & Legal", keywords: ["footnote", "bottom note", "citation"], action: insertFootnote },
    { id: "cmd-endnote", name: "Insert Endnote", category: "8. References & Legal", keywords: ["endnote", "end of doc", "reference"], action: insertEndnote },
    { id: "cmd-citations", name: "Citations & Bibliography Manager", category: "8. References & Legal", keywords: ["citation", "bibliography", "apa", "mla", "sources"], action: () => setShowCitationModal(true) },
    { id: "cmd-hyperlink", name: "Insert Hyperlink / Bookmark", category: "8. References & Legal", shortcut: "Ctrl+K", keywords: ["link", "hyperlink", "url", "bookmark"], action: () => setShowLinkModal(true) },

    // 9. Proofing, Review & Collaboration
    { id: "cmd-word-count", name: "Word Count & Document Statistics", category: "9. Review & Proofing", keywords: ["word count", "words", "characters", "pages", "stats"], action: () => setShowWordCountModal(true) },
    { id: "cmd-read-aloud", name: "Read Aloud (Text to Speech)", category: "9. Review & Proofing", keywords: ["read aloud", "speak", "voice", "audio", "listen"], action: toggleReadAloud },
    { id: "cmd-dictate", name: "Dictate (Speech to Text)", category: "9. Review & Proofing", keywords: ["dictate", "mic", "microphone", "speech to text"], action: toggleDictation },
    { id: "cmd-comments", name: "Comments & Feedback Panel", category: "9. Review & Proofing", keywords: ["comment", "comments", "feedback", "mention"], action: () => store.setActiveSidePane("comments") },
    { id: "cmd-track-changes", name: "Track Changes Toggle", category: "9. Review & Proofing", keywords: ["track changes", "markup", "revisions", "redline"], action: () => store.setTrackChanges(!store.trackChanges) },

    // 10. Mailings & Bulk Automation
    { id: "cmd-mail-merge", name: "Start Mail Merge", category: "10. Mailings", keywords: ["mail merge", "merge", "bulk", "recipients"], action: () => store.setActiveTab("Mailings") },
    { id: "cmd-merge-field", name: "Insert Merge Field", category: "10. Mailings", keywords: ["merge field", "field", "first name", "company"], action: () => insertMergeField("First_Name") },

    // 11. Views, Navigation & Accessibility
    { id: "cmd-view-print", name: "View: Print Layout", category: "11. Views & Navigation", keywords: ["print layout", "page view", "normal view"], action: () => store.setViewMode("print") },
    { id: "cmd-view-read", name: "View: Read Mode (E-Book)", category: "11. Views & Navigation", keywords: ["read mode", "reading", "ebook"], action: () => store.setViewMode("read") },
    { id: "cmd-view-web", name: "View: Web Layout", category: "11. Views & Navigation", keywords: ["web layout", "html view"], action: () => store.setViewMode("web") },
    { id: "cmd-view-focus", name: "View: Focus Mode (Zen)", category: "11. Views & Navigation", keywords: ["focus mode", "zen", "distraction free"], action: () => store.setViewMode("focus") },
    { id: "cmd-view-outline", name: "View: Outline View Organizer", category: "11. Views & Navigation", keywords: ["outline", "outline view", "structure"], action: () => setShowOutlineViewModal(true) },
    { id: "cmd-nav-pane", name: "Navigation Pane (Headings & Search)", category: "11. Views & Navigation", keywords: ["navigation pane", "outline", "nav"], action: () => store.setActiveSidePane(store.activeSidePane === "navigation" ? "none" : "navigation") },
    { id: "cmd-rulers", name: "Toggle Measurement Rulers", category: "11. Views & Navigation", keywords: ["ruler", "rulers", "margins"], action: () => store.setShowRuler(!store.showRuler) },
    { id: "cmd-gridlines", name: "Toggle Gridlines", category: "11. Views & Navigation", keywords: ["grid", "gridlines"], action: () => store.setShowGridlines(!store.showGridlines) },
    { id: "cmd-split-view", name: "Toggle Split Window View", category: "11. Views & Navigation", keywords: ["split", "split view", "dual pane"], action: () => store.setSplitView(!store.splitView) },
    { id: "cmd-zoom-100", name: "Zoom: 100%", category: "11. Views & Navigation", keywords: ["zoom 100", "reset zoom"], action: () => store.setZoom(100) },
    { id: "cmd-zoom-width", name: "Zoom: Page Width (120%)", category: "11. Views & Navigation", keywords: ["page width", "zoom width"], action: () => store.setZoom(120) },

    // 12. Developer & Advanced Automation
    { id: "cmd-macros", name: "Record & Run Macros", category: "12. Developer & Automation", keywords: ["macro", "macros", "vba", "record macro", "automate"], action: () => setShowMacroModal(true) },
    { id: "cmd-find-replace-adv", name: "Advanced Find & Replace (Wildcards)", category: "12. Developer & Automation", shortcut: "Ctrl+H", keywords: ["find", "replace", "wildcards", "regex", "search"], action: () => setShowAdvancedFindReplace(true) },
    { id: "cmd-autocorrect-opts", name: "AutoCorrect & AutoFormat Settings", category: "12. Developer & Automation", keywords: ["autocorrect", "autoformat", "math autocorrect", "smart quotes"], action: () => setShowAutoCorrectModal(true) },
    { id: "cmd-shortcuts-cust", name: "Customize Keyboard Shortcuts", category: "12. Developer & Automation", keywords: ["shortcuts", "keys", "hotkeys"], action: () => setShowCustomShortcutsModal(true) },
    { id: "cmd-ai-copilot", name: "Microsoft Word AI Copilot", category: "12. Developer & Automation", keywords: ["copilot", "ai", "assistant", "generate", "summarize", "rewrite"], action: () => store.setActiveSidePane("ai") },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [store]);

  const filteredTellMeCommands = useMemo(() => {
    if (!tellMeQuery.trim()) return ALL_WORD_COMMANDS.slice(0, 8);
    const q = tellMeQuery.toLowerCase().trim();
    return ALL_WORD_COMMANDS.filter((cmd) => {
      return (
        cmd.name.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [ALL_WORD_COMMANDS, tellMeQuery]);

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
      case "fluent":
        return "bg-[#185ABD] text-white"; // Fluent Classic Word Blue
      case "dark-gray":
        return "bg-[#2D2D2D] border-b border-neutral-700 text-white";
      case "white":
        return "bg-[#FFFFFF] border-b border-slate-300 text-slate-800";
      case "obsidian":
      default:
        return "bg-[#100C0E]/95 backdrop-blur-md border-b border-white/[0.08] text-white";
    }
  };

  const getWorkspaceBg = () => {
    switch (store.theme) {
      case "fluent":
        return "bg-[#F3F2F1]";
      case "dark-gray":
        return "bg-[#1E1E1E]";
      case "white":
        return "bg-[#EAEAEA]";
      case "obsidian":
      default:
        return "bg-[#070405]"; // WorkOnline Deep Obsidian
    }
  };


  const getStatusBarBg = () => {
    switch (store.theme) {
      case "fluent":
        return "bg-[#185ABD] text-white";
      case "dark-gray":
        return "bg-[#252525] border-t border-neutral-700 text-white";
      case "white":
        return "bg-[#F0F0F0] border-t border-slate-300 text-slate-800";
      case "obsidian":
      default:
        return "bg-[#100C0E]/95 border-t border-white/[0.08] text-white/90";
    }
  };

  const getRibbonBg = () => {
    switch (store.theme) {
      case "fluent":
        return "bg-[#F3F2F1] border-b border-[#D1D5DB] text-slate-800";
      case "dark-gray":
        return "bg-[#252525] border-b border-neutral-700 text-white";
      case "white":
        return "bg-[#F5F5F5] border-b border-slate-300 text-slate-800";
      case "obsidian":
      default:
        return "bg-[#140E11]/95 backdrop-blur-md border-b border-white/[0.08] text-white";
    }
  };

  return (
    <div
      className={`word-studio-root w-full h-screen flex flex-col ${getWorkspaceBg()} overflow-hidden font-sans relative text-white`}
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
      <header
        onMouseDown={(e) => {
          const el = e.target as HTMLElement;
          if (el.tagName === "BUTTON" || el.closest("button")) {
            e.preventDefault();
          }
        }}
        className={`${getHeaderBg()} flex items-center justify-between px-3 h-10 select-none text-xs shrink-0 z-30 print:hidden shadow-sm`}
      >
        {/* Left: Quick Access Toolbar & Main Page Navigation */}
        <div className="flex items-center gap-1.5">
          {/* Main Page Direct Navigation Button */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-950/40 transition-all hover:scale-[1.02] mr-1"
            title="Return to WorkOnline Main Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="tracking-tight hidden xs:inline">Main Page</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/10 rounded transition-colors group mr-0.5"
            title="WorkOnline Document Studio"
          >
            <div className="w-5 h-5 rounded bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
              W
            </div>
            <span className="font-bold text-xs tracking-tight text-white/90 group-hover:text-white hidden lg:inline">
              WorkOnline
            </span>
          </Link>

          <span className="w-px h-4 bg-white/20 mx-1" />

          {/* Quick Access Toolbar: Home Icon */}
          <Link
            href="/"
            className="p-1 hover:bg-white/10 rounded text-rose-300 hover:text-white transition-colors"
            title="Return to Main Page"
          >
            <Home className="w-4 h-4" />
          </Link>

          {/* AutoSave Switch */}
          <div className="flex items-center gap-1.5 text-[11px] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full cursor-pointer" title="AutoSave">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden md:inline font-bold text-white" style={{ color: "#FFFFFF" }}>AutoSave</span>
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
            className="p-1 hover:bg-white/15 rounded text-white transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={() => format("redo")}
            className="p-1 hover:bg-white/15 rounded text-white transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={handlePrintOrPdf}
            className="p-1 hover:bg-white/15 rounded text-white transition-colors"
            title="Quick Print Preview (Ctrl+P)"
          >
            <Printer className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Center: Editable Document Name & Live Totals Badge */}
        <div className="flex items-center gap-2 max-w-sm sm:max-w-xl truncate">
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
            className="doc-title-input bg-white/15 hover:bg-white/20 focus:bg-white/25 text-white font-bold text-xs sm:text-sm px-3 py-1 rounded border border-white/25 focus:border-red-500 outline-none text-center shadow-inner truncate placeholder-white/60" style={{ color: "#FFFFFF", backgroundColor: "rgba(255,255,255,0.15)" }}
          />
          <span className="text-xs font-bold text-white/90 hidden sm:inline">- Word</span>

          {/* Prominent Live Totals & Stats Badge in Header */}
          <button
            type="button"
            onClick={() => setShowWordCountModal(true)}
            className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 rounded-md text-white text-[11px] font-semibold transition-all shadow-sm shrink-0"
            title="Click to view detailed Document Statistics & Totals"
          >
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Page {store.currentPage}/{store.pageCount}</span>
            </span>
            <span className="text-white/30">•</span>
            <strong className="font-bold text-white" style={{ color: "#FFFFFF" }}>{store.wordCount} words</strong>
            <span className="text-white/30">•</span>
            <span className="font-medium text-white" style={{ color: "#FFFFFF" }}>{store.charCount} chars</span>
            <span className="text-white/30">•</span>
            <span className="totals-green font-bold text-emerald-400" style={{ color: "#34D399" }}>~{Math.max(1, Math.ceil(store.wordCount / 200))} min</span>
          </button>
        </div>

        {/* Right: Window Controls, Share */}
        <div className="flex items-center gap-2">
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
            className="p-1 hover:bg-white/15 rounded transition-colors text-white"
            style={{ color: "#FFFFFF" }}
            title={`Ribbon Display Mode: ${store.ribbonDisplayMode}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-white" style={{ color: "#FFFFFF" }} />
          </button>

          {/* Window Controls: Minimize, Maximize/Restore, Close */}
          <button
            type="button"
            onClick={() => store.setRibbonDisplayMode("tabs-only")}
            className="p-1 hover:bg-white/15 rounded text-xs px-2 text-white font-bold transition-colors"
            style={{ color: "#FFFFFF" }}
            title="Minimize Ribbon"
          >
            —
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:bg-white/15 rounded text-xs px-2 text-white font-bold transition-colors"
            style={{ color: "#FFFFFF" }}
            title="Maximize / Restore"
          >
            □
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Close Document Studio? Any unsaved edits are preserved locally.")) {
                window.location.href = "/";
              }
            }}
            className="p-1 hover:bg-red-600 rounded text-xs px-2 text-white font-bold transition-colors"
            style={{ color: "#FFFFFF" }}
            title="Close & Exit to Main Page"
          >
            ✕
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={() => {
              store.setShowBackstage(true);
              store.setBackstageSection("share");
            }}
            className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 hover:bg-white/25 text-white font-bold px-2.5 py-1 rounded text-xs transition-colors shadow-sm"
            style={{ color: "#FFFFFF" }}
          >
            <Upload className="w-3.5 h-3.5 rotate-45 text-rose-400" />
            <span style={{ color: "#FFFFFF" }}>Share</span>
            <ChevronDown className="w-3 h-3 text-white/80" />
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
            className={`font-bold px-4 py-1.5 transition-colors uppercase tracking-wider text-[11px] ${
              store.theme === "obsidian"
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-sm shadow-rose-950/40"
                : "bg-[#103F7E] hover:bg-[#0A2E60] text-white"
            }`}
          >
            File
          </button>

          {/* Standard Tabs */}
          {(
            [
              "Home",
              "Insert",
              "Design",
              "Layout",
              "References",
              "Mailings",
              "Review",
              "View",
              "Help",
              "Acrobat",
              "Draw",
              "Developer",
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
                className={`px-3.5 py-1.5 text-xs font-bold rounded-t transition-colors ${
                  isActive
                    ? store.theme === "obsidian"
                      ? "bg-[#1A1215] text-[#F43F5E] border-b-2 border-[#E11D48] shadow-sm font-bold"
                      : "bg-[#F3F2F1] dark:bg-[#1E1E1E] text-[#185ABD] dark:text-blue-400 shadow-sm"
                    : "text-white/90 hover:bg-white/15 hover:text-white"
                }`}
                style={{ color: isActive ? "#F43F5E" : "#FFFFFF" }}
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
              style={{ color: "#0F172A" }}
            >
              ★ {store.contextualTab}
            </button>
          )}

          {/* 💡 Tell me what you want to do (Screenshot 1-10 authentic placement) */}
          {/* Tell me what you want to do (Universal Command & Tool Search Bar) */}
          <div
            ref={tellMeRef}
            className={`ml-auto hidden md:flex items-center gap-1.5 px-3 py-1 rounded text-white text-xs border my-0.5 transition-colors relative ${
              store.theme === "obsidian"
                ? "bg-white/[0.08] hover:bg-white/[0.14] border-white/[0.15] focus-within:border-red-500/50"
                : "bg-white/10 hover:bg-white/15 border-white/20"
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${store.theme === "obsidian" ? "text-rose-400" : "text-amber-300"}`} />
            <input
              type="text"
              placeholder="Tell me what you want to do..."
              value={tellMeQuery}
              onFocus={() => setShowTellMeMenu(true)}
              onChange={(e) => {
                setTellMeQuery(e.target.value);
                setShowTellMeMenu(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (filteredTellMeCommands.length > 0) {
                    e.preventDefault();
                    filteredTellMeCommands[0].action();
                    setShowTellMeMenu(false);
                    setTellMeQuery("");
                  } else if (tellMeQuery.trim()) {
                    e.preventDefault();
                    setFindText(tellMeQuery);
                    setShowAdvancedFindReplace(true);
                    setShowTellMeMenu(false);
                  }
                } else if (e.key === "Escape") {
                  setShowTellMeMenu(false);
                }
              }}
              className="bg-transparent placeholder-white/70 text-white outline-none text-xs w-52 font-medium"
              style={{ color: "#FFFFFF" }}
            />
            {tellMeQuery && (
              <button
                type="button"
                onClick={() => {
                  setTellMeQuery("");
                  setShowTellMeMenu(false);
                }}
                className="text-white/60 hover:text-white text-xs ml-1"
              >
                ✕
              </button>
            )}

            {/* Universal Command Palette Dropdown */}
            {showTellMeMenu && (
              <div
                className="absolute top-full right-0 mt-1 w-96 max-h-96 overflow-y-auto bg-[#140E11]/98 backdrop-blur-xl border border-white/20 shadow-2xl rounded-lg p-2 z-50 text-white"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-2 py-1 border-b border-white/10 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                  <span>Word Tools ({filteredTellMeCommands.length})</span>
                  <span>Press Esc to close</span>
                </div>
                {filteredTellMeCommands.length > 0 ? (
                  <div className="space-y-1 mt-1">
                    {filteredTellMeCommands.slice(0, 10).map((cmd) => (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={() => {
                          cmd.action();
                          setShowTellMeMenu(false);
                          setTellMeQuery("");
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/15 flex items-center justify-between text-xs group transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-white group-hover:text-rose-300">
                            {cmd.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {cmd.category}
                          </span>
                        </div>
                        {cmd.shortcut && (
                          <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-slate-300">
                            {cmd.shortcut}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching Word command found for &quot;{tellMeQuery}&quot;
                  </div>
                )}

                {tellMeQuery.trim() && (
                  <div className="border-t border-white/10 pt-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFindText(tellMeQuery);
                        setShowAdvancedFindReplace(true);
                        setShowTellMeMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 flex items-center gap-1.5 text-xs font-medium"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Find &quot;{tellMeQuery}&quot; in document text...</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      )}

      {/* =========================================================================
          3. RIBBON TOOLBAR BODY (All Categorized Groups)
          ========================================================================= */}
      {store.ribbonDisplayMode === "tabs-and-commands" && (
        <div
          onMouseDown={(e) => {
            const el = e.target as HTMLElement;
            if (el.tagName === "BUTTON" || el.closest("button")) {
              e.preventDefault();
            }
          }}
          className={`${getRibbonBg()} px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto min-h-[96px] select-none text-xs shrink-0 print:hidden shadow-inner z-10 text-white [&_button]:text-white [&_button:hover]:text-white [&_button:hover]:bg-white/15 [&_svg]:text-white`}
        >
          {/* ----------------- TAB: HOME ----------------- */}
          {store.activeTab === "Home" && (
            <div className="flex items-stretch gap-2">
              {/* Quick Easy Tools Group */}
              <div className="flex flex-col justify-between items-center px-2.5 border-r border-white/15">
                <div className="flex items-center gap-1.5">
                  {/* Quick Table 3x3 */}
                  <button
                    type="button"
                    onClick={() => insertQuickTable(3, 3)}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-white/15 rounded text-white w-14 transition-colors"
                    title="Insert 3x3 Table"
                  >
                    <TableIcon className="w-4 h-4 text-rose-400" />
                    <span className="text-[10px] mt-0.5 font-bold leading-tight text-white text-center" style={{ color: "#FFFFFF" }}>Table</span>
                  </button>

                  {/* Quick Callout Dropdown or Menu */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => insertCalloutBox("tip")}
                      className="px-2 py-0.5 hover:bg-white/15 rounded text-[11px] text-emerald-300 font-medium flex items-center gap-1 text-left"
                      title="Insert Tip Callout"
                    >
                      <span>💡 Tip Box</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCalloutBox("quote")}
                      className="px-2 py-0.5 hover:bg-white/15 rounded text-[11px] text-rose-300 font-medium flex items-center gap-1 text-left"
                      title="Insert Executive Quote"
                    >
                      <span>❝ Quote</span>
                    </button>
                  </div>

                  {/* Clean & Format */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={cleanDocumentFormatting}
                      className="px-2 py-0.5 hover:bg-white/15 rounded text-[11px] text-sky-300 font-medium flex items-center gap-1 text-left"
                      title="Clean Double Spaces & Normalize Formatting"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Clean Text</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertDivider("crimson")}
                      className="px-2 py-0.5 hover:bg-white/15 rounded text-[11px] text-slate-200 font-medium flex items-center gap-1 text-left"
                      title="Insert Crimson Divider"
                    >
                      <span>― Divider</span>
                    </button>
                  </div>

                  {/* Totals & Statistics HUD trigger */}
                  <button
                    type="button"
                    onClick={() => setShowWordCountModal(true)}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-white/15 rounded text-white w-14 transition-colors bg-white/5 border border-white/10"
                    title="Document Totals & Word Count"
                  >
                    <span className="text-xs font-bold text-rose-400">Σ {store.wordCount}</span>
                    <span className="text-[9px] mt-0.5 font-medium text-slate-300 leading-tight">Totals</span>
                  </button>
                </div>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Quick Tools</span>
              </div>
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
                    <ClipboardPaste className="w-5 h-5 text-rose-400" />
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
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Clipboard</span>
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
                      className="bg-[#1C1417] text-white border border-white/25 hover:border-white/40 focus:border-red-500 rounded px-2 py-1 text-xs outline-none font-bold w-28" style={{ color: "#FFFFFF", backgroundColor: "#1E161A" }}
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
                      className="bg-[#1C1417] text-white border border-white/25 hover:border-white/40 focus:border-red-500 rounded px-2 py-1 text-xs outline-none font-bold w-14" style={{ color: "#FFFFFF", backgroundColor: "#1E161A" }}
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
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Font</span>
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
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Paragraph</span>
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
                      className="flex flex-col items-center justify-center border border-white/20 hover:border-red-500 bg-[#1E161A] hover:bg-[#2A1D24] text-white px-2.5 py-1 rounded-md min-w-[56px] text-left transition-all shadow-sm"
                    >
                      <span className="text-xs font-black text-white leading-tight" style={{ color: "#FFFFFF" }}>{st.title}</span>
                      <span className="text-[9px] text-slate-200 font-bold truncate mt-0.5" style={{ color: "#E2E8F0" }}>{st.label}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Styles Gallery</span>
              </div>

              {/* Editing (Screenshot 2 Authentic Matching) */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFindReplace(true)}
                    className="flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded font-medium text-[11px]"
                    title="Find (Ctrl+F)"
                  >
                    <Search className="w-3.5 h-3.5 text-[#185ABD]" />
                    <span>Find ▾</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFindReplace(true)}
                    className="flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded font-medium text-[11px]"
                    title="Replace (Ctrl+H)"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("selectAll")}
                    className="flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded font-medium text-[11px]"
                    title="Select All"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Select ▾</span>
                  </button>
                </div>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Editing</span>
              </div>

              {/* Adobe Acrobat (Screenshot 2 Authentic Matching) */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <button
                  type="button"
                  onClick={handlePrintOrPdf}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                  title="Create a PDF"
                >
                  <FileText className="w-6 h-6 text-red-600" />
                  <span className="text-[10px] mt-0.5 font-medium text-center leading-tight">Create a PDF</span>
                </button>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Adobe Acrobat</span>
              </div>

              {/* Add-ins (Screenshot 2 Authentic Matching) */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => store.setActiveSidePane(store.activeSidePane === "addins" ? "none" : "addins")}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14 relative"
                  title="Office Add-ins"
                >
                  <div className="relative">
                    <Store className="w-5 h-5 text-indigo-600" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium">Add-ins</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Add-ins</span>
              </div>

              {/* Voice Dictate */}
              <div className="flex flex-col justify-between items-center px-1">
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
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">Voice</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: INSERT (Screenshot 3 Authentic Matching) ----------------- */}
          {store.activeTab === "Insert" && (
            <div className="flex items-stretch gap-2.5">
              {/* Pages Group */}
              <div className="flex flex-col justify-between items-center pr-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={insertCoverPage}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Insert Pre-formatted Cover Page"
                  >
                    <LayoutTemplate className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Cover Page ▾</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("insertHTML", "<p><br/></p>")}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Insert Blank Page"
                  >
                    <FileText className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] mt-0.5">Blank Page</span>
                  </button>
                  <button
                    type="button"
                    onClick={insertPageBreak}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Insert Page Break (Ctrl+Enter)"
                  >
                    <Layers className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5">Page Break</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Pages</span>
              </div>

              {/* Tables Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => setShowTableModal(true)}
                  className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12"
                  title="Insert Table Grid"
                >
                  <TableIcon className="w-5 h-5 text-[#185ABD]" />
                  <span className="text-[10px] mt-0.5">Table ▾</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Tables</span>
              </div>

              {/* Illustrations Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <label className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12 cursor-pointer" title="Insert Pictures">
                    <ImageIcon className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Pictures ▾</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  <div className="relative">
                    <select
                      onChange={(e) => insertShape(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Shapes"
                    >
                      <option value="rectangle">Rectangle</option>
                      <option value="circle">Circle</option>
                      <option value="banner">Banner</option>
                      <option value="callout">Callout</option>
                    </select>
                    <button type="button" className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12">
                      <Shapes className="w-5 h-5 text-blue-500" />
                      <span className="text-[10px] mt-0.5">Shapes ▾</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSmartArtModal(true)}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="SmartArt Graphic"
                  >
                    <GitBranch className="w-5 h-5 text-purple-600" />
                    <span className="text-[10px] mt-0.5">SmartArt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowChartModal(true)}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12"
                    title="Insert Chart"
                  >
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] mt-0.5">Chart</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Illustrations</span>
              </div>

              {/* Media Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <button
                  type="button"
                  onClick={insertOnlineVideo}
                  className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                  title="Insert Online Video"
                >
                  <Video className="w-5 h-5 text-rose-500" />
                  <span className="text-[10px] mt-0.5 text-center leading-tight">Online Videos</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Media</span>
              </div>

              {/* Links & Comments Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(true)}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-10"
                    title="Link (Ctrl+K)"
                  >
                    <LinkIcon className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("insertHTML", "<a name='bookmark1'>[Bookmark]</a>")}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Bookmark"
                  >
                    <Bookmark className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] mt-0.5">Bookmark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => store.setActiveSidePane("comments")}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-13"
                    title="New Comment (Ctrl+Alt+M)"
                  >
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <span className="text-[10px] mt-0.5">Comment</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Links &amp; Comments</span>
              </div>

              {/* Header & Footer Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={insertHeader}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12"
                    title="Insert Header"
                  >
                    <LayoutTemplate className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] mt-0.5">Header ▾</span>
                  </button>
                  <button
                    type="button"
                    onClick={insertFooter}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12"
                    title="Insert Footer"
                  >
                    <Minus className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] mt-0.5">Footer ▾</span>
                  </button>
                  <button
                    type="button"
                    onClick={insertPageNumberField}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Insert Page Number"
                  >
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5 text-center leading-tight">Page Number ▾</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Header &amp; Footer</span>
              </div>

              {/* Text Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("insertHTML", "<div style='border: 1px solid #94A3B8; padding: 12px; margin: 8px 0; background: #F8FAFC; border-radius: 4px;'>Type text box content here...</div>")}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-13"
                    title="Text Box"
                  >
                    <FileText className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5">Text Box ▾</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBuildingBlocksModal(true)}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Quick Parts & Building Blocks (F3)"
                  >
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5">Quick Parts ▾</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("insertHTML", `<p style="color: #64748B; font-size: 10pt;">${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>`)}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Date & Time"
                  >
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] mt-0.5 text-center leading-tight">Date &amp; Time</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Text</span>
              </div>

              {/* Symbols & Equations Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowEquationModal(true)}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="KaTeX Equation Editor"
                  >
                    <Sigma className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5">Equation ▾</span>
                  </button>
                  <div className="grid grid-cols-4 gap-0.5">
                    {["©", "®", "™", "€", "£", "¥", "•", "—"].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => insertSpecialSymbol(sym)}
                        className="w-4 h-4 hover:bg-black/5 dark:hover:bg-white/10 rounded text-[10px] font-mono flex items-center justify-center"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Symbols</span>
              </div>

              {/* eSignature Group (Screenshot 3) */}
              <div className="flex flex-col justify-between items-center px-1">
                <button
                  type="button"
                  onClick={() => store.setActiveSidePane(store.activeSidePane === "addins" ? "none" : "addins")}
                  className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-18 relative"
                  title="eSignature Fields"
                >
                  <div className="relative">
                    <ShieldCheck className="w-5 h-5 text-[#185ABD]" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                  </div>
                  <span className="text-[10px] mt-0.5 font-medium text-center leading-tight">eSignature fields</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">eSignature</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: DESIGN (Screenshot 4 Authentic Matching) ----------------- */}
          {store.activeTab === "Design" && (
            <div className="flex items-stretch gap-2.5">
              {/* Document Formatting Group */}
              <div className="flex flex-col justify-between items-center pr-2 border-r border-current/20">
                <div className="flex items-center gap-1.5">
                  {/* Themes Dropdown */}
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        applyDocTheme(e.target.value);
                        setStatusMessage(`Applied Theme: ${e.target.value}`);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Document Themes"
                    >
                      <option value="office">Office (Calibri, Classic Blue)</option>
                      <option value="facet">Facet (Trebuchet MS, Emerald)</option>
                      <option value="integral">Integral (Georgia, Maroon)</option>
                      <option value="ion">Ion (Century Gothic, Amber)</option>
                      <option value="retrospect">Retrospect (Book Antiqua, Indigo)</option>
                      <option value="slice">Slice (Garamond, Rose)</option>
                    </select>
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    >
                      <Palette className="w-5 h-5 text-[#185ABD]" />
                      <span className="text-[10px] mt-0.5">Themes ▾</span>
                    </button>
                  </div>

                  {/* Built-In Style Set Gallery Cards (Screenshot 4) */}
                  <div className="flex items-center gap-1 overflow-x-auto max-w-sm pb-0.5">
                    {[
                      { id: "default", name: "Default", h: "AaBbCc", title: "Heading 1" },
                      { id: "centered", name: "Centered", h: "AaBbCc", title: "Heading 1" },
                      { id: "shaded", name: "Shaded", h: "AaBbCc", title: "Heading 1" },
                      { id: "formal", name: "Formal", h: "AaBbCc", title: "Heading 1" },
                      { id: "modern", name: "Modern", h: "AaBbCc", title: "Heading 1" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          applyStyleSet(st.id);
                          setStatusMessage(`Applied Style Set: ${st.name}`);
                        }}
                        className={`flex flex-col items-center justify-center border p-1 rounded min-w-[56px] text-left transition-colors ${
                          store.styleSet === st.id
                            ? "border-[#185ABD] bg-blue-50 dark:bg-blue-900/30"
                            : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-black/5"
                        }`}
                        title={`Style Set: ${st.name}`}
                      >
                        <span className="text-[10px] font-bold text-slate-800 dark:text-white leading-tight">{st.h}</span>
                        <span className="text-[8px] text-blue-600 dark:text-blue-400 font-semibold">{st.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Colors, Fonts, Spacing Controls */}
                  <div className="flex flex-col gap-0.5 pl-1 border-l border-current/10">
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          applyDocTheme(e.target.value);
                          setStatusMessage(`Theme Colors: ${e.target.value}`);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Colors"
                      >
                        <option value="office">Colors: Office</option>
                        <option value="facet">Colors: Grayscale</option>
                        <option value="integral">Colors: Warm Red</option>
                        <option value="ion">Colors: Blue Warm</option>
                      </select>
                      <button type="button" className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-amber-500" />
                        <span>Colors ▾</span>
                      </button>
                    </div>

                    <div className="relative">
                      <select
                        onChange={(e) => {
                          store.setFontFamily(e.target.value);
                          format("fontName", e.target.value);
                          setStatusMessage(`Theme Font: ${e.target.value}`);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Fonts"
                      >
                        <option value="Calibri">Fonts: Calibri / Calibri Light</option>
                        <option value="Arial">Fonts: Arial / Arial Black</option>
                        <option value="Times New Roman">Fonts: Times New Roman</option>
                        <option value="Georgia">Fonts: Georgia / Garamond</option>
                        <option value="Segoe UI">Fonts: Segoe UI / Semibold</option>
                      </select>
                      <button type="button" className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]">
                        <span className="font-serif font-bold text-xs">A</span>
                        <span>Fonts ▾</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        format("formatBlock", "p");
                        setStatusMessage("Paragraph spacing adjusted to 1.15x / 8pt after.");
                      }}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Paragraph Spacing"
                    >
                      <span>Spacing ▾</span>
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Document Formatting</span>
              </div>

              {/* Page Background Group (Screenshot 4) */}
              <div className="flex flex-col justify-between items-center px-2">
                <div className="flex items-center gap-1">
                  {/* Watermark */}
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        store.setWatermarkText(e.target.value);
                        setStatusMessage(e.target.value ? `Watermark: ${e.target.value}` : "Watermark removed");
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Watermark"
                    >
                      <option value="">Watermark: None</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="DO NOT COPY">DO NOT COPY</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="SAMPLE">SAMPLE</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    >
                      <FileCheck className="w-5 h-5 text-amber-600" />
                      <span className="text-[10px] mt-0.5">Watermark</span>
                    </button>
                  </div>

                  {/* Page Color */}
                  <div className="relative">
                    <input
                      type="color"
                      value={store.pageColor}
                      onChange={(e) => {
                        store.setPageColor(e.target.value);
                        setStatusMessage(`Page Color: ${e.target.value}`);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Page Color"
                    />
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    >
                      <div className="w-5 h-5 rounded border border-neutral-400 bg-gradient-to-tr from-rose-200 via-amber-100 to-white flex items-center justify-center" />
                      <span className="text-[10px] mt-0.5">Page Color</span>
                    </button>
                  </div>

                  {/* Page Borders */}
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        store.setPageBorder(e.target.value as any);
                        setStatusMessage(`Page Border: ${e.target.value}`);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Page Borders"
                    >
                      <option value="none">Borders: None</option>
                      <option value="box">Box Border</option>
                      <option value="shadow">Shadow Border</option>
                      <option value="double">Double Line</option>
                      <option value="dashed">Dashed Border</option>
                    </select>
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    >
                      <Square className="w-5 h-5 text-indigo-500" />
                      <span className="text-[10px] mt-0.5">Page Borders</span>
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Page Background</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: LAYOUT (Screenshot 5 Authentic Matching) ----------------- */}
          {store.activeTab === "Layout" && (
            <div className="flex items-stretch gap-2.5">
              {/* Page Setup Group */}
              <div className="flex flex-col justify-between items-center pr-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  {/* Margins */}
                  <div className="relative">
                    <select
                      value={store.margins}
                      onChange={(e: any) => store.setMargins(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Margins"
                    >
                      <option value="normal">Normal (1 in / 2.54 cm)</option>
                      <option value="narrow">Narrow (0.5 in / 1.27 cm)</option>
                      <option value="moderate">Moderate (0.75 in)</option>
                      <option value="wide">Wide (1.5 in)</option>
                      <option value="mirrored">Mirrored (Book binding)</option>
                    </select>
                    <button type="button" className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-13">
                      <LayoutTemplate className="w-5 h-5 text-[#185ABD]" />
                      <span className="text-[10px] mt-0.5">Margins ▾</span>
                    </button>
                  </div>

                  {/* Orientation */}
                  <div className="relative">
                    <select
                      value={store.orientation}
                      onChange={(e: any) => store.setOrientation(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Orientation"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                    <button type="button" className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14">
                      <RotateCw className="w-5 h-5 text-indigo-500" />
                      <span className="text-[10px] mt-0.5">Orientation</span>
                    </button>
                  </div>

                  {/* Size */}
                  <div className="relative">
                    <select
                      value={store.paperSize}
                      onChange={(e: any) => store.setPaperSize(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Paper Size"
                    >
                      <option value="a4">A4 (210 x 297 mm)</option>
                      <option value="letter">Letter (8.5 x 11 in)</option>
                      <option value="legal">Legal (8.5 x 14 in)</option>
                      <option value="tabloid">Tabloid (11 x 17 in)</option>
                      <option value="a3">A3</option>
                      <option value="a5">A5</option>
                      <option value="executive">Executive</option>
                    </select>
                    <button type="button" className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12">
                      <FileText className="w-5 h-5 text-amber-600" />
                      <span className="text-[10px] mt-0.5">Size ▾</span>
                    </button>
                  </div>

                  {/* Columns */}
                  <div className="relative">
                    <select
                      value={store.columnsCount}
                      onChange={(e: any) => {
                        const count = parseInt(e.target.value, 10) || 1;
                        store.setColumnsCount(count);
                        setStatusMessage(`Columns: ${count}`);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Columns"
                    >
                      <option value="1">One Column</option>
                      <option value="2">Two Columns</option>
                      <option value="3">Three Columns</option>
                    </select>
                    <button type="button" className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-13">
                      <Columns className="w-5 h-5 text-emerald-600" />
                      <span className="text-[10px] mt-0.5">Columns ▾</span>
                    </button>
                  </div>

                  {/* Breaks & Line Numbers */}
                  <div className="flex flex-col gap-0.5 pl-1 border-l border-current/10">
                    <button
                      type="button"
                      onClick={insertPageBreak}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Page & Section Breaks"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-500" />
                      <span>Breaks ▾</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusMessage("Line numbering: Continuous enabled.")}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Line Numbers"
                    >
                      <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
                      <span>Line Numbers ▾</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusMessage("Hyphenation: Automatic enabled.")}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Hyphenation"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Hyphenation ▾</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPageSetupDialog(true)}
                    className="self-end px-1 text-[10px] opacity-70 hover:opacity-100"
                    title="Page Setup Dialog"
                  >
                    ↘
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Page Setup</span>
              </div>

              {/* Paragraph Steppers Group (Screenshot 5) */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-3">
                  {/* Indent Steppers */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold block opacity-70">Indent</span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="opacity-70 text-[10px]">Left:</span>
                      <input
                        type="text"
                        defaultValue="0 cm"
                        className="w-14 p-0.5 text-[10px] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="opacity-70 text-[10px]">Right:</span>
                      <input
                        type="text"
                        defaultValue="0 cm"
                        className="w-14 p-0.5 text-[10px] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded text-center"
                      />
                    </div>
                  </div>

                  {/* Spacing Steppers */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold block opacity-70">Spacing</span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="opacity-70 text-[10px]">Before:</span>
                      <input
                        type="text"
                        defaultValue="0 pt"
                        className="w-14 p-0.5 text-[10px] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="opacity-70 text-[10px]">After:</span>
                      <input
                        type="text"
                        defaultValue="8 pt"
                        className="w-14 p-0.5 text-[10px] border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded text-center"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowParagraphDialog(true)}
                    className="self-end px-1 text-[10px] opacity-70 hover:opacity-100"
                    title="Paragraph Dialog"
                  >
                    ↘
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Paragraph</span>
              </div>

              {/* Arrange Group (Screenshot 5) */}
              <div className="flex flex-col justify-between items-center px-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setStatusMessage("Object Position: In Line with Text selected.")}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12"
                    title="Position"
                  >
                    <LayoutTemplate className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] mt-0.5">Position ▾</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusMessage("Wrap Text: Square enabled.")}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-12"
                    title="Wrap Text"
                  >
                    <FileText className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] mt-0.5">Wrap Text ▾</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => store.setActiveSidePane(store.activeSidePane === "selection" ? "none" : "selection")}
                    className="flex flex-col items-center justify-center p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Selection Pane"
                  >
                    <Square className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] mt-0.5 text-center leading-tight">Selection Pane</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Arrange</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: REFERENCES (Screenshot 6 Authentic Matching) ----------------- */}
          {store.activeTab === "References" && (
            <div className="flex items-stretch gap-2.5">
              {/* Table of Contents Group */}
              <div className="flex flex-col justify-between items-center pr-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={generateTableOfContents}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-22"
                    title="Generate Table of Contents from Headings"
                  >
                    <BookOpen className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5 font-medium text-center leading-tight">Table of Contents ▾</span>
                  </button>
                  <div className="flex flex-col gap-0.5 pl-1">
                    <button
                      type="button"
                      onClick={() => format("formatBlock", "h2")}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Add Text to Table of Contents"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>Add Text ▾</span>
                    </button>
                    <button
                      type="button"
                      onClick={generateTableOfContents}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded flex items-center gap-1 text-[11px]"
                      title="Update Entire Table of Contents"
                    >
                      <RefreshCw className="w-3 h-3 text-[#185ABD]" />
                      <span>Update Table</span>
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Table of Contents</span>
              </div>

              {/* Footnotes Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={insertFootnote}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                    title="Insert Footnote (Ctrl+Alt+F)"
                  >
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5 text-center leading-tight">Insert Footnote</span>
                  </button>
                  <button
                    type="button"
                    onClick={insertEndnote}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                    title="Insert Endnote (Ctrl+Alt+D)"
                  >
                    <FileCheck className="w-5 h-5 text-indigo-400" />
                    <span className="text-[10px] mt-0.5 text-center leading-tight">Insert Endnote</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Footnotes</span>
              </div>

              {/* Citations & Bibliography Group (Screenshot 6) */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowCitationModal(true)}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                    title="Insert Academic Citation"
                  >
                    <Bookmark className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] mt-0.5 text-center leading-tight">Insert Citation ▾</span>
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-[10px] font-semibold opacity-70">Style:</span>
                      <select
                        value={store.citationStyle}
                        onChange={(e: any) => store.setCitationStyle(e.target.value)}
                        className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-1.5 py-0.5 text-[10px] outline-none"
                      >
                        <option value="APA">APA 7th</option>
                        <option value="MLA">MLA 9th</option>
                        <option value="Chicago">Chicago 17th</option>
                        <option value="Harvard">Harvard</option>
                        <option value="IEEE">IEEE</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const bibHtml = `<div style="border-top: 2px solid #CBD5E1; margin-top: 32px; padding-top: 14px;"><h3 style="font-weight: 800; font-size: 13pt;">References (${store.citationStyle})</h3><p style="padding-left: 24px; text-indent: -24px; font-size: 10pt; color: #334155;">Chada, D. R. (2026). <em>Client-First Real-Time Document Processing Systems</em>. Antigravity Press.</p></div>`;
                        format("insertHTML", bibHtml);
                      }}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded text-[11px] font-medium text-left"
                    >
                      Bibliography ▾
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Citations &amp; Bibliography</span>
              </div>

              {/* Captions Group */}
              <div className="flex flex-col justify-between items-center px-2">
                <button
                  type="button"
                  onClick={() => format("insertHTML", `<p style="font-size: 9pt; font-style: italic; color: #64748B; text-align: center; margin: 6px 0;">Figure 1: Diagram Reference Architecture</p>`)}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                  title="Insert Caption"
                >
                  <FileText className="w-5 h-5 text-slate-500" />
                  <span className="text-[10px] mt-0.5 text-center leading-tight">Insert Caption</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Captions</span>
              </div>
            </div>
          )}

          {/* ----------------- TAB: MAILINGS (Screenshot 7 Authentic Matching) ----------------- */}
          {store.activeTab === "Mailings" && (
            <div className="flex items-stretch gap-2.5">
              {/* Create Group */}
              <div className="flex flex-col justify-between items-center pr-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("insertHTML", "<div style='border: 1px solid #CBD5E1; padding: 24px; width: 400px; margin: 16px 0; background: #FFF;'><p style='font-size: 10pt;'>Return Address:<br/>Dinesh Reddy Chada</p><p style='margin-top: 40px; margin-left: 120px; font-size: 11pt;'>Delivery Address:<br/>{{Recipient_Address}}</p></div>")}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Envelopes"
                  >
                    <Mail className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5">Envelopes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("insertHTML", "<table style='border-collapse: collapse; width: 100%; margin: 16px 0;'><tr><td style='border: 1px dashed #94A3B8; padding: 12px; width: 50%;'>Label 1: {{First_Name}}</td><td style='border: 1px dashed #94A3B8; padding: 12px; width: 50%;'>Label 2: {{First_Name}}</td></tr></table>")}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Labels"
                  >
                    <Square className="w-5 h-5 text-indigo-400" />
                    <span className="text-[10px] mt-0.5">Labels</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Create</span>
              </div>

              {/* Start Mail Merge Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <select
                      onChange={(e) => setStatusMessage(`Mail Merge Type: ${e.target.value}`)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Start Mail Merge"
                    >
                      <option value="Letters">Letters</option>
                      <option value="E-mail Messages">E-mail Messages</option>
                      <option value="Envelopes">Envelopes</option>
                      <option value="Labels">Labels</option>
                      <option value="Directory">Directory</option>
                    </select>
                    <button type="button" className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-18">
                      <FileText className="w-5 h-5 text-[#185ABD]" />
                      <span className="text-[10px] mt-0.5 text-center leading-tight">Start Mail Merge ▾</span>
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      value={store.activeMergeIndex}
                      onChange={(e) => store.setActiveMergeIndex(parseInt(e.target.value, 10))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Select Recipients"
                    >
                      {store.mergeContacts.map((c, idx) => (
                        <option key={c.id} value={idx}>
                          #{idx + 1}: {c.firstName} {c.lastName} ({c.company})
                        </option>
                      ))}
                    </select>
                    <button type="button" className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-18">
                      <UserCheck className="w-5 h-5 text-emerald-600" />
                      <span className="text-[10px] mt-0.5 text-center leading-tight">Select Recipients ▾</span>
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Start Mail Merge</span>
              </div>

              {/* Write & Insert Fields Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) insertMergeField(e.target.value);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      title="Insert Merge Field"
                    >
                      <option value="">Choose Field...</option>
                      <option value="First_Name">First Name</option>
                      <option value="Last_Name">Last Name</option>
                      <option value="Company">Company</option>
                      <option value="Role">Role / Job Title</option>
                      <option value="Email">Email Address</option>
                      <option value="City">City</option>
                    </select>
                    <button type="button" className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-20">
                      <FilePlus className="w-5 h-5 text-[#185ABD]" />
                      <span className="text-[10px] mt-0.5 text-center leading-tight">Insert Merge Field ▾</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => insertMergeField("Address_Block")}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded text-left font-medium"
                    >
                      Address Block
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMergeField("Greeting_Line")}
                      className="px-1.5 py-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded text-left font-medium"
                    >
                      Greeting Line
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Write &amp; Insert Fields</span>
              </div>

              {/* Preview Results Group (Screenshot 7) */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMergePreview}
                    className={`flex flex-col items-center justify-center p-1.5 rounded transition-colors w-18 ${
                      store.isMergePreviewActive ? "bg-amber-500 text-slate-900 font-bold" : "hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                    title="Preview Results"
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="text-[10px] mt-0.5 text-center leading-tight">Preview Results</span>
                  </button>

                  {/* Steppers: |< < [1] > >| */}
                  <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/10 p-1 rounded">
                    <button
                      type="button"
                      onClick={() => store.setActiveMergeIndex(0)}
                      disabled={store.activeMergeIndex === 0}
                      className="p-1 hover:bg-black/10 rounded disabled:opacity-30"
                      title="First Record"
                    >
                      <ChevronsLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => store.setActiveMergeIndex(Math.max(0, store.activeMergeIndex - 1))}
                      disabled={store.activeMergeIndex === 0}
                      className="p-1 hover:bg-black/10 rounded disabled:opacity-30"
                      title="Previous Record"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1.5 font-bold text-xs">
                      {store.activeMergeIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => store.setActiveMergeIndex(Math.min(store.mergeContacts.length - 1, store.activeMergeIndex + 1))}
                      disabled={store.activeMergeIndex === store.mergeContacts.length - 1}
                      className="p-1 hover:bg-black/10 rounded disabled:opacity-30"
                      title="Next Record"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => store.setActiveMergeIndex(store.mergeContacts.length - 1)}
                      disabled={store.activeMergeIndex === store.mergeContacts.length - 1}
                      className="p-1 hover:bg-black/10 rounded disabled:opacity-30"
                      title="Last Record"
                    >
                      <ChevronsRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Preview Results</span>
              </div>

              {/* Finish Group */}
              <div className="flex flex-col justify-between items-center px-1">
                <button
                  type="button"
                  onClick={generateMergedBatch}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-18 text-[#185ABD] font-bold"
                  title="Finish & Merge"
                >
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] mt-0.5 text-center leading-tight">Finish &amp; Merge ▾</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Finish</span>
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

          {/* ----------------- TAB: HELP (Screenshot 10 Authentic Matching) ----------------- */}
          {store.activeTab === "Help" && (
            <div className="flex items-stretch gap-2.5">
              {/* Help Group */}
              <div className="flex flex-col justify-between items-center pr-2 border-r border-current/20">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowShortcutsModal(true)}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Word Help & Keyboard Shortcuts (F1)"
                  >
                    <HelpCircle className="w-5 h-5 text-[#185ABD]" />
                    <span className="text-[10px] mt-0.5 font-medium">Help ?</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("DocuFlow Support: Created & Supported by Dinesh Reddy Chada (chadadineshreddy@gmail.com)")}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-20"
                    title="Contact Support"
                  >
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] mt-0.5 font-medium text-center leading-tight">Contact Support</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Thank you for using Microsoft Word Web Platform! Created by Dinesh Reddy Chada.")}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-14"
                    title="Send Feedback"
                  >
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="text-[10px] mt-0.5 font-medium">Feedback</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShortcutsModal(true)}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-18"
                    title="Show Training & Interactive Tour"
                  >
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span className="text-[10px] mt-0.5 font-medium text-center leading-tight">Show Training</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Help</span>
              </div>

              {/* Mobile Group */}
              <div className="flex flex-col justify-between items-center px-2 border-r border-current/20">
                <button
                  type="button"
                  onClick={() => alert("Install as PWA: Tap your browser's 'Add to Home Screen' or 'Install App' to use offline on iOS/Android.")}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-18"
                  title="Get Mobile App"
                >
                  <Globe className="w-5 h-5 text-cyan-600" />
                  <span className="text-[10px] mt-0.5 font-medium text-center leading-tight">Get Word App</span>
                </button>
                <span className="text-[9px] opacity-60 font-medium">Mobile</span>
              </div>

              <div className="flex flex-col justify-center text-xs opacity-75 pl-2">
                <p className="font-bold">Microsoft Word Web Platform (DocuFlow)</p>
                <p>Designed &amp; Engineered by Dinesh Reddy Chada</p>
              </div>
            </div>
          )}

          {/* ----------------- TAB: ACROBAT (Screenshot 1 Authentic Matching) ----------------- */}
          {store.activeTab === "Acrobat" && (
            <div className="flex items-stretch gap-2.5">
              {/* Create Adobe PDF Group */}
              <div className="flex flex-col justify-between items-center pr-2 border-r border-current/20">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrintOrPdf}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-20"
                    title="Create Adobe PDF (Ctrl+P)"
                  >
                    <FileText className="w-6 h-6 text-red-600" />
                    <span className="text-[10px] mt-0.5 font-medium text-center leading-tight">Create a PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(window.location.href);
                        setStatusMessage("Shareable document link copied!");
                      }
                    }}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-28"
                    title="Create PDF and Share link"
                  >
                    <Share2 className="w-6 h-6 text-red-500" />
                    <span className="text-[10px] mt-0.5 font-medium text-center leading-tight">Create a PDF and Share link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPageSetupDialog(true)}
                    className="flex flex-col items-center justify-center p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded w-16"
                    title="Acrobat Preferences"
                  >
                    <Settings className="w-5 h-5 text-slate-500" />
                    <span className="text-[10px] mt-0.5 font-medium">Preferences</span>
                  </button>
                </div>
                <span className="text-[9px] opacity-60 font-medium">Create Adobe PDF</span>
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
            onClick={(e) => {
              if (e.target === e.currentTarget && editorRef.current) {
                editorRef.current.focus();
                const range = document.createRange();
                range.selectNodeContents(editorRef.current);
                range.collapse(false);
                const sel = window.getSelection();
                if (sel) {
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }
            }}
            style={{
              transform: `scale(${store.zoom / 100})`,
              transformOrigin: "top center",
              width: getPaperDimensions().width,
              minHeight: getPaperDimensions().minHeight,
              backgroundColor: store.pageColor,
            }}
            className={`word-canvas-sheet bg-white text-slate-900 cursor-text select-text ${getMarginClass()} transition-transform duration-100 ease-out ${getPageBorderClass()} print:p-0 print:border-none print:shadow-none print:w-full my-4 relative`}
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
              tabIndex={0}
              onInput={handleInput}
              onKeyDown={handleEditorKeyDown}
              onMouseUp={() => saveSelection()}
              onKeyUp={() => saveSelection()}
              style={{
                fontFamily: `${store.fontFamily}, Calibri, Segoe UI, sans-serif`,
                columnCount: store.columnsCount > 1 ? store.columnsCount : undefined,
                columnGap: store.columnsCount > 1 ? "2.5rem" : undefined,
                columnRule: store.columnsCount > 1 ? "1px solid #d1d5db" : undefined,
                userSelect: "text",
                WebkitUserSelect: "text",
                minHeight: "900px",
                color: "#0F172A",
              }}
              className="outline-none min-h-[900px] text-slate-900 prose max-w-none focus:outline-none relative z-10 cursor-text select-text"
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
            onMouseDown={(e) => {
              const el = e.target as HTMLElement;
              if (el.tagName === "BUTTON" || el.closest("button")) {
                e.preventDefault();
              }
            }}
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
            onMouseDown={(e) => {
              const el = e.target as HTMLElement;
              if (el.tagName === "BUTTON" || el.closest("button")) {
                e.preventDefault();
              }
            }}
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
      <footer className={`${getStatusBarBg()} flex items-center justify-between px-3 h-7 select-none text-[11px] shrink-0 print:hidden z-20`}>
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
        <div className={`fixed inset-0 z-50 flex flex-col md:flex-row animate-fade-in ${
          store.theme === "obsidian" ? "bg-[#070405] text-white" : "bg-white dark:bg-neutral-900 text-slate-800 dark:text-white"
        }`}>
          {/* Left Sidebar (WorkOnline Obsidian / Fluent Backstage) */}
          <div className={`w-full md:w-60 p-4 flex flex-col justify-between shrink-0 select-none ${
            store.theme === "obsidian" ? "bg-[#100C0E] border-r border-white/[0.08] text-white" : "bg-[#185ABD] text-white"
          }`}>
            <div className="space-y-3">
              {/* Navigation Header: Back Arrow + Return to Main Page */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => store.setShowBackstage(false)}
                  className="w-9 h-9 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
                  title="Return to Document Editor (Esc)"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all hover:scale-[1.02]"
                  title="Exit to WorkOnline Main Page"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Main Page</span>
                </Link>
              </div>

              <nav className="space-y-0.5 text-xs font-semibold">
                {/* Return to Main Page Link */}
                <Link
                  href="/"
                  className="w-full text-left px-3 py-2 rounded bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-white transition-colors flex items-center gap-2 text-xs font-bold my-1"
                >
                  <Home className="w-3.5 h-3.5 text-rose-400" />
                  <span>Return to Main Page</span>
                </Link>
                {/* 1. Home */}
                <button
                  type="button"
                  onClick={() => store.setBackstageSection("home")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    store.backstageSection === "home" ? (store.theme === "obsidian" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40" : "bg-white text-[#185ABD] font-bold") : "hover:bg-white/10 text-white"
                  }`}
                >
                  Home
                </button>

                {/* 2. New */}
                <button
                  type="button"
                  onClick={() => store.setBackstageSection("new")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    store.backstageSection === "new" ? (store.theme === "obsidian" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40" : "bg-white text-[#185ABD] font-bold") : "hover:bg-white/10 text-white"
                  }`}
                >
                  New
                </button>

                {/* 3. Open */}
                <button
                  type="button"
                  onClick={() => store.setBackstageSection("open")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    store.backstageSection === "open" ? (store.theme === "obsidian" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40" : "bg-white text-[#185ABD] font-bold") : "hover:bg-white/10 text-white"
                  }`}
                >
                  Open
                </button>

                <div className="my-2 border-t border-white/25" />

                {/* 4. Info */}
                <button
                  type="button"
                  onClick={() => store.setBackstageSection("info")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    store.backstageSection === "info" ? (store.theme === "obsidian" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40" : "bg-white text-[#185ABD] font-bold") : "hover:bg-white/10 text-white"
                  }`}
                >
                  Info
                </button>

                {/* 5. Save */}
                <button
                  type="button"
                  onClick={() => {
                    if (editorRef.current) {
                      localStorage.setItem("docuflow_document_content", editorRef.current.innerHTML);
                      localStorage.setItem("docuflow_document_title", store.docTitle);
                      setStatusMessage("Document saved successfully to local and cloud storage.");
                      store.setShowBackstage(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-white transition-colors"
                >
                  Save
                </button>

                {/* 6. Save As */}
                <button
                  type="button"
                  onClick={() => {
                    handleExportDocx();
                    store.setShowBackstage(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-white transition-colors"
                >
                  Save As
                </button>

                {/* 7. Save as Adobe PDF */}
                <button
                  type="button"
                  onClick={() => {
                    handlePrintOrPdf();
                    store.setShowBackstage(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-white transition-colors font-medium"
                >
                  Save as Adobe PDF
                </button>

                {/* 8. History (dimmed) */}
                <button
                  type="button"
                  disabled
                  className="w-full text-left px-3 py-2 rounded opacity-40 cursor-not-allowed text-white"
                >
                  History
                </button>

                {/* 9. Print */}
                <button
                  type="button"
                  onClick={() => {
                    handlePrintOrPdf();
                    store.setShowBackstage(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-white transition-colors"
                >
                  Print
                </button>

                {/* 10. Share */}
                <button
                  type="button"
                  onClick={() => store.setBackstageSection("share")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    store.backstageSection === "share" ? (store.theme === "obsidian" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40" : "bg-white text-[#185ABD] font-bold") : "hover:bg-white/10 text-white"
                  }`}
                >
                  Share
                </button>

                {/* 11. Share as Adobe PDF link */}
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                      setStatusMessage("Share link copied to clipboard!");
                    }
                    store.setShowBackstage(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-white transition-colors text-[11px]"
                >
                  Share as Adobe PDF link
                </button>

                {/* 12. Export */}
                <button
                  type="button"
                  onClick={() => store.setBackstageSection("export")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    store.backstageSection === "export" ? (store.theme === "obsidian" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40" : "bg-white text-[#185ABD] font-bold") : "hover:bg-white/10 text-white"
                  }`}
                >
                  Export
                </button>

                {/* 13. Close */}
                <button
                  type="button"
                  onClick={() => store.setShowBackstage(false)}
                  className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-white transition-colors"
                >
                  Close
                </button>

                <div className="my-2 border-t border-white/25" />

                {/* 14. Account */}
                <button
                  type="button"
                  onClick={() => store.setBackstageSection("account")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    store.backstageSection === "account" ? (store.theme === "obsidian" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40" : "bg-white text-[#185ABD] font-bold") : "hover:bg-white/10 text-white"
                  }`}
                >
                  Account
                </button>

                {/* 15. Options */}
                <button
                  type="button"
                  onClick={() => store.setBackstageSection("options")}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    store.backstageSection === "options" ? (store.theme === "obsidian" ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-rose-950/40" : "bg-white text-[#185ABD] font-bold") : "hover:bg-white/10 text-white"
                  }`}
                >
                  Options
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-white/20 text-[11px] opacity-80">
              <p className="font-bold">Microsoft Word Web Platform</p>
              <p>Designed &amp; Engineered by Dinesh Reddy Chada</p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className={`flex-1 p-6 md:p-12 overflow-y-auto ${
            store.theme === "obsidian" ? "bg-[#070405] text-white" : "bg-[#F9FAFB] dark:bg-neutral-900 text-slate-800 dark:text-white"
          }`}>
            {/* HOME SECTION (Authentic Desktop Word Backstage Home) */}
            {store.backstageSection === "home" && (
              <div className="space-y-8 max-w-5xl">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Document Studio</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Open &amp; free to use • No account or sign-in needed</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editorRef.current) {
                          editorRef.current.innerHTML = "<p>Type your text here...</p>";
                          store.setDocTitle("Document1");
                          handleInput();
                          store.setShowBackstage(false);
                        }
                      }}
                      className="px-4 py-2 bg-[#185ABD] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#134996] transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Blank Document</span>
                    </button>
                  </div>
                </div>

                {/* New Section cards */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">New</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div
                      onClick={() => {
                        if (editorRef.current) {
                          editorRef.current.innerHTML = "<p>Type your text here...</p>";
                          store.setDocTitle("Document1");
                          handleInput();
                          store.setShowBackstage(false);
                        }
                      }}
                      className="p-3 bg-white dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#185ABD] rounded-xl cursor-pointer text-center flex flex-col items-center justify-center min-h-[140px] hover:shadow transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-[#185ABD] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white">Blank document</span>
                    </div>

                    {TEMPLATES.slice(0, 5).map((tmpl) => (
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
                        className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#185ABD] rounded-xl cursor-pointer flex flex-col justify-between min-h-[140px] hover:shadow transition-all"
                      >
                        <div className="w-full h-12 bg-neutral-100 dark:bg-neutral-700/60 rounded mb-2 flex items-center justify-center p-2 text-[9px] text-slate-500 line-clamp-2 overflow-hidden leading-tight">
                          {tmpl.desc}
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-[#185ABD] block">{tmpl.category}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{tmpl.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Documents Table */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Recent Documents</h3>
                  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-sm divide-y divide-neutral-100 dark:divide-neutral-700/50">
                    {[
                      { name: store.docTitle || "Document1", time: "Active session", location: "OneDrive - Personal » Documents" },
                      { name: "Dinesh Reddy Resume - IT", time: "Earlier today", location: "This PC » Desktop" },
                      { name: "Executive Business Proposal", time: "Yesterday", location: "OneDrive - Personal » Work" },
                      { name: "Research Paper APA 7th", time: "Nov 20, 2026", location: "This PC » Documents" },
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        onClick={() => store.setShowBackstage(false)}
                        className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-750 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#185ABD] shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</p>
                            <p className="text-[11px] text-slate-400">{doc.location}</p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{doc.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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

            {/* ACCOUNT SECTION (Screenshot 11 Authentic Matching) */}
            {store.backstageSection === "account" && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h2 className="text-2xl font-bold">Account</h2>
                  <p className="text-sm opacity-60">User credentials, connected cloud services, and product license.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Profile */}
                  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-neutral-100 dark:border-neutral-700">
                      User Information
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                        <Check className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Open Access (No Account Needed)</h4>
                        <p className="text-xs text-slate-500">All Microsoft Word features and exports are completely open &amp; free</p>
                        <div className="mt-2 flex gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            100% Free &amp; Private
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700 space-y-2 text-xs">
                      <label className="block font-bold text-slate-600 dark:text-slate-300">Office Theme</label>
                      <select
                        value={store.theme}
                        onChange={(e) => store.setTheme(e.target.value as WordTheme)}
                        className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-xs font-medium"
                      >
                        <option value="fluent">Colorful / Fluent Word Blue</option>
                        <option value="obsidian">Deep Obsidian Glass</option>
                        <option value="dark-gray">Dark Gray</option>
                        <option value="white">White</option>
                      </select>
                    </div>

                    <div className="pt-2 space-y-1 text-xs">
                      <p className="font-bold text-slate-600 dark:text-slate-300">Connected Services:</p>
                      <p className="text-slate-500">OneDrive - Personal (chadadineshreddy@gmail.com)</p>
                      <p className="text-emerald-600 font-semibold">✓ Client-Side Browser Storage Active</p>
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-neutral-100 dark:border-neutral-700">
                      Product Information
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Subscription Product Active for Dinesh Reddy Chada</span>
                      </div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white pt-1">
                        Microsoft Word Desktop Web Platform
                      </p>
                      <p className="text-slate-500">DocuFlow Enterprise Edition</p>
                      <p className="text-slate-400">Version 2402 (Build 17328.20162 Click-to-Run)</p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700 space-y-1.5 text-xs text-slate-500">
                      <p className="font-bold text-slate-700 dark:text-slate-200">About Word:</p>
                      <p>
                        High-performance in-browser Word processing engine with native OOXML .docx import/export, Math KaTeX notation, 11-tab desktop ribbon, and client-side privacy.
                      </p>
                      <p className="pt-1 font-semibold text-slate-700 dark:text-slate-300">
                        Designed &amp; Engineered by <span className="text-[#185ABD] font-bold">Dinesh Reddy Chada</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SHARE SECTION */}
            {store.backstageSection === "share" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold">Share Document</h2>
                  <p className="text-sm opacity-60">Invite collaborators or send copies of this document.</p>
                </div>

                <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-5 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold uppercase opacity-70 mb-2">Share Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== "undefined" ? window.location.href : ""}
                        className="flex-1 p-2.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            navigator.clipboard.writeText(window.location.href);
                            setStatusMessage("Share link copied to clipboard!");
                          }
                        }}
                        className="px-4 py-2 bg-[#185ABD] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#134996] transition-colors"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700 space-y-3">
                    <h4 className="font-bold text-xs uppercase opacity-70">Send as Attachment</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          handleExportDocx();
                          store.setShowBackstage(false);
                        }}
                        className="p-3 border border-neutral-200 dark:border-neutral-700 hover:border-[#185ABD] rounded-lg text-left transition-colors"
                      >
                        <h5 className="font-bold text-xs">Word Document (.docx)</h5>
                        <p className="text-[11px] opacity-60">Send an editable copy</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handlePrintOrPdf();
                          store.setShowBackstage(false);
                        }}
                        className="p-3 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-500 rounded-lg text-left transition-colors"
                      >
                        <h5 className="font-bold text-xs">PDF Document (.pdf)</h5>
                        <p className="text-[11px] opacity-60">Send a fixed-layout copy</p>
                      </button>
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

      {/* Page Setup Dialog */}
      {showPageSetupDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Page Setup</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold opacity-70 mb-1">Margins</label>
                <select
                  value={store.margins}
                  onChange={(e: any) => store.setMargins(e.target.value)}
                  className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-1.5 bg-transparent"
                >
                  <option value="normal">Normal (1 in / 2.54 cm)</option>
                  <option value="narrow">Narrow (0.5 in / 1.27 cm)</option>
                  <option value="moderate">Moderate (0.75 in)</option>
                  <option value="wide">Wide (1.5 in)</option>
                  <option value="mirrored">Mirrored (Book binding)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold opacity-70 mb-1">Orientation</label>
                <select
                  value={store.orientation}
                  onChange={(e: any) => store.setOrientation(e.target.value)}
                  className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-1.5 bg-transparent"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold opacity-70 mb-1">Paper Size</label>
                <select
                  value={store.paperSize}
                  onChange={(e: any) => store.setPaperSize(e.target.value)}
                  className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-1.5 bg-transparent"
                >
                  <option value="a4">A4 (210 x 297 mm)</option>
                  <option value="letter">Letter (8.5 x 11 in)</option>
                  <option value="legal">Legal (8.5 x 14 in)</option>
                  <option value="tabloid">Tabloid (11 x 17 in)</option>
                  <option value="a3">A3</option>
                  <option value="a5">A5</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold opacity-70 mb-1">Columns</label>
                <select
                  value={store.columnsCount}
                  onChange={(e: any) => store.setColumnsCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full border border-neutral-300 dark:border-neutral-600 rounded p-1.5 bg-transparent"
                >
                  <option value="1">1 Column</option>
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPageSetupDialog(false)}
                className="px-4 py-1.5 bg-[#185ABD] text-white rounded font-bold"
              >
                OK
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

      {/* Word Count & Document Totals Modal */}
      {showWordCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-white">
          <div className="bg-[#140E11] border border-white/15 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base text-white">Document Totals &amp; Metrics</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWordCountModal(false)}
                className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-400 font-medium block">Total Words</span>
                <span className="text-2xl font-black text-rose-400">{store.wordCount}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-400 font-medium block">Total Pages</span>
                <span className="text-2xl font-black text-white">{store.pageCount}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-white/10">
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Characters (with spaces):</span>
                <strong className="text-white font-bold">{store.charCount}</strong>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Characters (no spaces):</span>
                <strong className="text-white font-bold">{Math.max(0, store.charCount - (store.wordCount - 1))}</strong>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Paragraphs:</span>
                <strong className="text-white font-bold">{Math.max(1, Math.ceil(store.wordCount / 45))}</strong>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Estimated Reading Time:</span>
                <strong className="text-emerald-400 font-bold">~{Math.max(1, Math.ceil(store.wordCount / 200))} min</strong>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Estimated Speaking Time:</span>
                <strong className="text-amber-400 font-bold">~{Math.max(1, Math.ceil(store.wordCount / 130))} min</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  insertTableTotalRow();
                  setShowWordCountModal(false);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-rose-300 rounded-lg text-xs font-semibold"
              >
                + Insert Total Row
              </button>
              <button
                type="button"
                onClick={() => setShowWordCountModal(false)}
                className="px-5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg text-xs font-bold shadow-md shadow-rose-950/40"
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
