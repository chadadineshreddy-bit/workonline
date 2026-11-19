"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Printer,
  Copy,
  Check,
  Search,
  BookOpen,
  Briefcase,
  User,
  Lightbulb,
  Sparkles,
  ChevronRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Clock,
  Folder
} from "lucide-react";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

type NoteCategory = "Study" | "Work" | "Personal" | "Ideas" | "Research";

interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  updatedAt: string;
}

const DEFAULT_NOTES: Note[] = [
  {
    id: "note-1",
    title: "Project Architecture & Next Steps",
    category: "Work",
    content: `# WorkOnline Platform Overview\n\nWorkOnline is an all-in-one productivity suite built for modern knowledge workers and students.\n\n## Core Pillars:\n1. Functional PDF Tools (Client-side WASM & pdf-lib)\n2. Document Studio (Online Word Editor, Resume, Letters, Invoices)\n3. Academic & Work Calculators\n\n## Key Milestones for Q4:\n- Complete seamless DOCX import and export pipeline\n- Support rich offline editing with local draft caching\n- Ensure zero server round-trip latency for private documents`,
    updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  },
  {
    id: "note-2",
    title: "Operating Systems Lecture Notes — Deadlocks",
    category: "Study",
    content: `# Operating Systems: Deadlock Conditions\n\nA deadlock occurs when two or more processes are unable to proceed because each is waiting for the other to release resources.\n\n## Four Necessary Conditions (Coffman Conditions):\n1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process holds resources while waiting to acquire additional ones.\n3. No Preemption: Resources cannot be forcibly taken from a process holding them.\n4. Circular Wait: A closed chain of processes exists, where each process holds at least one resource needed by the next.\n\n## Avoidance Algorithms:\n- Banker's Algorithm by Edsger Dijkstra\n- Resource Allocation Graphs (RAG)`,
    updatedAt: new Date(Date.now() - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  },
  {
    id: "note-3",
    title: "Product Feature Brainstorming",
    category: "Ideas",
    content: `# Future Enhancements for WorkOnline\n\n- Add instant OCR image-to-text extraction\n- Add LaTeX equation preview for STEM study notes\n- Add Pomodoro study timer widget in the sidebar\n- Add customizable color themes for resume templates`,
    updatedAt: new Date(Date.now() - 172800000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  },
];

export function NotesWorkspace() {
  const [notes, setNotes] = useState<Note[]>(DEFAULT_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>("note-1");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_notes_library");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          setActiveNoteId(parsed[0].id);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Save to local storage on notes change
  const saveNotes = (updated: Note[]) => {
    setNotes(updated);
    try {
      localStorage.setItem("workonline_notes_library", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleUpdateTitle = (title: string) => {
    const updated = notes.map((n) =>
      n.id === activeNoteId
        ? {
            ...n,
            title,
            updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }
        : n
    );
    saveNotes(updated);
  };

  const handleUpdateContent = (content: string) => {
    const updated = notes.map((n) =>
      n.id === activeNoteId
        ? {
            ...n,
            content,
            updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }
        : n
    );
    saveNotes(updated);
  };

  const handleUpdateCategory = (category: NoteCategory) => {
    const updated = notes.map((n) =>
      n.id === activeNoteId ? { ...n, category } : n
    );
    saveNotes(updated);
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: "note-" + Date.now(),
      title: "Untitled Note",
      category: "Personal",
      content: "",
      updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    const updated = [newNote, ...notes];
    saveNotes(updated);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) {
      alert("You need at least one note in your workspace.");
      return;
    }
    const filtered = notes.filter((n) => n.id !== id);
    saveNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0].id);
    }
  };

  // Quick formatting insert
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("note-editor-area") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote?.content || "";
    const selectedText = text.substring(start, end);

    const replacement = `${prefix}${selectedText || "text"}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    handleUpdateContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  // Metrics
  const words = (activeNote?.content || "").trim().split(/\s+/).filter(Boolean).length;
  const chars = (activeNote?.content || "").length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesCategory =
      selectedCategory === "All" || note.category === selectedCategory;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = async () => {
    if (!activeNote) return;
    try {
      await navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy note to clipboard.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    if (!activeNote) return;
    setIsExportingDocx(true);
    try {
      const paragraphs: Paragraph[] = [];

      // Title
      paragraphs.push(
        new Paragraph({
          text: activeNote.title,
          heading: HeadingLevel.TITLE,
          spacing: { after: 200 },
        })
      );

      // Category and date
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Category: ${activeNote.category}  |  Last modified: ${activeNote.updatedAt}`,
              color: "666666",
              size: 18,
            }),
          ],
          spacing: { after: 300 },
        })
      );

      // Content lines
      const lines = activeNote.content.split("\n");
      for (const line of lines) {
        if (line.startsWith("# ")) {
          paragraphs.push(
            new Paragraph({
              text: line.replace("# ", ""),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (line.startsWith("## ")) {
          paragraphs.push(
            new Paragraph({
              text: line.replace("## ", ""),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            })
          );
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          paragraphs.push(
            new Paragraph({
              text: line.substring(2),
              bullet: { level: 0 },
              spacing: { after: 80 },
            })
          );
        } else if (line.trim().length > 0) {
          paragraphs.push(
            new Paragraph({
              text: line,
              spacing: { after: 140 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
              },
            },
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      triggerBlobDownload(
        blob,
        `${activeNote.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "note"}.docx`
      );
    } catch (err) {
      console.error("DOCX generation error:", err);
      alert("Failed to export note as DOCX.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const getCategoryColor = (cat: NoteCategory) => {
    switch (cat) {
      case "Work":
        return "bg-red-500/15 text-[#D72638]";
      case "Study":
        return "bg-purple-100 text-purple-700";
      case "Ideas":
        return "bg-amber-100 text-amber-700";
      case "Research":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-white/30 text-[#202124]";
    }
  };

  return (
    <div className="text-white space-y-8 text-[#202124] flex flex-col">
      {/* Top Bar */}
      <header className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Document Studio <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Notes & Quick Documents
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#777777]" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-medium hover:from-[#FF5B66] hover:to-[#F04452] disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingDocx ? "Exporting..." : "Export DOCX"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Notes Sidebar */}
          <div className="lg:col-span-4 liquid-glass-card rounded-2xl shadow-sm p-4 flex flex-col h-[750px] print:hidden">
            {/* Header + Add Note */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#F04452]" />
                <h2 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Notebooks ({filteredNotes.length})
                </h2>
              </div>
              <button
                onClick={handleCreateNote}
                className="px-2.5 py-1 rounded-md bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-medium hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Note
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {["All", "Work", "Study", "Ideas", "Research", "Personal"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white font-medium"
                      : "bg-white/30 text-[#777777] hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredNotes.map((note) => {
                const isActive = note.id === activeNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all relative group ${
                      isActive
                        ? "bg-red-500/10/70 border-[#F04452]/30 shadow-xs"
                        : "bg-white border-white/80 hover:border-white/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`text-xs font-semibold truncate ${
                          isActive ? "text-[#202124]" : "text-[#202124]"
                        }`}
                      >
                        {note.title || "Untitled Note"}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-[#777777] hover:text-rose-600 transition-opacity p-0.5"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#777777] line-clamp-2 leading-relaxed mb-2 font-serif">
                      {note.content.replace(/[#*_-]/g, "").trim() || "No additional text"}
                    </p>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-medium ${getCategoryColor(note.category)}`}>
                        {note.category}
                      </span>
                      <span className="text-[#777777]">{note.updatedAt}</span>
                    </div>
                  </div>
                );
              })}

              {filteredNotes.length === 0 && (
                <div className="text-center py-10 text-xs text-[#777777]">
                  No notes match your search.
                </div>
              )}
            </div>
          </div>

          {/* Note Editor Area */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {activeNote ? (
              <div className="liquid-glass-card rounded-2xl shadow-sm flex flex-col min-h-[750px]">
                {/* Note Meta Bar */}
                <div className="p-4 border-b border-white/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => handleUpdateTitle(e.target.value)}
                      placeholder="Note Title..."
                      className="text-lg font-bold text-[#202124] w-full focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#777777]">Category:</span>
                    <select
                      value={activeNote.category}
                      onChange={(e) => handleUpdateCategory(e.target.value as NoteCategory)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-white/80 bg-white font-medium text-[#202124] focus:outline-none"
                    >
                      <option value="Study">Study</option>
                      <option value="Work">Work</option>
                      <option value="Ideas">Ideas</option>
                      <option value="Research">Research</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                </div>

                {/* Markdown Formatting Toolbar */}
                <div className="px-4 py-2 border-b border-white/80 bg-white/20 flex flex-wrap items-center gap-1 text-[#777777] print:hidden">
                  <button
                    onClick={() => insertFormatting("**", "**")}
                    title="Bold"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertFormatting("*", "*")}
                    title="Italic"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <button
                    onClick={() => insertFormatting("# ")}
                    title="Heading 1"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors font-bold text-xs"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertFormatting("## ")}
                    title="Heading 2"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors font-bold text-xs"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <button
                    onClick={() => insertFormatting("- ")}
                    title="Bullet List"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertFormatting("1. ")}
                    title="Numbered List"
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertFormatting("> ")}
                    title="Quote"
                    className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-serif"
                  >
                    ”
                  </button>
                  <button
                    onClick={() => insertFormatting("`", "`")}
                    title="Code"
                    className="px-1.5 py-0.5 rounded hover:bg-slate-200 font-mono text-xs"
                  >
                    &lt;/&gt;
                  </button>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 p-6 flex flex-col">
                  <textarea
                    id="note-editor-area"
                    value={activeNote.content}
                    onChange={(e) => handleUpdateContent(e.target.value)}
                    placeholder="Write your note, summary, research points or thoughts here..."
                    className="w-full flex-1 text-sm text-[#202124] leading-relaxed font-serif resize-none focus:outline-none"
                    rows={22}
                  />
                </div>

                {/* Status Footer */}
                <div className="p-3 border-t border-white/80 bg-white/20 flex items-center justify-between text-xs text-[#777777] rounded-b-xl">
                  <div className="flex items-center gap-4">
                    <span>{words} words</span>
                    <span>{chars} characters</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{readingTime} min read
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Auto-saved locally
                  </span>
                </div>
              </div>
            ) : (
              <div className="liquid-glass-card rounded-2xl p-12 text-center text-[#777777]">
                Select or create a note to begin editing.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
