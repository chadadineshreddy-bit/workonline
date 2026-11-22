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
  FilePlus
} from "lucide-react";
import { exportHtmlToDocxBlob } from "@/lib/docx/docx-export";
import { importDocxFile } from "@/lib/docx/docx-import";
import { convertPdfToWordHtml } from "@/lib/pdf/pdf-to-word";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { executeAiTask } from "@/lib/ai/ai-client";

// Ribbon Navigation Tabs
type RibbonTab =
  | "File"
  | "Home"
  | "Insert"
  | "Layout"
  | "References"
  | "Mailings"
  | "Review"
  | "View"
  | "Draw"
  | "Help";

// Comment thread item
interface CommentItem {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  resolved: boolean;
  replies: { author: string; text: string; timestamp: string }[];
}

// Mail merge recipient
interface MergeContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  city: string;
}

// Version History item
interface VersionSnapshot {
  id: string;
  title: string;
  timestamp: string;
  html: string;
  wordCount: number;
}

export function WordEditor() {
  // Document Identity
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");
  const [activeTab, setActiveTab] = useState<RibbonTab>("Home");

  // Metrics
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [selectedWordCount, setSelectedWordCount] = useState(0);
  const [selectedCharCount, setSelectedCharCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  // View Settings
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  const [showOutline, setShowOutline] = useState(false);
  const [outlineItems, setOutlineItems] = useState<{ id: string; text: string; level: number }[]>([]);
  const [pageMargins, setPageMargins] = useState<"normal" | "narrow" | "moderate" | "wide">("normal");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [paperSize, setPaperSize] = useState<"a4" | "a3" | "a5" | "letter" | "legal">("a4");
  const [viewMode, setViewMode] = useState<"print" | "read" | "focus" | "web">("print");
  const [showGridlines, setShowGridlines] = useState(false);
  const [watermarkText, setWatermarkText] = useState("");
  const [pageBgColor, setPageBgColor] = useState("#FFFFFF");

  // Font & Paragraph states
  const [fontFamily, setFontFamily] = useState("Calibri");
  const [fontSize, setFontSize] = useState("11pt");

  // Sidebars & Panels
  const [showBackstage, setShowBackstage] = useState(false);
  const [backstageSection, setBackstageSection] = useState<
    "new" | "open" | "save" | "export" | "print" | "info" | "versions" | "share"
  >("new");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);

  // Modals
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showWordCountModal, setShowWordCountModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationType, setCitationType] = useState<"APA" | "MLA" | "Chicago" | "IEEE">("APA");
  const [citationAuthor, setCitationAuthor] = useState("");
  const [citationTitle, setCitationTitle] = useState("");
  const [citationYear, setCitationYear] = useState("");

  // Track Changes & Comments
  const [trackChangesEnabled, setTrackChangesEnabled] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState<{ [id: string]: string }>({});

  // Drawing Tools (Draw Tab)
  const [drawTool, setDrawTool] = useState<"none" | "pen" | "highlighter" | "eraser">("none");
  const [drawColor, setDrawColor] = useState("#DC2626");
  const [drawSize, setDrawSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  // Mail Merge State (Mailings Tab)
  const [mergeContacts, setMergeContacts] = useState<MergeContact[]>([
    { id: "1", firstName: "Alex", lastName: "Morgan", email: "alex.morgan@enterprise.com", company: "Acrobatix Cloud", role: "VP of Engineering", city: "San Francisco" },
    { id: "2", firstName: "Sarah", lastName: "Jenkins", email: "s.jenkins@globex.org", company: "Globex Industries", role: "Lead Systems Architect", city: "New York" },
    { id: "3", firstName: "David", lastName: "Chen", email: "d.chen@apex.tech", company: "Apex Digital Labs", role: "Principal Product Officer", city: "Austin" },
  ]);
  const [activeRecipientIndex, setActiveRecipientIndex] = useState(0);
  const [previewMergeResults, setPreviewMergeResults] = useState(false);
  const [backupBeforeMerge, setBackupBeforeMerge] = useState<string | null>(null);

  // Speech Synthesizer (Read Aloud)
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text: "Hello! I am your DocuFlow AI Copilot. Ask me to rewrite selections, summarize your document, fix grammar, or generate new sections.",
    },
  ]);

  // Version Snapshots
  const [versionHistory, setVersionHistory] = useState<VersionSnapshot[]>([]);

  // System Notifications
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // DOM Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // =========================================================================
  // 1. TEMPLATES CATALOG (20+ Complete Templates)
  // =========================================================================
  const TEMPLATES = [
    // Student Templates
    {
      id: "student-assignment",
      category: "Student",
      title: "College Assignment",
      desc: "Formal coursework submission with course code and instructor cover details.",
      html: `
        <div style="text-align: center; margin-top: 30px; margin-bottom: 40px;">
          <p style="color: #64748B; font-size: 11pt; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">DEPARTMENT OF COMPUTER SCIENCE</p>
          <h1 style="color: #1E293B; font-size: 24pt; font-weight: 800; margin-bottom: 12px;">Distributed Systems & Consensus Protocols</h1>
          <p style="color: #475569; font-size: 12pt;">Course Code: CS-402 | Term Assignment 01</p>
        </div>
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 18px; border-radius: 6px; margin-bottom: 28px;">
          <p style="margin: 0 0 6px 0;"><strong>Student Name:</strong> Dinesh Reddy Chada</p>
          <p style="margin: 0 0 6px 0;"><strong>Roll / Student ID:</strong> 22CMR-CS-785</p>
          <p style="margin: 0 0 6px 0;"><strong>Course Instructor:</strong> Prof. Robert Vance</p>
          <p style="margin: 0;"><strong>Submission Date:</strong> November 2026</p>
        </div>
        <hr style="border: none; border-top: 2px solid #E2E8F0; margin: 24px 0;" />
        <h2 style="color: #1E293B; font-size: 15pt; font-weight: 700; margin-top: 18px;">1. Problem Definition & Scope</h2>
        <p style="line-height: 1.5; margin-bottom: 12px;">Modern distributed applications rely on consensus mechanisms such as Raft and Paxos to ensure high availability, fault tolerance, and serializability across asynchronous compute clusters.</p>
        <h2 style="color: #1E293B; font-size: 15pt; font-weight: 700; margin-top: 18px;">2. Architectural Methodology</h2>
        <p style="line-height: 1.5; margin-bottom: 12px;">This study evaluates state machine replication over partitioned networks, simulating packet loss and leader election delays.</p>
        <h2 style="color: #1E293B; font-size: 15pt; font-weight: 700; margin-top: 18px;">3. Experimental Conclusions</h2>
        <p style="line-height: 1.5; margin-bottom: 12px;">Benchmark telemetry confirms sub-50ms leader failovers under median quorum network topologies.</p>
      `,
    },
    {
      id: "academic-report",
      category: "Student",
      title: "Academic Research Report",
      desc: "Structured research paper with Abstract, Methodology, Findings, and References.",
      html: `
        <h1 style="color: #0F172A; font-size: 22pt; font-weight: 800; margin-bottom: 4px;">Empirical Analysis of In-Browser Vector Embeddings</h1>
        <p style="color: #64748B; font-size: 11pt; margin-bottom: 16px;">Authored by: Dinesh Reddy Chada | Faculty Review Board</p>
        <div style="background-color: #F1F5F9; border-left: 4px solid #DC2626; padding: 14px 18px; margin: 18px 0; font-style: italic;">
          <strong>Abstract:</strong> WebAssembly execution engines now enable on-device similarity vector search. This paper analyzes latency thresholds and memory overhead of client-side RAG pipelines.
        </div>
        <h2 style="color: #1E293B; font-size: 15pt; font-weight: 700; margin-top: 18px;">1. Introduction</h2>
        <p style="line-height: 1.45;">Zero-telemetry client computation preserves user privacy while dramatically shrinking cloud infrastructure costs.</p>
        <h2 style="color: #1E293B; font-size: 15pt; font-weight: 700; margin-top: 18px;">2. Empirical Findings</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 14px 0;">
          <thead>
            <tr style="background-color: #F8FAFC;">
              <th style="border: 1px solid #CBD5E1; padding: 8px; text-align: left;">Engine</th>
              <th style="border: 1px solid #CBD5E1; padding: 8px; text-align: left;">Quantization</th>
              <th style="border: 1px solid #CBD5E1; padding: 8px; text-align: left;">Inference Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">ONNX WASM</td>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">q8_0</td>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">18.4 ms</td>
            </tr>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">WebGPU</td>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">f16</td>
              <td style="border: 1px solid #CBD5E1; padding: 8px;">4.2 ms</td>
            </tr>
          </tbody>
        </table>
      `,
    },
    // Professional Templates
    {
      id: "executive-proposal",
      category: "Professional",
      title: "Business Project Proposal",
      desc: "Commercial client proposal with deliverables, schedule, budget, and acceptance scope.",
      html: `
        <div style="border-bottom: 3px solid #DC2626; padding-bottom: 12px; margin-bottom: 24px;">
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
      id: "professional-resume",
      category: "Professional",
      title: "Executive Curriculum Vitae",
      desc: "Clean modern resume with summary, experience, core skills, and academic qualifications.",
      html: `
        <div style="text-align: center; margin-bottom: 16px;">
          <h1 style="color: #0F172A; font-size: 26pt; font-weight: 800; letter-spacing: 0.05em; margin: 0; text-transform: uppercase;">DINESH REDDY CHADA</h1>
          <p style="color: #DC2626; font-size: 11pt; font-weight: 700; margin-top: 4px; margin-bottom: 8px;">Senior Full-Stack Architect & Data Systems Specialist</p>
          <p style="color: #475569; font-size: 9.5pt; margin: 0;">Hyderabad, India • contact@dineshreddy.dev • +91 98765 43210 • linkedin.com/in/dineshreddy</p>
        </div>
        <hr style="border: none; border-top: 2px solid #0F172A; margin: 12px 0;" />
        <h2 style="color: #0F172A; font-size: 13pt; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 14px;">Professional Summary</h2>
        <p style="line-height: 1.4; margin-bottom: 12px;">Dynamic software engineer with comprehensive mastery of full-stack TypeScript, distributed cloud engines, and in-browser document processing. Architect of resilient web applications serving tens of thousands of active sessions.</p>
        <h2 style="color: #0F172A; font-size: 13pt; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 14px;">Core Competencies</h2>
        <ul style="padding-left: 20px; line-height: 1.45; margin-bottom: 12px;">
          <li><strong>Architecture & Systems:</strong> Next.js 14, React 18, TypeScript, Node.js, WebAssembly, Supabase, PostgreSQL</li>
          <li><strong>Document & Processing:</strong> DOCX Generation, PDF.js parsing, Canvas vector drawing, Mail Merge workflows</li>
          <li><strong>DevOps & Cloud:</strong> Docker, Git CI/CD, Edge Middleware, Fluid Compute, Vercel infrastructure</li>
        </ul>
        <h2 style="color: #0F172A; font-size: 13pt; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; margin-top: 14px;">Professional Experience</h2>
        <div style="display: flex; justify-content: space-between; font-weight: bold; color: #0F172A; margin-top: 8px;">
          <span>Lead Platform Architect — DocuFlow / WorkOnline</span>
          <span style="color: #64748B;">2023 — Present</span>
        </div>
        <ul style="padding-left: 20px; line-height: 1.4; margin-top: 4px; margin-bottom: 10px;">
          <li>Pioneered 100% in-browser document processing studio supporting seamless DOCX import, editing, and PDF printing.</li>
          <li>Integrated serverless Gemini AI assistance for contextual rewriting, automated summarization, and grammar verification.</li>
        </ul>
      `,
    },
    {
      id: "meeting-minutes",
      category: "Professional",
      title: "Corporate Meeting Minutes",
      desc: "Standard executive meeting minutes with attendee list, agenda, action items, and next steps.",
      html: `
        <h1 style="color: #0F172A; font-size: 22pt; font-weight: 800; margin-bottom: 4px;">Executive Board Meeting Minutes</h1>
        <p style="color: #64748B; font-size: 10.5pt; margin-bottom: 18px;">Date: November 22, 2026 | Location: Conference Room B & Online Sync</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
          <tbody>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 6px 10px; width: 25%; font-weight: bold; background: #F8FAFC;">Chairperson:</td>
              <td style="border: 1px solid #CBD5E1; padding: 6px 10px;">Alex Morgan (VP Operations)</td>
            </tr>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 6px 10px; font-weight: bold; background: #F8FAFC;">Attendees:</td>
              <td style="border: 1px solid #CBD5E1; padding: 6px 10px;">Dinesh Reddy, Sarah Jenkins, David Chen, Marcus Brody</td>
            </tr>
          </tbody>
        </table>
        <h2 style="color: #1E293B; font-size: 14pt; font-weight: 700;">1. Agenda Items Discussed</h2>
        <ol style="padding-left: 22px; line-height: 1.45;">
          <li>Review of Q4 Infrastructure migration to Next.js App Router and edge deployments.</li>
          <li>Validation of zero-latency DOCX & PDF conversion pipeline.</li>
          <li>Expansion of automated student productivity calculators and AI assistants.</li>
        </ol>
        <h2 style="color: #1E293B; font-size: 14pt; font-weight: 700; margin-top: 16px;">2. Action Items Assigned</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          <thead>
            <tr style="background: #F1F5F9;">
              <th style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: left;">Task</th>
              <th style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: left;">Owner</th>
              <th style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: left;">Due</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #CBD5E1; padding: 6px 8px;">Deploy full-bleed Document Studio</td>
              <td style="border: 1px solid #CBD5E1; padding: 6px 8px;">Dinesh Reddy</td>
              <td style="border: 1px solid #CBD5E1; padding: 6px 8px;">Completed</td>
            </tr>
          </tbody>
        </table>
      `,
    },
    // Personal Template
    {
      id: "personal-letter",
      category: "Personal",
      title: "Formal Business Letter",
      desc: "Standard business correspondence with formal sender/recipient headers and signature block.",
      html: `
        <div style="margin-bottom: 24px;">
          <p style="margin: 0;"><strong>Dinesh Reddy Chada</strong></p>
          <p style="margin: 0;">Road No. 12, Banjara Hills</p>
          <p style="margin: 0;">Hyderabad, Telangana 500034</p>
          <p style="margin: 0; color: #64748B;">contact@dineshreddy.dev</p>
        </div>
        <p style="margin-bottom: 24px;">November 22, 2026</p>
        <div style="margin-bottom: 24px;">
          <p style="margin: 0;"><strong>Human Resources Review Committee</strong></p>
          <p style="margin: 0;">Global Tech Enterprises Inc.</p>
          <p style="margin: 0;">100 Innovation Way, Suite 400</p>
          <p style="margin: 0;">San Francisco, CA 94105</p>
        </div>
        <p style="font-weight: bold; margin-bottom: 12px;">SUBJECT: Application for Senior Systems & Full-Stack Architect Position</p>
        <p>Dear Hiring Committee,</p>
        <p style="line-height: 1.5;">I am writing to express my enthusiastic interest in the Senior Systems Architect position currently available at your organization. With a proven record in engineering high-throughput web applications and frictionless browser productivity suites, I am confident in my capacity to add immediate technical value.</p>
        <p style="line-height: 1.5;">Throughout my engineering engagements, I have spearheaded the transition of traditional desktop workflows to rapid, zero-telemetry cloud environments, achieving sub-second turnaround times while maintaining rigorous user data privacy.</p>
        <p style="line-height: 1.5;">I welcome the opportunity to discuss how my architectural skills and passion for responsive design align with your ambitious milestones.</p>
        <p style="margin-top: 24px; margin-bottom: 40px;">Sincerely,</p>
        <p style="margin: 0; font-weight: bold;">Dinesh Reddy Chada</p>
        <p style="margin: 0; color: #64748B;">Full-Stack Software Architect</p>
      `,
    },
  ];

  // =========================================================================
  // 2. LIFECYCLE & PERSISTENCE
  // =========================================================================
  useEffect(() => {
    const savedDraft = localStorage.getItem("docuflow_document_draft");
    const savedTitle = localStorage.getItem("docuflow_document_title");
    const savedVersions = localStorage.getItem("docuflow_version_history");

    if (editorRef.current) {
      if (savedDraft) {
        editorRef.current.innerHTML = savedDraft;
      } else {
        editorRef.current.innerHTML = TEMPLATES[0].html;
      }
      updateCountsAndOutline();
    }
    if (savedTitle) setDocTitle(savedTitle);
    if (savedVersions) {
      try {
        setVersionHistory(JSON.parse(savedVersions));
      } catch {}
    }

    // Keydown listeners for Ctrl shortcuts
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
            e.preventDefault();
            setShowFindReplace(true);
            break;
          case "k":
            e.preventDefault();
            setShowLinkModal(true);
            break;
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update counts, pages, and selection
  const updateCountsAndOutline = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);

    // Dynamic page estimation based on standard A4 vertical capacity (approx 980px or 450 words)
    const contentHeight = editorRef.current.scrollHeight;
    const estimatedPages = Math.max(1, Math.ceil(contentHeight / 980));
    setPageCount(estimatedPages);

    // Selection metrics
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      const selText = sel.toString().trim();
      setSelectedWordCount(selText.split(/\s+/).length);
      setSelectedCharCount(selText.length);
    } else {
      setSelectedWordCount(0);
      setSelectedCharCount(0);
    }

    // Extract headings for Navigation Outline & Table of Contents
    const headings = editorRef.current.querySelectorAll("h1, h2, h3");
    const items: { id: string; text: string; level: number }[] = [];
    headings.forEach((h, index) => {
      const id = `docuflow-heading-${index}`;
      h.setAttribute("id", id);
      const level = parseInt(h.tagName.substring(1), 10);
      items.push({ id, text: h.textContent || `Section ${index + 1}`, level });
    });
    setOutlineItems(items);
  };

  const handleInput = () => {
    setSaveStatus("saving");
    updateCountsAndOutline();

    if (editorRef.current) {
      localStorage.setItem("docuflow_document_draft", editorRef.current.innerHTML);
      localStorage.setItem("docuflow_document_title", docTitle);
    }

    setTimeout(() => {
      setSaveStatus("saved");
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 450);
  };

  // Manual Save with Version Snapshot Creation
  const handleManualSave = () => {
    if (!editorRef.current) return;
    setSaveStatus("saving");
    const html = editorRef.current.innerHTML;
    localStorage.setItem("docuflow_document_draft", html);
    localStorage.setItem("docuflow_document_title", docTitle);

    // Append to version history
    const newSnapshot: VersionSnapshot = {
      id: Date.now().toString(),
      title: `${docTitle} — Snapshot`,
      timestamp: new Date().toLocaleString(),
      html,
      wordCount,
    };
    const updated = [newSnapshot, ...versionHistory.slice(0, 14)];
    setVersionHistory(updated);
    localStorage.setItem("docuflow_version_history", JSON.stringify(updated));

    setTimeout(() => {
      setSaveStatus("saved");
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setStatusMessage("Document snapshot saved to version history.");
      setTimeout(() => setStatusMessage(null), 3000);
    }, 400);
  };

  // =========================================================================
  // 3. EDITING & FORMATTING ENGINE
  // =========================================================================
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
        format(
          "insertHTML",
          `<h1 style="color: #0F172A; font-size: 26pt; font-weight: 800; border-bottom: 2px solid #DC2626; padding-bottom: 4px; margin-bottom: 12px;">${
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
          `<blockquote style="border-left: 4px solid #DC2626; background: #FEF2F2; color: #991B1B; padding: 12px 18px; margin: 14px 0; font-weight: 500;">${
            window.getSelection()?.toString() || "Important highlighted quote"
          }</blockquote>`
        );
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

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;"><tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="border: 1px solid #CBD5E1; padding: 8px; min-width: 60px;">${
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
    const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #DC2626; text-decoration: underline;">${textToDisplay}</a>`;
    format("insertHTML", linkHtml);
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const insertPageBreak = () => {
    const pageBreakHtml = `<div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #DC2626; margin: 36px 0; text-align: center;"><span style="background: #FEE2E2; color: #DC2626; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 4px; letter-spacing: 0.05em;">PAGE BREAK</span></div><p><br/></p>`;
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

  const insertSpecialSymbol = (symbol: string) => {
    format("insertText", symbol);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const imgHtml = `<img src="${reader.result}" style="max-width: 100%; height: auto; margin: 14px 0; border: 1px solid #CBD5E1; border-radius: 4px;" alt="User upload"/><p><br/></p>`;
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

    let tocHtml = `<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #DC2626; padding: 18px 24px; margin: 20px 0; border-radius: 6px;">
      <h3 style="color: #0F172A; font-size: 14pt; font-weight: bold; margin: 0 0 12px 0;">Table of Contents</h3>
      <div style="font-size: 11pt; line-height: 1.8;">`;

    headings.forEach((h, index) => {
      const level = parseInt(h.tagName.substring(1), 10);
      const indent = (level - 1) * 20;
      const title = h.textContent || `Section ${index + 1}`;
      tocHtml += `<div style="padding-left: ${indent}px; display: flex; justify-content: space-between; border-bottom: 1px dotted #CBD5E1;">
        <span style="color: #1E293B; font-weight: ${level === 1 ? "bold" : "normal"};">${title}</span>
        <span style="color: #64748B;">p. ${Math.min(level, pageCount)}</span>
      </div>`;
    });

    tocHtml += `</div></div><p><br/></p>`;
    format("insertHTML", tocHtml);
    setStatusMessage("Table of Contents inserted successfully.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const insertCitation = () => {
    if (!citationAuthor.trim() || !citationTitle.trim()) return;
    let formattedCitation = "";
    const year = citationYear.trim() || "n.d.";

    if (citationType === "APA") {
      formattedCitation = `(${citationAuthor}, ${year})`;
    } else if (citationType === "MLA") {
      formattedCitation = `(${citationAuthor} ${year})`;
    } else if (citationType === "IEEE") {
      formattedCitation = `[1] ${citationAuthor}, "${citationTitle}," ${year}.`;
    } else {
      formattedCitation = `(${citationAuthor} ${year}, "${citationTitle}")`;
    }

    format("insertText", formattedCitation);
    setShowCitationModal(false);
    setCitationAuthor("");
    setCitationTitle("");
    setCitationYear("");
  };

  // =========================================================================
  // 6. MAILINGS TAB (Real Working Mail Merge)
  // =========================================================================
  const insertMergeField = (fieldName: string) => {
    format("insertText", `{{${fieldName}}}`);
  };

  const toggleMergePreview = () => {
    if (!editorRef.current) return;
    if (!previewMergeResults) {
      // Save backup and swap merge tags with active recipient data
      setBackupBeforeMerge(editorRef.current.innerHTML);
      const contact = mergeContacts[activeRecipientIndex];
      let previewHtml = editorRef.current.innerHTML
        .replace(/\{\{First_Name\}\}/g, contact.firstName)
        .replace(/\{\{Last_Name\}\}/g, contact.lastName)
        .replace(/\{\{Email\}\}/g, contact.email)
        .replace(/\{\{Company\}\}/g, contact.company)
        .replace(/\{\{Role\}\}/g, contact.role)
        .replace(/\{\{City\}\}/g, contact.city);

      editorRef.current.innerHTML = previewHtml;
      setPreviewMergeResults(true);
      setStatusMessage(`Previewing merged results for recipient: ${contact.firstName} ${contact.lastName}`);
    } else {
      // Restore template with merge tags
      if (backupBeforeMerge && editorRef.current) {
        editorRef.current.innerHTML = backupBeforeMerge;
      }
      setPreviewMergeResults(false);
      setStatusMessage("Exited Mail Merge preview mode.");
    }
  };

  const generateMergedBatch = () => {
    if (!editorRef.current) return;
    const templateHtml = backupBeforeMerge || editorRef.current.innerHTML;
    let fullMergedBatch = "";

    mergeContacts.forEach((contact, idx) => {
      let pageHtml = templateHtml
        .replace(/\{\{First_Name\}\}/g, contact.firstName)
        .replace(/\{\{Last_Name\}\}/g, contact.lastName)
        .replace(/\{\{Email\}\}/g, contact.email)
        .replace(/\{\{Company\}\}/g, contact.company)
        .replace(/\{\{Role\}\}/g, contact.role)
        .replace(/\{\{City\}\}/g, contact.city);

      if (idx > 0) {
        fullMergedBatch += `<div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #DC2626; margin: 36px 0; text-align: center;"><span style="background: #FEE2E2; color: #DC2626; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 4px;">MERGED LETTER FOR ${contact.firstName.toUpperCase()} ${contact.lastName.toUpperCase()}</span></div>`;
      }
      fullMergedBatch += pageHtml;
    });

    editorRef.current.innerHTML = fullMergedBatch;
    setPreviewMergeResults(false);
    handleInput();
    setStatusMessage(`Generated ${mergeContacts.length} personalized documents in Mail Merge batch.`);
  };

  // =========================================================================
  // 7. REVIEW TAB (Comments, Track Changes, Read Aloud)
  // =========================================================================
  const addComment = () => {
    if (!newCommentText.trim()) return;
    const sel = window.getSelection();
    const selectedSnippet = sel?.toString().trim() || "Document passage";

    const commentItem: CommentItem = {
      id: Date.now().toString(),
      author: "Dinesh Reddy Chada",
      text: newCommentText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      resolved: false,
      replies: [],
    };

    setComments([commentItem, ...comments]);
    setNewCommentText("");
    setShowCommentsPanel(true);
    setStatusMessage(`Comment posted for: "${selectedSnippet.slice(0, 24)}..."`);
  };

  const addCommentReply = (commentId: string) => {
    const text = replyTexts[commentId];
    if (!text || !text.trim()) return;

    setComments(
      comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                { author: "Dinesh Reddy Chada", text: text.trim(), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
              ],
            }
          : c
      )
    );
    setReplyTexts({ ...replyTexts, [commentId]: "" });
  };

  const toggleResolveComment = (commentId: string) => {
    setComments(
      comments.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const deleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  // Read Aloud (Browser SpeechSynthesis)
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

  // =========================================================================
  // 8. DRAW TAB (Freehand Digital Inking Canvas)
  // =========================================================================
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawTool === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawTool === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (drawTool === "eraser") {
      ctx.clearRect(e.clientX - rect.left - 10, e.clientY - rect.top - 10, 20, 20);
    } else {
      ctx.lineWidth = drawSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = drawTool === "highlighter" ? `${drawColor}66` : drawColor;
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
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
        const summaryHtml = `<div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 18px; margin: 16px 0; border-radius: 4px;"><h4 style="color: #991B1B; font-weight: bold; margin: 0 0 6px 0;">DocuFlow AI Executive Summary:</h4><p style="margin: 0; line-height: 1.45; color: #1E293B;">${res.result.replace(/\n/g, "<br/>")}</p></div>`;
        format("insertHTML", summaryHtml);
      } else if (selectedText) {
        format("insertText", res.result);
      }

      setStatusMessage("AI Copilot output generated.");
      setShowAiPanel(true);
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
        setStatusMessage(`Converted ${file.name} to editable document (${res.pageCount} pages).`);
        setShowBackstage(false);
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
      const blob = await exportHtmlToDocxBlob(html, docTitle);
      triggerBlobDownload(blob, `${docTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "DocuFlow_Document"}.docx`);
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
    triggerBlobDownload(blob, `${docTitle}.txt`);
  };

  const handleExportHtml = () => {
    if (!editorRef.current) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docTitle}</title></head><body>${editorRef.current.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    triggerBlobDownload(blob, `${docTitle}.html`);
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

  const getMarginClass = () => {
    switch (pageMargins) {
      case "narrow":
        return "p-8";
      case "wide":
        return "p-20";
      case "moderate":
        return "p-12";
      default:
        return "p-16";
    }
  };

  const getPaperDimensions = () => {
    if (orientation === "landscape") {
      return { width: "1056px", minHeight: "816px" };
    }
    switch (paperSize) {
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

  return (
    <div
      className="w-full h-screen flex flex-col bg-[#070405] text-slate-100 overflow-hidden font-sans select-none relative"
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
    >
      {/* =========================================================================
          1. TOP OBSIDIAN LIQUID-GLASS HEADER BAR
          ========================================================================= */}
      <header className="bg-[#100C0E]/95 backdrop-blur-md border-b border-white/[0.08] text-white flex items-center justify-between px-3 h-10 select-none text-xs shrink-0 z-30 print:hidden shadow-sm">
        {/* Left: Brand Identity & Quick Access */}
        <div className="flex items-center gap-2">
          <Link
            href="/workspace"
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/[0.08] rounded-lg transition-colors group"
            title="Return to Workspace Cockpit"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#DC2626] to-[#EF4444] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
              D
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
              Docu<span className="text-[#DC2626]">Flow</span>
            </span>
          </Link>

          <span className="w-px h-4 bg-white/[0.12] mx-1" />

          {/* Floppy Disk Save */}
          <button
            type="button"
            onClick={handleManualSave}
            className="p-1 hover:bg-white/[0.08] rounded text-white/90 hover:text-white transition-colors"
            title="Save Document & Snapshot (Ctrl+S)"
          >
            <Check className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => format("undo")}
            className="p-1 hover:bg-white/[0.08] rounded text-white/80 hover:text-white"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => format("redo")}
            className="p-1 hover:bg-white/[0.08] rounded text-white/80 hover:text-white"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Autosave Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-white/80 bg-white/[0.05] border border-white/[0.06] px-2 py-0.5 rounded-full ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autosave: {saveStatus === "saving" ? "Saving..." : "On"}</span>
          </div>
        </div>

        {/* Center: Editable Document Name */}
        <div className="flex items-center gap-2 max-w-sm sm:max-w-md truncate">
          <input
            type="text"
            value={docTitle}
            onChange={(e) => {
              setDocTitle(e.target.value);
              setSaveStatus("saving");
              localStorage.setItem("docuflow_document_title", e.target.value);
              setTimeout(() => setSaveStatus("saved"), 450);
            }}
            title="Click to rename document"
            className="bg-transparent hover:bg-white/[0.06] focus:bg-white/[0.1] text-white font-bold text-center px-2 py-0.5 rounded outline-none text-xs sm:text-sm border border-transparent focus:border-[#DC2626]/40 transition-colors truncate"
          />
          <span className="text-[11px] text-white/40 hidden lg:inline">
            ({saveStatus === "saving" ? "Saving..." : `Saved ${lastSavedTime}`})
          </span>
        </div>

        {/* Right: Quick Action Triggers & Author Badge */}
        <div className="flex items-center gap-1.5">
          {/* AI Copilot Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
              showAiPanel
                ? "bg-[#DC2626] text-white shadow-lg shadow-red-600/30"
                : "bg-white/[0.06] hover:bg-white/[0.12] text-white/90"
            }`}
            title="Toggle AI Writing Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Comments Panel Toggle */}
          <button
            type="button"
            onClick={() => setShowCommentsPanel(!showCommentsPanel)}
            className={`p-1.5 rounded transition-colors ${
              showCommentsPanel ? "bg-white/[0.15] text-white" : "hover:bg-white/[0.08] text-white/80"
            }`}
            title="Comments & Collaboration"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Quick Export DOCX */}
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExporting}
            className="hidden sm:inline-flex items-center gap-1 bg-white/[0.08] hover:bg-[#DC2626] text-white font-medium px-2.5 py-1 rounded text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Dinesh Reddy Chada Creator Avatar */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/[0.08] rounded cursor-pointer"
            title="Document Owner: Dinesh Reddy Chada"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#991B1B] text-white flex items-center justify-center font-bold text-[10px] border border-white/20">
              CD
            </div>
            <span className="text-[11px] font-medium hidden xl:inline text-white/90">Dinesh Reddy</span>
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:bg-white/[0.08] rounded text-white/80 hover:text-white"
            title="Fullscreen Mode"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. RIBBON TABS NAVIGATION BAR (10 Core Microsoft Word-Style Tabs)
          ========================================================================= */}
      <nav className="bg-[#0D090B] px-3 flex items-center gap-1 select-none text-xs border-b border-white/[0.08] shrink-0 print:hidden z-20">
        {/* File Backstage Opener */}
        <button
          type="button"
          onClick={() => {
            setShowBackstage(true);
            setBackstageSection("new");
          }}
          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold px-3.5 py-1.5 transition-colors uppercase tracking-wider text-[11px] rounded-t-sm shadow-sm"
        >
          File
        </button>

        {/* 9 Workspace Tabs */}
        {(
          [
            "Home",
            "Insert",
            "Layout",
            "References",
            "Mailings",
            "Review",
            "View",
            "Draw",
            "Help",
          ] as RibbonTab[]
        ).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-sm transition-colors border-b-2 ${
                isActive
                  ? "bg-[#171114] text-white border-[#DC2626]"
                  : "text-white/70 hover:text-white hover:bg-white/[0.04] border-transparent"
              }`}
            >
              {tab}
            </button>
          );
        })}

        {/* Tell Me What You Want To Do Search */}
        <div className="ml-auto hidden md:flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-white/80 px-2.5 py-1 rounded-md text-xs border border-white/[0.06] transition-colors">
          <Search className="w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search features..."
            value={findText}
            onChange={(e) => {
              setFindText(e.target.value);
              setShowFindReplace(true);
            }}
            className="bg-transparent text-white placeholder-white/40 outline-none text-xs w-36"
          />
        </div>
      </nav>

      {/* =========================================================================
          3. RIBBON TOOLBAR BODY (Partitioned Category Groups with Real Functionality)
          ========================================================================= */}
      <div className="bg-[#140E11]/90 backdrop-blur-sm border-b border-white/[0.08] px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto min-h-[96px] select-none text-xs shrink-0 print:hidden z-10">
        {/* ----------------- TAB: HOME ----------------- */}
        {activeTab === "Home" && (
          <div className="flex items-stretch gap-2">
            {/* Clipboard Group */}
            <div className="flex flex-col justify-between items-center pr-2 border-r border-white/[0.08]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.readText().then((txt) => {
                      if (txt) format("insertText", txt);
                    }).catch(() => alert("Use Ctrl+V to paste directly into the document."));
                  }}
                  className="flex flex-col items-center justify-center p-1.5 hover:bg-white/[0.08] rounded text-white/90 w-11"
                  title="Paste (Ctrl+V)"
                >
                  <ClipboardPaste className="w-5 h-5 text-[#DC2626]" />
                  <span className="text-[10px] mt-0.5">Paste</span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => format("cut")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/80 flex items-center gap-1 text-[11px]"
                    title="Cut (Ctrl+X)"
                  >
                    <Scissors className="w-3 h-3 text-white/60" />
                    <span>Cut</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("copy")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/80 flex items-center gap-1 text-[11px]"
                    title="Copy (Ctrl+C)"
                  >
                    <Copy className="w-3 h-3 text-white/60" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => format("formatBlock", "p")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/80 flex items-center gap-1 text-[11px]"
                    title="Format Painter"
                  >
                    <Paintbrush className="w-3 h-3 text-amber-400" />
                    <span>Painter</span>
                  </button>
                </div>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Clipboard</span>
            </div>

            {/* Font Formatting Group */}
            <div className="flex flex-col justify-between items-center px-2 border-r border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <select
                    value={fontFamily}
                    onChange={(e) => applyFontFamily(e.target.value)}
                    className="bg-[#1C1417] border border-white/[0.1] rounded px-1.5 py-0.5 text-xs text-white outline-none w-28"
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
                    value={fontSize}
                    onChange={(e) => applyFontSize(e.target.value)}
                    className="bg-[#1C1417] border border-white/[0.1] rounded px-1.5 py-0.5 text-xs text-white outline-none w-14"
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
                    className="p-1 hover:bg-white/[0.08] rounded text-white font-bold text-xs"
                    title="Increase Font Size (Ctrl+Shift+>)"
                  >
                    A^
                  </button>
                  <button
                    type="button"
                    onClick={() => format("fontSize", "2")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white font-bold text-xs"
                    title="Decrease Font Size (Ctrl+Shift+<)"
                  >
                    Av
                  </button>

                  <button
                    type="button"
                    onClick={() => changeCase("upper")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90 font-semibold text-[11px]"
                    title="UPPERCASE"
                  >
                    AA
                  </button>
                  <button
                    type="button"
                    onClick={() => format("removeFormat")}
                    className="p-1 hover:bg-white/[0.08] rounded text-rose-400 font-semibold text-[11px]"
                    title="Clear Formatting"
                  >
                    A\
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("bold")}
                    className="p-1 hover:bg-white/[0.08] rounded font-bold text-white/90"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("italic")}
                    className="p-1 hover:bg-white/[0.08] rounded italic text-white/90"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("underline")}
                    className="p-1 hover:bg-white/[0.08] rounded underline text-white/90"
                    title="Underline (Ctrl+U)"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("strikeThrough")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("subscript")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Subscript"
                  >
                    <Subscript className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("superscript")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Superscript"
                  >
                    <Superscript className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-px h-4 bg-white/[0.1] mx-0.5" />

                  {/* Highlight Color */}
                  <label className="flex items-center gap-0.5 p-1 hover:bg-white/[0.08] rounded cursor-pointer" title="Highlight Color">
                    <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                    <input
                      type="color"
                      defaultValue="#FFFF00"
                      onChange={(e) => format("hiliteColor", e.target.value)}
                      className="w-3.5 h-3.5 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </label>

                  {/* Font Color */}
                  <label className="flex items-center gap-0.5 p-1 hover:bg-white/[0.08] rounded cursor-pointer" title="Font Color">
                    <Palette className="w-3.5 h-3.5 text-[#DC2626]" />
                    <input
                      type="color"
                      defaultValue="#000000"
                      onChange={(e) => format("foreColor", e.target.value)}
                      className="w-3.5 h-3.5 p-0 border-0 bg-transparent cursor-pointer"
                    />
                  </label>
                </div>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Font</span>
            </div>

            {/* Paragraph Formatting Group */}
            <div className="flex flex-col justify-between items-center px-2 border-r border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("insertUnorderedList")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Bullets"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("insertOrderedList")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Numbering"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("outdent")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Decrease Indent"
                  >
                    <Outdent className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("indent")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Increase Indent"
                  >
                    <Indent className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => format("justifyLeft")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Align Left"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("justifyCenter")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Align Center"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("justifyRight")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Align Right"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => format("justifyFull")}
                    className="p-1 hover:bg-white/[0.08] rounded text-white/90"
                    title="Justify"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Paragraph</span>
            </div>

            {/* Styles Gallery Group */}
            <div className="flex flex-col justify-between items-center px-2 border-r border-white/[0.08]">
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
                    className="flex flex-col items-center justify-center border border-white/[0.08] bg-[#181114] hover:bg-[#DC2626]/20 hover:border-[#DC2626]/40 px-2 py-1 rounded min-w-[52px] text-left transition-colors"
                  >
                    <span className="text-xs font-bold text-white">{st.title}</span>
                    <span className="text-[9px] text-white/50 truncate">{st.label}</span>
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-white/40 font-medium">Styles Gallery</span>
            </div>

            {/* Editing Group */}
            <div className="flex flex-col justify-between items-center px-2">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setShowFindReplace(!showFindReplace)}
                  className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/[0.08] rounded text-white/80"
                >
                  <Search className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Find</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFindReplace(true)}
                  className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/[0.08] rounded text-white/80"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => format("selectAll")}
                  className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/[0.08] rounded text-white/80"
                >
                  <span>Select All</span>
                </button>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Editing</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: INSERT ----------------- */}
        {activeTab === "Insert" && (
          <div className="flex items-stretch gap-3">
            {/* Pages */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={insertPageBreak}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-16"
                  title="Insert Page Break"
                >
                  <Layers className="w-5 h-5 text-[#DC2626]" />
                  <span className="text-[10px] mt-0.5">Page Break</span>
                </button>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Pages</span>
            </div>

            {/* Tables */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowTableModal(true)}
                className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-16"
                title="Insert Table Grid"
              >
                <TableIcon className="w-5 h-5 text-[#DC2626]" />
                <span className="text-[10px] mt-0.5">Table</span>
              </button>
              <span className="text-[9px] text-white/40 font-medium">Tables</span>
            </div>

            {/* Illustrations */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <label className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-16 cursor-pointer">
                <ImageIcon className="w-5 h-5 text-[#DC2626]" />
                <span className="text-[10px] mt-0.5">Pictures</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[9px] text-white/40 font-medium">Illustrations</span>
            </div>

            {/* Links & Elements */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(true)}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-14"
                  title="Insert Hyperlink"
                >
                  <LinkIcon className="w-5 h-5 text-[#DC2626]" />
                  <span className="text-[10px] mt-0.5">Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => format("insertHorizontalRule")}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-14"
                  title="Horizontal Divider"
                >
                  <Minus className="w-5 h-5 text-white/60" />
                  <span className="text-[10px] mt-0.5">Divider</span>
                </button>
                <button
                  type="button"
                  onClick={insertDateTime}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-14"
                  title="Date and Time"
                >
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px] mt-0.5">Date</span>
                </button>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Elements</span>
            </div>

            {/* Special Symbols */}
            <div className="flex flex-col justify-between items-center">
              <div className="grid grid-cols-5 gap-1 pt-1">
                {["©", "®", "™", "€", "£", "¥", "•", "—", "✓", "★", "∑", "∏", "√", "π", "∞"].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => insertSpecialSymbol(sym)}
                    className="w-6 h-6 bg-white/[0.05] hover:bg-white/[0.12] rounded flex items-center justify-center text-xs font-mono text-white/90"
                    title={`Insert ${sym}`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-white/40 font-medium">Symbols</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: LAYOUT ----------------- */}
        {activeTab === "Layout" && (
          <div className="flex items-stretch gap-3">
            {/* Margins */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-white/60">Margins:</label>
                <select
                  value={pageMargins}
                  onChange={(e: any) => setPageMargins(e.target.value)}
                  className="bg-[#1C1417] border border-white/[0.1] rounded px-2 py-0.5 text-xs text-white outline-none"
                >
                  <option value="normal">Normal (1 in / 2.54 cm)</option>
                  <option value="narrow">Narrow (0.5 in / 1.27 cm)</option>
                  <option value="moderate">Moderate (0.75 in)</option>
                  <option value="wide">Wide (1.5 in)</option>
                </select>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Margins</span>
            </div>

            {/* Orientation & Size */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-white/60">Orientation:</label>
                  <select
                    value={orientation}
                    onChange={(e: any) => setOrientation(e.target.value)}
                    className="bg-[#1C1417] border border-white/[0.1] rounded px-2 py-0.5 text-xs text-white outline-none"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-white/60">Size:</label>
                  <select
                    value={paperSize}
                    onChange={(e: any) => setPaperSize(e.target.value)}
                    className="bg-[#1C1417] border border-white/[0.1] rounded px-2 py-0.5 text-xs text-white outline-none"
                  >
                    <option value="a4">A4 (210 × 297 mm)</option>
                    <option value="letter">Letter (8.5 × 11 in)</option>
                    <option value="legal">Legal (8.5 × 14 in)</option>
                    <option value="a3">A3 (297 × 420 mm)</option>
                    <option value="a5">A5 (148 × 210 mm)</option>
                  </select>
                </div>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Page Setup</span>
            </div>

            {/* Watermark & Page Color */}
            <div className="flex flex-col justify-between items-center">
              <div className="flex items-center gap-2 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-white/60">Watermark:</label>
                  <select
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="bg-[#1C1417] border border-white/[0.1] rounded px-2 py-0.5 text-xs text-white outline-none w-28"
                  >
                    <option value="">None</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="SAMPLE">SAMPLE</option>
                    <option value="DO NOT COPY">DO NOT COPY</option>
                  </select>
                </div>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Page Background</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: REFERENCES ----------------- */}
        {activeTab === "References" && (
          <div className="flex items-stretch gap-3">
            {/* Table of Contents */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <button
                type="button"
                onClick={generateTableOfContents}
                className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-24"
                title="Automatically generate Table of Contents from headings"
              >
                <BookOpen className="w-5 h-5 text-[#DC2626]" />
                <span className="text-[10px] mt-0.5 font-semibold">Table of Contents</span>
              </button>
              <span className="text-[9px] text-white/40 font-medium">Table of Contents</span>
            </div>

            {/* Citations & Bibliography */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowCitationModal(true)}
                className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-20"
                title="Insert Citation (APA, MLA, IEEE, Chicago)"
              >
                <Bookmark className="w-5 h-5 text-amber-400" />
                <span className="text-[10px] mt-0.5 font-semibold">Add Citation</span>
              </button>
              <span className="text-[9px] text-white/40 font-medium">Citations</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: MAILINGS (Mail Merge Engine) ----------------- */}
        {activeTab === "Mailings" && (
          <div className="flex items-stretch gap-3">
            {/* Insert Merge Fields */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <div className="flex items-center gap-1">
                {["First_Name", "Last_Name", "Company", "Role", "Email", "City"].map((field) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => insertMergeField(field)}
                    className="px-2 py-1 bg-white/[0.06] hover:bg-[#DC2626] text-white rounded text-[11px] font-mono transition-colors"
                    title={`Insert {{${field}}}`}
                  >
                    +{field}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-white/40 font-medium">Merge Fields</span>
            </div>

            {/* Preview & Batch Generator */}
            <div className="flex flex-col justify-between items-center">
              <div className="flex items-center gap-2">
                <select
                  value={activeRecipientIndex}
                  onChange={(e) => setActiveRecipientIndex(parseInt(e.target.value, 10))}
                  className="bg-[#1C1417] border border-white/[0.1] rounded px-2 py-1 text-xs text-white outline-none"
                >
                  {mergeContacts.map((c, idx) => (
                    <option key={c.id} value={idx}>
                      Recipient #{idx + 1}: {c.firstName} {c.lastName} ({c.company})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={toggleMergePreview}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    previewMergeResults ? "bg-amber-500 text-slate-900" : "bg-white/[0.08] hover:bg-white/[0.15] text-white"
                  }`}
                >
                  {previewMergeResults ? "Exit Preview" : "Preview Results"}
                </button>

                <button
                  type="button"
                  onClick={generateMergedBatch}
                  className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded text-xs shadow-sm"
                >
                  Finish & Merge All ({mergeContacts.length})
                </button>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Mail Merge Execution</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: REVIEW ----------------- */}
        {activeTab === "Review" && (
          <div className="flex items-stretch gap-3">
            {/* Word Count */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowWordCountModal(true)}
                className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-16"
                title="Document Word Count & Statistics"
              >
                <FileText className="w-5 h-5 text-[#DC2626]" />
                <span className="text-[10px] mt-0.5">Word Count</span>
              </button>
              <span className="text-[9px] text-white/40 font-medium">Proofing</span>
            </div>

            {/* Read Aloud */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <button
                type="button"
                onClick={toggleReadAloud}
                className={`flex flex-col items-center justify-center p-2 rounded text-white/90 w-16 transition-colors ${
                  isSpeaking ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "hover:bg-white/[0.08]"
                }`}
                title="Read Document Aloud (Text to Speech)"
              >
                {isSpeaking ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5 text-[#DC2626]" />}
                <span className="text-[10px] mt-0.5">{isSpeaking ? "Stop" : "Read Aloud"}</span>
              </button>
              <span className="text-[9px] text-white/40 font-medium">Speech</span>
            </div>

            {/* Comments Toggle */}
            <div className="flex flex-col justify-between items-center">
              <button
                type="button"
                onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-16"
              >
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] mt-0.5">Comments ({comments.length})</span>
              </button>
              <span className="text-[9px] text-white/40 font-medium">Collaboration</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: VIEW ----------------- */}
        {activeTab === "View" && (
          <div className="flex items-stretch gap-3">
            {/* Views */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode("print")}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    viewMode === "print" ? "bg-[#DC2626] text-white" : "bg-white/[0.06] text-white/80"
                  }`}
                >
                  Print Layout
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("read")}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    viewMode === "read" ? "bg-[#DC2626] text-white" : "bg-white/[0.06] text-white/80"
                  }`}
                >
                  Read Mode
                </button>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Views</span>
            </div>

            {/* Show / Hide */}
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRuler}
                    onChange={(e) => setShowRuler(e.target.checked)}
                    className="rounded text-[#DC2626]"
                  />
                  <span>Ruler</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOutline}
                    onChange={(e) => setShowOutline(e.target.checked)}
                    className="rounded text-[#DC2626]"
                  />
                  <span>Navigation</span>
                </label>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Show</span>
            </div>

            {/* Zoom Controls */}
            <div className="flex flex-col justify-between items-center">
              <div className="flex items-center gap-1">
                {[75, 100, 125].map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZoom(z)}
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      zoom === z ? "bg-[#DC2626] text-white" : "bg-white/[0.06] text-white/80 hover:bg-white/[0.1]"
                    }`}
                  >
                    {z}%
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-white/40 font-medium">Zoom</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: DRAW (Freehand Inking) ----------------- */}
        {activeTab === "Draw" && (
          <div className="flex items-stretch gap-3">
            <div className="flex flex-col justify-between items-center pr-3 border-r border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDrawTool("pen")}
                  className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${
                    drawTool === "pen" ? "bg-[#DC2626] text-white" : "hover:bg-white/[0.08] text-white/80"
                  }`}
                  title="Draw with Pen"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Pen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawTool("highlighter")}
                  className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${
                    drawTool === "highlighter" ? "bg-amber-500 text-slate-900" : "hover:bg-white/[0.08] text-white/80"
                  }`}
                  title="Draw with Highlighter"
                >
                  <Highlighter className="w-4 h-4" />
                  <span>Highlight</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDrawTool("eraser")}
                  className={`p-2 rounded text-xs flex flex-col items-center gap-1 ${
                    drawTool === "eraser" ? "bg-white/[0.2] text-white" : "hover:bg-white/[0.08] text-white/80"
                  }`}
                  title="Eraser"
                >
                  <Eraser className="w-4 h-4" />
                  <span>Eraser</span>
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="p-2 hover:bg-white/[0.08] rounded text-rose-400 text-xs flex flex-col items-center gap-1"
                  title="Clear Ink Overlay"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Drawing Tools</span>
            </div>

            {/* Colors & Width */}
            <div className="flex flex-col justify-between items-center">
              <div className="flex items-center gap-2 pt-1">
                {["#DC2626", "#2563EB", "#16A34A", "#EAB308", "#000000"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDrawColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full border ${drawColor === c ? "ring-2 ring-white" : "border-white/20"}`}
                  />
                ))}
                <select
                  value={drawSize}
                  onChange={(e) => setDrawSize(parseInt(e.target.value, 10))}
                  className="bg-[#1C1417] border border-white/[0.1] rounded px-2 py-0.5 text-xs text-white outline-none ml-2"
                >
                  <option value="2">Thin (2px)</option>
                  <option value="4">Medium (4px)</option>
                  <option value="8">Thick (8px)</option>
                </select>
              </div>
              <span className="text-[9px] text-white/40 font-medium">Color & Thickness</span>
            </div>
          </div>
        )}

        {/* ----------------- TAB: HELP ----------------- */}
        {activeTab === "Help" && (
          <div className="flex items-stretch gap-3">
            <button
              type="button"
              onClick={() => setShowShortcutsModal(true)}
              className="flex flex-col items-center justify-center p-2 hover:bg-white/[0.08] rounded text-white/90 w-24"
            >
              <HelpCircle className="w-5 h-5 text-[#DC2626]" />
              <span className="text-[10px] mt-0.5 font-semibold">Shortcuts (Ctrl+?)</span>
            </button>
            <div className="flex flex-col justify-center text-xs text-white/60">
              <p className="font-bold text-white">DocuFlow Document Studio</p>
              <p>Created by Dinesh Reddy Chada • 100% Client-Side Privacy Assured</p>
            </div>
          </div>
        )}
      </div>

      {/* Find and Replace Bar */}
      {showFindReplace && (
        <div className="bg-[#181114] border-b border-white/[0.08] px-6 py-2 flex items-center gap-3 text-xs shrink-0 print:hidden z-10">
          <span className="font-bold text-white/80">Find:</span>
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Text to find..."
            className="px-2.5 py-1 rounded bg-[#070405] border border-white/[0.1] text-white outline-none w-44"
          />
          <button
            type="button"
            onClick={handleFind}
            className="bg-white/[0.08] hover:bg-white/[0.15] text-white px-2.5 py-1 rounded font-semibold"
          >
            Find Next {matchCount > 0 && `(${matchCount})`}
          </button>
          <span className="font-bold text-white/80 ml-2">Replace:</span>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replacement..."
            className="px-2.5 py-1 rounded bg-[#070405] border border-white/[0.1] text-white outline-none w-44"
          />
          <button
            type="button"
            onClick={handleReplaceAll}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3 py-1 rounded font-semibold transition-colors"
          >
            Replace All
          </button>
          <button
            type="button"
            onClick={() => setShowFindReplace(false)}
            className="p-1 text-white/40 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Status Banner */}
      {statusMessage && (
        <div className="bg-[#DC2626]/20 border-b border-[#DC2626]/40 px-6 py-1.5 text-xs text-red-200 flex items-center justify-between shrink-0 print:hidden z-10">
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
        <div className="bg-[#100C0E] border-b border-white/[0.08] h-5 flex items-center justify-center select-none text-[9px] text-white/40 overflow-hidden shrink-0 print:hidden">
          <div
            className="flex items-center justify-between text-white/30 font-mono tracking-widest px-4"
            style={{ width: getPaperDimensions().width }}
          >
            <span>|····1····|····2····|····3····|····4····|····5····|····6····|····7····|····8····|</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. DOCUMENT CANVAS WORKSPACE (Deep Obsidian Workspace + Solid White Paper)
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Pane (Outline) */}
        {showOutline && (
          <aside className="w-64 bg-[#100C0E] border-r border-white/[0.08] p-4 space-y-4 overflow-y-auto shrink-0 print:hidden text-white/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/50">
                Navigation Pane
              </h4>
              <button
                type="button"
                onClick={() => setShowOutline(false)}
                className="text-white/40 hover:text-white"
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
                    className="truncate text-white/70 hover:text-[#DC2626] cursor-pointer py-0.5 transition-colors"
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
              <p className="text-xs text-white/40 italic">
                Document headings (H1, H2, H3) will appear here.
              </p>
            )}
          </aside>
        )}

        {/* Center Paper Canvas Workspace */}
        <div className="flex-1 overflow-auto p-6 sm:p-10 flex justify-center bg-[#070405] relative">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              width: getPaperDimensions().width,
              minHeight: getPaperDimensions().minHeight,
              backgroundColor: pageBgColor,
            }}
            className={`word-canvas-sheet text-black ${getMarginClass()} transition-transform duration-100 ease-out border border-white/20 print:p-0 print:border-none print:shadow-none print:w-full my-4 relative`}
          >
            {/* Watermark Overlay */}
            {watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <span className="text-slate-300 font-extrabold text-7xl uppercase -rotate-45 tracking-widest opacity-25">
                  {watermarkText}
                </span>
              </div>
            )}

            {/* Drawing Canvas Overlay */}
            {drawTool !== "none" && (
              <canvas
                ref={canvasRef}
                width={parseInt(getPaperDimensions().width, 10)}
                height={parseInt(getPaperDimensions().minHeight, 10)}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="absolute inset-0 z-20 cursor-crosshair"
              />
            )}

            {/* The Solid Editable Document */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              style={{
                fontFamily: `${fontFamily}, Calibri, Segoe UI, sans-serif`,
              }}
              className="outline-none min-h-[900px] text-black prose max-w-none focus:outline-none relative z-10"
            />
          </div>
        </div>

        {/* Right Collapsible AI Writing Copilot Drawer */}
        {showAiPanel && (
          <aside className="w-80 sm:w-96 bg-[#100C0E] border-l border-white/[0.08] flex flex-col shrink-0 print:hidden z-20">
            <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                <Sparkles className="w-4 h-4 text-[#DC2626]" />
                <span>AI Writing Assistant</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiPanel(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt Pills */}
            <div className="p-3 border-b border-white/[0.08] grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction("rewrite")}
                className="px-2.5 py-1.5 bg-white/[0.05] hover:bg-[#DC2626]/20 border border-white/[0.08] hover:border-[#DC2626]/40 text-xs rounded text-white/90 text-left font-medium transition-colors"
              >
                ✨ Polish Selection
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction("grammar")}
                className="px-2.5 py-1.5 bg-white/[0.05] hover:bg-emerald-600/20 border border-white/[0.08] hover:border-emerald-500/40 text-xs rounded text-white/90 text-left font-medium transition-colors"
              >
                ✓ Fix Grammar
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction("summarize")}
                className="px-2.5 py-1.5 bg-white/[0.05] hover:bg-amber-600/20 border border-white/[0.08] hover:border-amber-500/40 text-xs rounded text-white/90 text-left font-medium transition-colors"
              >
                📋 Executive Summary
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={() => handleAiAction("expand")}
                className="px-2.5 py-1.5 bg-white/[0.05] hover:bg-indigo-600/20 border border-white/[0.08] hover:border-indigo-500/40 text-xs rounded text-white/90 text-left font-medium transition-colors"
              >
                📈 Expand Points
              </button>
            </div>

            {/* AI Chat History */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#DC2626]/15 border border-[#DC2626]/30 text-white ml-4"
                      : "bg-white/[0.04] border border-white/[0.06] text-white/90 mr-4"
                  }`}
                >
                  <p className="font-bold text-[10px] uppercase text-white/40 mb-1">
                    {msg.role === "user" ? "You" : "DocuFlow Copilot"}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-400 p-2 animate-pulse">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating intelligent content...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/[0.08] flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask AI to write, rewrite, or analyze..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && aiPrompt.trim()) {
                    handleAiAction("custom", aiPrompt);
                    setAiPrompt("");
                  }
                }}
                className="flex-1 bg-[#171114] border border-white/[0.1] rounded px-3 py-1.5 text-xs text-white outline-none focus:border-[#DC2626]"
              />
              <button
                type="button"
                disabled={aiLoading || !aiPrompt.trim()}
                onClick={() => {
                  handleAiAction("custom", aiPrompt);
                  setAiPrompt("");
                }}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
              >
                Ask
              </button>
            </div>
          </aside>
        )}

        {/* Right Collapsible Comments Panel */}
        {showCommentsPanel && (
          <aside className="w-72 sm:w-80 bg-[#100C0E] border-l border-white/[0.08] flex flex-col shrink-0 print:hidden z-20">
            <div className="p-3 border-b border-white/[0.08] flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Comments ({comments.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowCommentsPanel(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post New Comment */}
            <div className="p-3 border-b border-white/[0.08] space-y-2">
              <textarea
                placeholder="Add comment on selected passage..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full bg-[#171114] border border-white/[0.1] rounded p-2 text-xs text-white outline-none focus:border-[#DC2626] h-16 resize-none"
              />
              <button
                type="button"
                onClick={addComment}
                className="w-full py-1.5 bg-[#DC2626] text-white rounded text-xs font-bold hover:bg-[#B91C1C] transition-colors"
              >
                Post Comment
              </button>
            </div>

            {/* Comment Threads */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg border space-y-2 ${
                    c.resolved ? "bg-white/[0.02] border-white/[0.05] opacity-60" : "bg-white/[0.04] border-white/[0.08]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white/90">{c.author}</span>
                    <span className="text-[10px] text-white/40">{c.timestamp}</span>
                  </div>
                  <p className="text-white/80">{c.text}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleResolveComment(c.id)}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      {c.resolved ? "Reopen" : "✓ Resolve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteComment(c.id)}
                      className="text-[11px] text-rose-400 hover:underline ml-auto"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Replies */}
                  {c.replies.map((r, ri) => (
                    <div key={ri} className="pl-3 border-l-2 border-white/[0.1] text-[11px] space-y-0.5">
                      <span className="font-semibold text-white/80">{r.author}:</span>
                      <p className="text-white/70">{r.text}</p>
                    </div>
                  ))}

                  <div className="flex items-center gap-1 pt-1">
                    <input
                      type="text"
                      placeholder="Reply..."
                      value={replyTexts[c.id] || ""}
                      onChange={(e) => setReplyTexts({ ...replyTexts, [c.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCommentReply(c.id);
                      }}
                      className="flex-1 bg-[#171114] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addCommentReply(c.id)}
                      className="px-2 py-1 bg-white/[0.08] hover:bg-white/[0.15] text-white rounded text-[11px]"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Drag & Drop Upload Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-[#070405]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white p-6 border-4 border-dashed border-[#DC2626]">
            <Upload className="w-16 h-16 mb-4 text-[#DC2626] animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Drop Word Document or PDF Here</h2>
            <p className="text-sm text-white/70">DocuFlow will immediately convert your document for live editing.</p>
          </div>
        )}
      </div>

      {/* =========================================================================
          6. BOTTOM OBSIDIAN STATUS BAR
          ========================================================================= */}
      <footer className="bg-[#100C0E] border-t border-white/[0.08] text-white flex items-center justify-between px-3 h-7 select-none text-[11px] shrink-0 print:hidden z-20">
        {/* Left Metrics */}
        <div className="flex items-center gap-3 text-white/70">
          <span>Page 1 of {pageCount}</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowWordCountModal(true)}
            className="hover:text-white font-medium hover:underline"
          >
            {wordCount} words
          </button>
          <span>•</span>
          <span>{charCount} characters</span>
          {selectedWordCount > 0 && (
            <>
              <span>•</span>
              <span className="text-red-400 font-semibold">{selectedWordCount} words selected</span>
            </>
          )}
          <span>•</span>
          <span className="hidden sm:inline flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" /> English (United States)
          </span>
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="px-1.5 hover:bg-white/[0.1] rounded font-bold text-white/80"
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
            className="w-20 accent-[#DC2626] h-1 cursor-pointer"
            title={`Zoom: ${zoom}%`}
          />
          <button
            type="button"
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="px-1.5 hover:bg-white/[0.1] rounded font-bold text-white/80"
            title="Zoom In"
          >
            +
          </button>
          <span className="w-9 text-right font-medium text-white/90">{zoom}%</span>
        </div>
      </footer>

      {/* =========================================================================
          7. BACKSTAGE OVERLAY (File Menu View)
          ========================================================================= */}
      {showBackstage && (
        <div className="fixed inset-0 z-50 bg-[#070405] flex flex-col md:flex-row animate-fade-in text-slate-100">
          {/* Left Dark Obsidian Sidebar */}
          <div className="w-full md:w-64 bg-[#100C0E] border-r border-white/[0.08] text-white p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowBackstage(false)}
                className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.12] rounded-lg font-bold text-sm w-full transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[#DC2626]" />
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
                ].map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBackstageSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      backstageSection === item.id
                        ? "bg-[#DC2626] text-white"
                        : "hover:bg-white/[0.06] text-white/70"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/[0.08] text-xs text-white/50">
              <p className="font-bold text-white/80">DocuFlow Studio</p>
              <p>Created by Dinesh Reddy Chada</p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#070405]">
            {/* NEW SECTION / TEMPLATES GALLERY */}
            {backstageSection === "new" && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">Document Templates</h2>
                  <p className="text-sm text-white/60">Choose from Student, Professional, or Personal templates, or start fresh.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Blank */}
                  <div
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.innerHTML = "<p>Start typing your new document here...</p>";
                        setDocTitle("Untitled Document");
                        handleInput();
                        setShowBackstage(false);
                      }
                    }}
                    className="p-5 border-2 border-dashed border-white/[0.12] hover:border-[#DC2626] bg-[#100C0E] rounded-xl cursor-pointer hover:shadow-lg transition-all flex flex-col items-center justify-center min-h-[160px] text-center"
                  >
                    <FilePlus className="w-10 h-10 text-white/40 mb-2" />
                    <span className="font-bold text-sm text-white">Blank Document</span>
                    <span className="text-xs text-white/40 mt-1">Clean slate</span>
                  </div>

                  {/* Template Cards */}
                  {TEMPLATES.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      onClick={() => {
                        if (editorRef.current) {
                          editorRef.current.innerHTML = tmpl.html;
                          setDocTitle(tmpl.title);
                          handleInput();
                          setShowBackstage(false);
                        }
                      }}
                      className="p-5 border border-white/[0.08] hover:border-[#DC2626] bg-[#100C0E] rounded-xl cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between min-h-[160px]"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">{tmpl.category}</span>
                        <h4 className="font-bold text-sm text-white mt-1">{tmpl.title}</h4>
                        <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{tmpl.desc}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-white/70 mt-3">Use Template →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OPEN SECTION */}
            {backstageSection === "open" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">Open Document</h2>
                  <p className="text-sm text-white/60">Import and edit any Microsoft Word (.docx) or PDF file directly.</p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-10 border-2 border-dashed border-[#DC2626] bg-[#DC2626]/5 hover:bg-[#DC2626]/10 rounded-2xl cursor-pointer text-center space-y-3 transition-colors"
                >
                  <Upload className="w-12 h-12 text-[#DC2626] mx-auto" />
                  <h3 className="font-bold text-base text-white">Select DOCX or PDF from computer</h3>
                  <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                    PDFs are converted into editable Word paragraphs, headings, bullet points, and tables. All processing happens safely inside your browser.
                  </p>
                  <button
                    type="button"
                    className="bg-[#DC2626] text-white px-5 py-2 rounded-lg font-bold text-xs shadow-sm"
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
            {backstageSection === "export" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">Export & Download</h2>
                  <p className="text-sm text-white/60">Save your document to standard file formats.</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    className="w-full p-4 bg-[#100C0E] border border-white/[0.08] hover:border-[#DC2626] rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-8 h-8 text-[#DC2626]" />
                      <div>
                        <h4 className="font-bold text-sm text-white">Microsoft Word Document (.docx)</h4>
                        <p className="text-xs text-white/50">Full desktop Word compatibility with preserved tables, headings, and formatting.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-white/40" />
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintOrPdf}
                    className="w-full p-4 bg-[#100C0E] border border-white/[0.08] hover:border-emerald-500 rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Printer className="w-8 h-8 text-emerald-400" />
                      <div>
                        <h4 className="font-bold text-sm text-white">Export as PDF (.pdf)</h4>
                        <p className="text-xs text-white/50">Print-ready standard PDF generated via browser rendering engine.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-white/40" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportTxt}
                    className="w-full p-4 bg-[#100C0E] border border-white/[0.08] hover:border-white/40 rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-white/60" />
                      <div>
                        <h4 className="font-bold text-sm text-white">Plain Text (.txt)</h4>
                        <p className="text-xs text-white/50">Clean unformatted text for transcripts and notes.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-white/40" />
                  </button>

                  <button
                    type="button"
                    onClick={handleExportHtml}
                    className="w-full p-4 bg-[#100C0E] border border-white/[0.08] hover:border-amber-500 rounded-xl flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-amber-400" />
                      <div>
                        <h4 className="font-bold text-sm text-white">Web Page Document (.html)</h4>
                        <p className="text-xs text-white/50">Standard HTML markup with preserved typography and structure.</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              </div>
            )}

            {/* VERSIONS SECTION */}
            {backstageSection === "versions" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">Version History</h2>
                  <p className="text-sm text-white/60">Restore or view previously saved document snapshots.</p>
                </div>

                {versionHistory.length > 0 ? (
                  <div className="space-y-2">
                    {versionHistory.map((v) => (
                      <div
                        key={v.id}
                        className="p-3 bg-[#100C0E] border border-white/[0.08] rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-xs text-white">{v.title}</h4>
                          <span className="text-[10px] text-white/40">{v.timestamp} • {v.wordCount} words</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (editorRef.current && confirm("Restore this version? Unsaved current edits will be overwritten.")) {
                              editorRef.current.innerHTML = v.html;
                              handleInput();
                              setShowBackstage(false);
                            }
                          }}
                          className="px-3 py-1 bg-white/[0.08] hover:bg-[#DC2626] text-white rounded text-xs font-semibold transition-colors"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">
                    Press Ctrl+S or click Save to record your first snapshot in version history.
                  </p>
                )}
              </div>
            )}

            {/* PRINT SECTION */}
            {backstageSection === "print" && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">Print</h2>
                  <p className="text-sm text-white/60">Send document to physical printer or save as digital PDF.</p>
                </div>

                <div className="p-6 bg-[#100C0E] border border-white/[0.08] rounded-xl space-y-4 text-xs text-white/80">
                  <p>Document Title: <strong>{docTitle}</strong></p>
                  <p>Estimated Pages: <strong>{pageCount}</strong></p>
                  <p>Paper Orientation: <strong>{orientation}</strong></p>
                  <button
                    type="button"
                    onClick={handlePrintOrPdf}
                    className="bg-[#DC2626] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow hover:bg-[#B91C1C] transition-colors"
                  >
                    Open Print Preview (Ctrl+P)
                  </button>
                </div>
              </div>
            )}

            {/* INFO SECTION */}
            {backstageSection === "info" && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">Document Properties</h2>
                  <p className="text-sm text-white/60">Statistics and metadata.</p>
                </div>

                <div className="bg-[#100C0E] border border-white/[0.08] rounded-xl p-6 space-y-3 text-xs text-white/80">
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="font-bold">Title:</span>
                    <span>{docTitle}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="font-bold">Author:</span>
                    <span>Dinesh Reddy Chada</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="font-bold">Words:</span>
                    <span>{wordCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="font-bold">Characters:</span>
                    <span>{charCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="font-bold">Pages:</span>
                    <span>{pageCount}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-bold">Privacy Guarantee:</span>
                    <span className="text-emerald-400 font-semibold">100% In-Browser. No remote data leakage.</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#100C0E] border border-white/[0.1] rounded-xl max-w-xs w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Insert Table Grid</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-white/60 mb-1">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 rounded bg-[#171114] border border-white/[0.1] text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-white/60 mb-1">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-1.5 rounded bg-[#171114] border border-white/[0.1] text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-3 py-1.5 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="px-4 py-1.5 bg-[#DC2626] text-white rounded font-bold hover:bg-[#B91C1C]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#100C0E] border border-white/[0.1] rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-white">Insert Hyperlink</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-white/60 mb-1">Display Text</label>
                <input
                  type="text"
                  placeholder="Optional display text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#171114] border border-white/[0.1] text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-white/60 mb-1">Web Address (URL)</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#171114] border border-white/[0.1] text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-1.5 bg-[#DC2626] text-white rounded font-bold hover:bg-[#B91C1C]"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. CITATION MODAL (References Tab)
          ========================================================================= */}
      {showCitationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#100C0E] border border-white/[0.1] rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-white">Add Academic Citation</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-white/60 mb-1">Citation Format</label>
                <select
                  value={citationType}
                  onChange={(e: any) => setCitationType(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#171114] border border-white/[0.1] text-white outline-none"
                >
                  <option value="APA">APA Style (Author, Year)</option>
                  <option value="MLA">MLA Style (Author Year)</option>
                  <option value="IEEE">IEEE Style [1]</option>
                  <option value="Chicago">Chicago Manual of Style</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-white/60 mb-1">Author(s)</label>
                <input
                  type="text"
                  placeholder="e.g. Smith, J."
                  value={citationAuthor}
                  onChange={(e) => setCitationAuthor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#171114] border border-white/[0.1] text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-white/60 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Computing Principles"
                  value={citationTitle}
                  onChange={(e) => setCitationTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#171114] border border-white/[0.1] text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-white/60 mb-1">Publication Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2026"
                  value={citationYear}
                  onChange={(e) => setCitationYear(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#171114] border border-white/[0.1] text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCitationModal(false)}
                className="px-3 py-1.5 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertCitation}
                className="px-4 py-1.5 bg-[#DC2626] text-white rounded font-bold hover:bg-[#B91C1C]"
              >
                Insert Citation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. WORD COUNT STATS MODAL
          ========================================================================= */}
      {showWordCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#100C0E] border border-white/[0.1] rounded-xl max-w-xs w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Document Word Count</h3>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex justify-between py-1 border-b border-white/[0.06]">
                <span>Pages:</span>
                <strong className="text-white">{pageCount}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.06]">
                <span>Words:</span>
                <strong className="text-white">{wordCount}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.06]">
                <span>Characters (no spaces):</span>
                <strong className="text-white">{Math.max(0, charCount - (wordCount - 1))}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.06]">
                <span>Characters (with spaces):</span>
                <strong className="text-white">{charCount}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Reading Time:</span>
                <strong className="text-white">~{Math.max(1, Math.ceil(wordCount / 200))} min</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowWordCountModal(false)}
                className="px-4 py-1.5 bg-[#DC2626] text-white rounded text-xs font-semibold hover:bg-[#B91C1C]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          12. KEYBOARD SHORTCUTS REFERENCE MODAL (Help Tab)
          ========================================================================= */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#100C0E] border border-white/[0.1] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">DocuFlow Keyboard Shortcuts</h3>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-white/80 max-h-72 overflow-y-auto">
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + S</span>: Save & Snapshot
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + P</span>: Print / Save PDF
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + B</span>: Bold Text
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + I</span>: Italic Text
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + U</span>: Underline Text
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + Z</span>: Undo Action
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + Y</span>: Redo Action
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + F</span>: Find & Replace
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + K</span>: Insert Link
              </div>
              <div className="p-2 bg-white/[0.03] rounded">
                <span className="font-mono text-red-400 font-bold">Ctrl + A</span>: Select All
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 bg-[#DC2626] text-white rounded text-xs font-semibold hover:bg-[#B91C1C]"
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
