"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
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
  Undo2,
  Redo2,
  Download,
  Upload,
  FileText,
  Printer,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  Type,
  Maximize2,
  Minimize2,
  Palette,
  Highlighter,
  HelpCircle,
  FileCheck
} from "lucide-react";
import { exportHtmlToDocxBlob } from "@/lib/docx/docx-export";
import { importDocxFile } from "@/lib/docx/docx-import";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

export function WordEditor() {
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string>("Just now");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [showOutline, setShowOutline] = useState(true);
  const [outlineItems, setOutlineItems] = useState<{ id: string; text: string; level: number }[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Table modal state
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Link modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial template content
  const initialContent = `
    <h1>Professional Project Proposal</h1>
    <p>Prepared for: <strong>Executive Review Board</strong> | Date: <em>November 2026</em></p>
    <hr/>
    <h2>1. Executive Summary</h2>
    <p>WorkOnline unites everyday productivity, academic calculations, document creation, and digital asset manipulation into one friction-free platform.</p>
    <h2>2. Key Deliverables & Timelines</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px;">
      <thead>
        <tr style="background-color: #f1f5f9;">
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Phase</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Scope</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Target Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">Architecture</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">Next.js 14 App Router & Design System</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">Completed</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">PDF Suite</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">Client-side Merge, Split, Rotate, Compress</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">Completed</td>
        </tr>
        <tr>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">Document Studio</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">Word Editor, DOCX Import/Export, Resume Builder</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px;">Active</td>
        </tr>
      </tbody>
    </table>
    <h2>3. Conclusion & Next Steps</h2>
    <p>By processing documents directly in the user's browser, WorkOnline ensures strict privacy compliance while delivering instant sub-second turnaround.</p>
  `;

  // Load from local storage or set initial
  useEffect(() => {
    const savedDraft = localStorage.getItem("workonline_editor_draft");
    const savedTitle = localStorage.getItem("workonline_editor_title");
    if (editorRef.current) {
      if (savedDraft) {
        editorRef.current.innerHTML = savedDraft;
      } else {
        editorRef.current.innerHTML = initialContent;
      }
      updateCountsAndOutline();
    }
    if (savedTitle) setDocTitle(savedTitle);
  }, []);

  // Update word count, character count, and document outline
  const updateCountsAndOutline = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);

    // Extract outline headings (H1, H2, H3)
    const headings = editorRef.current.querySelectorAll("h1, h2, h3");
    const items: { id: string; text: string; level: number }[] = [];
    headings.forEach((h, index) => {
      const id = `heading-${index}`;
      h.setAttribute("id", id);
      const level = parseInt(h.tagName.substring(1), 10);
      items.push({ id, text: h.textContent || `Heading ${index + 1}`, level });
    });
    setOutlineItems(items);
  };

  const handleInput = () => {
    setSaveStatus("saving");
    updateCountsAndOutline();

    // Auto-save to localStorage
    if (editorRef.current) {
      localStorage.setItem("workonline_editor_draft", editorRef.current.innerHTML);
      localStorage.setItem("workonline_editor_title", docTitle);
    }

    setTimeout(() => {
      setSaveStatus("saved");
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 600);
  };

  // Formatting commands using execCommand & DOM
  const format = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const applyHeading = (tag: string) => {
    format("formatBlock", tag);
  };

  const applyFontSize = (sizePx: string) => {
    // Wrap selection in span with font-size
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.fontSize = sizePx;
    try {
      range.surroundContents(span);
    } catch {
      document.execCommand("fontSize", false, "3");
    }
    handleInput();
  };

  const insertTable = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;"><tbody>`;
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td style="border: 1px solid #cbd5e1; padding: 8px; min-width: 60px;">Cell</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br/></p>`;

    document.execCommand("insertHTML", false, tableHtml);
    setShowTableModal(false);
    handleInput();
  };

  const insertLink = () => {
    if (!linkUrl.trim()) return;
    if (!editorRef.current) return;
    editorRef.current.focus();

    const textToDisplay = linkText.trim() || linkUrl.trim();
    const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${textToDisplay}</a>`;
    document.execCommand("insertHTML", false, linkHtml);
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
    handleInput();
  };

  const insertHorizontalLine = () => {
    format("insertHorizontalRule");
  };

  const insertPageBreak = () => {
    const pageBreakHtml = `<div class="page-break" style="page-break-after: always; border-bottom: 2px dashed #94a3b8; margin: 30px 0; text-align: center;"><span style="background: #e2e8f0; color: #475569; font-size: 10px; padding: 2px 8px; border-radius: 4px;">PAGE BREAK</span></div><p><br/></p>`;
    format("insertHTML", pageBreakHtml);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const imgHtml = `<img src="${reader.result}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;" alt="Inserted visual"/><p><br/></p>`;
        format("insertHTML", imgHtml);
      }
    };
    reader.readAsDataURL(file);
  };

  // Find and replace
  const handleFindReplace = () => {
    if (!editorRef.current || !findText.trim()) return;
    const html = editorRef.current.innerHTML;
    // Safe replace
    const regex = new RegExp(findText, "gi");
    editorRef.current.innerHTML = html.replace(regex, replaceText);
    handleInput();
  };

  // Export to genuine DOCX
  const handleExportDocx = async () => {
    if (!editorRef.current) return;
    try {
      setIsExporting(true);
      const html = editorRef.current.innerHTML;
      const blob = await exportHtmlToDocxBlob(html, docTitle);
      triggerBlobDownload(blob, `${docTitle.replace(/[^a-zA-Z0-9_-]/g, "_") || "document"}.docx`);
    } catch (err) {
      console.error("DOCX Export Error:", err);
      alert("Error generating DOCX document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const handleExportPdf = () => {
    window.print();
  };

  // Import DOCX
  const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setImportError(null);

    const res = await importDocxFile(file);
    if (!res.success) {
      setImportError(res.error || "Unable to import DOCX.");
      return;
    }

    if (editorRef.current) {
      editorRef.current.innerHTML = res.html;
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
      handleInput();
    }
  };

  const handleNewDocument = () => {
    if (confirm("Create a new document? Unsaved changes will be cleared.")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "<p>Start typing your new document here...</p>";
        setDocTitle("Untitled Document");
        handleInput();
      }
    }
  };

  return (
    <div className="min-h-screen bg-white/30 dark:bg-slate-950 flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-white/80 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between gap-4 shadow-subtle print:hidden">
        {/* Brand & Document Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white flex items-center justify-center shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm hidden sm:inline text-[#202124] dark:text-white">
              Work<span className="text-[#F04452]">Online</span>
            </span>
          </Link>

          <span className="text-slate-300 dark:text-[#202124]">|</span>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value);
                setSaveStatus("saving");
                localStorage.setItem("workonline_editor_title", e.target.value);
                setTimeout(() => setSaveStatus("saved"), 400);
              }}
              placeholder="Document Title"
              className="text-sm font-bold text-[#202124] dark:text-slate-100 bg-transparent hover:bg-white/20 dark:hover:bg-slate-800 px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 max-w-[180px] sm:max-w-xs truncate"
            />

            <span className="text-[11px] text-[#777777] hidden md:inline">
              {saveStatus === "saving" ? "Saving draft..." : `Saved locally (${lastSavedTime})`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Import DOCX */}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/80 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-800 text-xs font-semibold text-[#202124] dark:text-slate-200 transition-colors">
            <Upload className="w-3.5 h-3.5 text-[#F04452]" />
            <span className="hidden sm:inline">Import DOCX</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              onChange={handleImportDocx}
              className="hidden"
            />
          </label>

          {/* Export Dropdown / Buttons */}
          <button
            type="button"
            onClick={handleExportDocx}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 liquid-btn-primary rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export DOCX</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/80 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-[#202124] dark:text-slate-200 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleNewDocument}
            className="p-1.5 text-[#777777] hover:text-[#202124] dark:hover:text-slate-200 rounded-lg"
            title="New Document"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Formatting Toolbar */}
      <div className="sticky top-12 z-20 bg-white dark:bg-slate-900 border-b border-white/80 dark:border-slate-800 px-4 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none shadow-subtle print:hidden">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => format("undo")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("redo")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-white/80 mx-1" />

        {/* Headings Selector */}
        <select
          onChange={(e) => applyHeading(e.target.value)}
          className="text-xs font-medium py-1 px-2 border border-white/80 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-[#202124] dark:text-slate-200 focus:outline-none"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        {/* Font Size Selector */}
        <select
          onChange={(e) => applyFontSize(e.target.value)}
          className="text-xs font-medium py-1 px-2 border border-white/80 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-[#202124] dark:text-slate-200 focus:outline-none"
        >
          <option value="14px">11 pt</option>
          <option value="16px">12 pt (Normal)</option>
          <option value="18px">14 pt</option>
          <option value="22px">16 pt</option>
          <option value="26px">20 pt</option>
          <option value="32px">24 pt</option>
        </select>

        <span className="w-px h-5 bg-white/80 mx-1" />

        {/* Formatting Buttons */}
        <button
          type="button"
          onClick={() => format("bold")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg font-bold"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("italic")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("underline")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("strikeThrough")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        {/* Text Color Picker */}
        <div className="relative flex items-center p-1 rounded hover:bg-white/30 dark:hover:bg-slate-800">
          <Palette className="w-4 h-4 text-[#F04452] mr-1" />
          <input
            type="color"
            onChange={(e) => format("foreColor", e.target.value)}
            className="w-4 h-4 p-0 border-none bg-transparent cursor-pointer"
            title="Text Color"
          />
        </div>

        {/* Highlight Color Picker */}
        <div className="relative flex items-center p-1 rounded hover:bg-white/30 dark:hover:bg-slate-800">
          <Highlighter className="w-4 h-4 text-amber-500 mr-1" />
          <input
            type="color"
            defaultValue="#fef08a"
            onChange={(e) => format("hiliteColor", e.target.value)}
            className="w-4 h-4 p-0 border-none bg-transparent cursor-pointer"
            title="Highlight Color"
          />
        </div>

        <span className="w-px h-5 bg-white/80 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => format("justifyLeft")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("justifyCenter")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("justifyRight")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("justifyFull")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-white/80 mx-1" />

        {/* Lists & Indent */}
        <button
          type="button"
          onClick={() => format("insertUnorderedList")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("insertOrderedList")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("indent")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Increase Indent"
        >
          <Indent className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => format("outdent")}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Decrease Indent"
        >
          <Outdent className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-white/80 mx-1" />

        {/* Inserts: Table, Link, Image, Line, PageBreak */}
        <button
          type="button"
          onClick={() => setShowTableModal(true)}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Insert Hyperlink"
        >
          <LinkIcon className="w-4 h-4" />
        </button>

        <label className="cursor-pointer p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg">
          <ImageIcon className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            title="Insert Image"
          />
        </label>

        <button
          type="button"
          onClick={insertHorizontalLine}
          className="p-1.5 text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800 rounded-lg"
          title="Insert Divider"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={insertPageBreak}
          className="px-2 py-1 text-xs font-semibold rounded-lg border border-white/80 dark:border-slate-700 hover:bg-white/30 dark:hover:bg-slate-800 text-[#202124] dark:text-slate-300"
          title="Insert Page Break"
        >
          Break
        </button>

        <span className="w-px h-5 bg-white/80 mx-1" />

        {/* Find & Replace */}
        <button
          type="button"
          onClick={() => setShowFindReplace(!showFindReplace)}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            showFindReplace
              ? "bg-red-500/10 text-[#F04452] dark:bg-blue-950/60"
              : "text-[#777777] dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800"
          }`}
          title="Find and Replace"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Find and Replace Modal Toolbar */}
      {showFindReplace && (
        <div className="bg-white/20 dark:bg-slate-850 border-b border-white/80 dark:border-slate-800 px-6 py-2.5 flex flex-wrap items-center gap-3 text-xs animate-fade-in print:hidden">
          <span className="font-semibold text-[#202124] dark:text-slate-300">Find:</span>
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Text to find..."
            className="px-2.5 py-1 rounded-md border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#202124] dark:text-white"
          />
          <span className="font-semibold text-[#202124] dark:text-slate-300">Replace:</span>
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replacement..."
            className="px-2.5 py-1 rounded-md border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#202124] dark:text-white"
          />
          <button
            type="button"
            onClick={handleFindReplace}
            className="px-3 py-1 liquid-btn-primary rounded-md font-semibold"
          >
            Replace All
          </button>
          <button
            type="button"
            onClick={() => setShowFindReplace(false)}
            className="text-[#777777] hover:text-[#777777] ml-auto"
          >
            Close
          </button>
        </div>
      )}

      {importError && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/60 px-6 py-2 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between">
          <span>{importError}</span>
          <button onClick={() => setImportError(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Layout (Canvas + Sidebar) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Canvas Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-white/30 dark:bg-slate-950">
          <div
            className="w-full max-w-[816px] min-h-[1056px] bg-white text-[#202124] p-10 sm:p-14 rounded-2xl shadow-lg border border-white/80/80 focus:outline-none leading-relaxed text-sm print:p-0 print:border-none print:shadow-none print:w-full"
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {/* The editable document */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              className="outline-none min-h-[900px] prose prose-slate max-w-none focus:outline-none"
            />
          </div>
        </div>

        {/* Side Panel: Outline & Document Information */}
        {showOutline && (
          <aside className="w-64 xl:w-72 bg-white dark:bg-slate-900 border-l border-white/80 dark:border-slate-800 p-5 space-y-6 hidden lg:block overflow-y-auto print:hidden">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#777777] mb-2.5">
                Document Outline
              </h4>
              {outlineItems.length > 0 ? (
                <ul className="space-y-1.5 text-xs">
                  {outlineItems.map((item) => (
                    <li
                      key={item.id}
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                      className="truncate text-[#777777] dark:text-[#777777] hover:text-[#F04452] cursor-pointer"
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
                <p className="text-xs text-[#777777] italic">
                  Headings you add (H1, H2) will appear here as a navigation outline.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-white/60 dark:border-slate-800 space-y-2 text-xs text-[#777777]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#777777] mb-2">
                Document Stats
              </h4>
              <div className="flex justify-between">
                <span>Words:</span>
                <strong className="text-[#202124] dark:text-slate-200">{wordCount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Characters:</span>
                <strong className="text-[#202124] dark:text-slate-200">{charCount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Reading Time:</span>
                <strong className="text-[#202124] dark:text-slate-200">
                  ~{Math.max(1, Math.ceil(wordCount / 200))} min
                </strong>
              </div>
            </div>

            <div className="p-3 bg-red-500/10 dark:bg-blue-950/40 rounded-xl border border-[#F04452]/20 dark:border-blue-900/60 text-xs text-[#D72638] dark:text-blue-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Word & Docs Compatible</span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Exports generate clean Microsoft Word `.docx` documents and standardized print-ready PDFs.
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Table Insertion Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-white/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-[#202124] dark:text-white">
              Insert Table
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#777777] dark:text-[#777777] mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#202124] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#777777] dark:text-[#777777] mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#202124] dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#777777] hover:text-[#202124]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="px-4 py-2 liquid-btn-primary rounded-lg text-xs font-semibold"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-white/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-[#202124] dark:text-white">
              Insert Link
            </h3>
            <div>
              <label className="block text-xs font-medium text-[#777777] dark:text-[#777777] mb-1">
                Display Text
              </label>
              <input
                type="text"
                placeholder="Optional text to display"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#202124] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#777777] dark:text-[#777777] mb-1">
                URL Address
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#202124] dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#777777] hover:text-[#202124]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 liquid-btn-primary rounded-lg text-xs font-semibold"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
