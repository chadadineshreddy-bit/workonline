"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  Download,
  Printer,
  Copy,
  Check,
  ChevronRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Clock,
  Folder,
  Tag
} from "lucide-react";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { convertTxtToPdfBlob } from "@/lib/docx/document-converters";

export interface StudentNote {
  id: string;
  title: string;
  subject: string;
  category: "Lecture Notes" | "Revision Summary" | "Lab Record" | "Formula Sheet" | "General";
  content: string;
  updatedAt: string;
}

const DEFAULT_STUDENT_NOTES: StudentNote[] = [
  {
    id: "snote-1",
    title: "Operating Systems: Virtual Memory & Page Replacement",
    subject: "Operating Systems",
    category: "Lecture Notes",
    content: `# Virtual Memory & Demand Paging\n\nVirtual memory separates user logical memory from physical memory, allowing execution of processes not completely in RAM.\n\n## Key Concepts:\n- Page Fault: Trap raised by hardware when a thread accesses an unmapped virtual address.\n- Belady's Anomaly: For FIFO page replacement, adding more page frames can cause MORE page faults.\n\n## Common Replacement Algorithms:\n1. FIFO (First In First Out): Simplest, suffers from Belady's anomaly.\n2. Optimal (OPT): Replaces the page that will not be used for the longest period of time (theoretical benchmark).\n3. LRU (Least Recently Used): Approximates OPT by tracking recent access timestamps. Implementable via doubly-linked list & hash table.\n4. Clock / Second-Chance Algorithm: Uses reference bits to approximate LRU with low overhead.`,
    updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  },
  {
    id: "snote-2",
    title: "Calculus & Linear Algebra Formula Sheet",
    subject: "Mathematics",
    category: "Formula Sheet",
    content: `# Essential Engineering Mathematics Formulas\n\n## Eigenvalues and Eigenvectors:\n- Characteristic Equation: det(A - λI) = 0\n- Trace(A) = Sum of eigenvalues\n- Det(A) = Product of eigenvalues\n\n## Differential Equations:\n- First-order Linear: dy/dx + P(x)y = Q(x)\n- Integrating Factor: IF = e^(∫ P(x) dx)\n- Solution: y × IF = ∫ (Q(x) × IF) dx + C\n\n## Vector Calculus:\n- Gradient: ∇f = (∂f/∂x)i + (∂f/∂y)j + (∂f/∂z)k\n- Divergence: ∇ · F = (∂Fx/∂x) + (∂Fy/∂y) + (∂Fz/∂z)\n- Curl: ∇ × F (Circulation density)`,
    updatedAt: new Date(Date.now() - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  },
  {
    id: "snote-3",
    title: "B+ Tree Indexing & Query Optimization",
    subject: "DBMS",
    category: "Revision Summary",
    content: `# Database Indexing Essentials\n\n## B+ Tree Properties:\n- Self-balancing n-ary tree with high fanout.\n- All leaf nodes are located at the same depth.\n- Leaves are linked in a bidirectional linked list for range queries.\n- Internal nodes store only search keys and child pointers; records/pointers exist solely at the leaf level.\n\n## Index Types:\n- Clustered Index: Determines the physical sort order of rows in the table (only 1 per table).\n- Non-Clustered / Secondary Index: Contains index keys with pointers (RID) to heap rows.`,
    updatedAt: new Date(Date.now() - 172800000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  },
];

export function StudentNotesManager() {
  const [notes, setNotes] = useState<StudentNote[]>(DEFAULT_STUDENT_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>("snote-1");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_student_notes");
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

  const saveNotes = (updated: StudentNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem("workonline_student_notes", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  // Subjects set for filtering
  const allSubjects = ["All", ...Array.from(new Set(notes.map((n) => n.subject)))];

  const handleCreateNote = () => {
    const newNote: StudentNote = {
      id: "snote-" + Date.now(),
      title: "Untitled Lecture Note",
      subject: selectedSubject !== "All" ? selectedSubject : "Computer Science",
      category: "Lecture Notes",
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
      alert("You need at least one note in your notebook.");
      return;
    }
    const filtered = notes.filter((n) => n.id !== id);
    saveNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0].id);
    }
  };

  const handleUpdate = (field: keyof StudentNote, value: any) => {
    const updated = notes.map((n) =>
      n.id === activeNoteId
        ? {
            ...n,
            [field]: value,
            updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }
        : n
    );
    saveNotes(updated);
  };

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("student-note-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeNote?.content || "";
    const selected = text.substring(start, end);

    const replacement = `${prefix}${selected || "text"}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    handleUpdate("content", newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 0);
  };

  const handleCopy = async () => {
    if (!activeNote) return;
    try {
      await navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy note text.");
    }
  };

  const handleExportDocx = async () => {
    if (!activeNote) return;
    setIsExporting(true);
    try {
      const paragraphs: Paragraph[] = [
        new Paragraph({
          text: activeNote.title,
          heading: HeadingLevel.TITLE,
          spacing: { after: 150 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Subject: ${activeNote.subject}  |  Category: ${activeNote.category}  |  Date: ${activeNote.updatedAt}`,
              color: "666666",
              size: 18,
            }),
          ],
          spacing: { after: 250 },
        }),
      ];

      const lines = activeNote.content.split("\n");
      for (const line of lines) {
        if (line.startsWith("# ")) {
          paragraphs.push(
            new Paragraph({
              text: line.replace("# ", ""),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 100 },
            })
          );
        } else if (line.startsWith("## ")) {
          paragraphs.push(
            new Paragraph({
              text: line.replace("## ", ""),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 180, after: 80 },
            })
          );
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          paragraphs.push(
            new Paragraph({
              text: line.substring(2),
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
          );
        } else if (line.trim().length > 0) {
          paragraphs.push(
            new Paragraph({
              text: line,
              spacing: { after: 120 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      triggerBlobDownload(
        blob,
        `${activeNote.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "notes"}.docx`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to export as DOCX.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!activeNote) return;
    setIsExporting(true);
    try {
      const blob = await convertTxtToPdfBlob(activeNote.content, activeNote.title);
      triggerBlobDownload(
        blob,
        `${activeNote.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "notes"}.pdf`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to export as PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // Metrics
  const words = (activeNote?.content || "").trim().split(/\s+/).filter(Boolean).length;
  const chars = (activeNote?.content || "").length;

  const filteredNotes = notes.filter((note) => {
    const matchesSubject = selectedSubject === "All" || note.subject === selectedSubject;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="text-white space-y-8 flex flex-col">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student-zone"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Student Zone <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                <BookOpen className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Academic Notes & Study Binder
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
              onClick={handleExportPdf}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#777777]" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleExportDocx}
              disabled={isExporting}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-medium hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export DOCX</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
          {/* Notes Sidebar */}
          <div className="lg:col-span-4 liquid-glass-card rounded-2xl shadow-sm p-4 flex flex-col h-[750px] print:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#F04452]" /> Notes Library ({filteredNotes.length})
              </span>
              <button
                onClick={handleCreateNote}
                className="px-2.5 py-1 rounded-md bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Note
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lecture notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
              />
            </div>

            {/* Subject Filters */}
            <div className="flex flex-wrap gap-1 mb-3">
              {allSubjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                    selectedSubject === sub
                      ? "bg-slate-900 text-white font-medium"
                      : "bg-white/30 text-[#777777] hover:bg-slate-200"
                  }`}
                >
                  {sub}
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
                      <h4 className={`text-xs font-semibold truncate ${isActive ? "text-[#202124]" : "text-[#202124]"}`}>
                        {note.title || "Untitled Note"}
                      </h4>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-[#777777] hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#777777] line-clamp-2 leading-relaxed mb-2 font-serif">
                      {note.content.replace(/[#*_-]/g, "").trim() || "No text"}
                    </p>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
                        {note.subject}
                      </span>
                      <span className="text-[#777777]">{note.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note Editor Canvas */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {activeNote ? (
              <div className="liquid-glass-card rounded-2xl shadow-sm flex flex-col min-h-[750px]">
                {/* Header Inputs */}
                <div className="p-4 border-b border-white/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={activeNote.title}
                      onChange={(e) => handleUpdate("title", e.target.value)}
                      placeholder="Note Title..."
                      className="text-lg font-bold text-[#202124] w-full focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Subject (e.g. Physics)"
                      value={activeNote.subject}
                      onChange={(e) => handleUpdate("subject", e.target.value)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-white/80 bg-white font-medium text-[#202124] focus:outline-none"
                    />

                    <select
                      value={activeNote.category}
                      onChange={(e) => handleUpdate("category", e.target.value as any)}
                      className="text-xs px-2.5 py-1 rounded-lg border border-white/80 bg-white font-medium text-[#202124] focus:outline-none"
                    >
                      <option value="Lecture Notes">Lecture Notes</option>
                      <option value="Revision Summary">Revision Summary</option>
                      <option value="Lab Record">Lab Record</option>
                      <option value="Formula Sheet">Formula Sheet</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                {/* Quick Toolbar */}
                <div className="px-4 py-2 border-b border-white/80 bg-white/20 flex flex-wrap items-center gap-1 text-[#777777] print:hidden">
                  <button
                    onClick={() => insertFormatting("**", "**")}
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertFormatting("*", "*")}
                    className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <button
                    onClick={() => insertFormatting("# ")}
                    className="p-1.5 rounded hover:bg-slate-200 font-bold text-xs"
                    title="Heading 1"
                  >
                    <Heading1 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertFormatting("## ")}
                    className="p-1.5 rounded hover:bg-slate-200 font-bold text-xs"
                    title="Heading 2"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <button
                    onClick={() => insertFormatting("- ")}
                    className="p-1.5 rounded hover:bg-slate-200"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertFormatting("1. ")}
                    className="p-1.5 rounded hover:bg-slate-200"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => insertFormatting("`", "`")}
                    className="px-1.5 py-0.5 rounded hover:bg-slate-200 font-mono text-xs"
                    title="Inline Code"
                  >
                    &lt;/&gt;
                  </button>
                </div>

                {/* Textarea */}
                <div className="flex-1 p-6 flex flex-col">
                  <textarea
                    id="student-note-textarea"
                    value={activeNote.content}
                    onChange={(e) => handleUpdate("content", e.target.value)}
                    placeholder="Write your study notes, derivations, or summaries here..."
                    className="w-full flex-1 text-sm text-[#202124] leading-relaxed font-serif resize-none focus:outline-none"
                    rows={22}
                  />
                </div>

                {/* Bottom Bar */}
                <div className="p-3 border-t border-white/80 bg-white/20 flex items-center justify-between text-xs text-[#777777] rounded-b-xl">
                  <div className="flex items-center gap-4">
                    <span>{words} words</span>
                    <span>{chars} characters</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{Math.max(1, Math.ceil(words / 200))} min read
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Auto-saved locally
                  </span>
                </div>
              </div>
            ) : (
              <div className="liquid-glass-card rounded-2xl p-12 text-center text-[#777777]">
                Select or create a lecture note to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
