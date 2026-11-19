"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Download,
  Printer,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  ChevronRight
} from "lucide-react";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Packer
} from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { convertTxtToPdfBlob } from "@/lib/docx/document-converters";

interface ActionItem {
  id: string;
  task: string;
  owner: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Done";
}

export function MeetingMinutesSuite() {
  const [meetingTitle, setMeetingTitle] = useState("Product Architecture & Q4 Roadmap Alignment");
  const [meetingDate, setMeetingDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:15");
  const [participants, setParticipants] = useState("Jonathan Doe (Lead), Sarah Jenkins (VP Eng), Michael Chen (Architect), Emily Davis (Design)");
  const [agenda, setAgenda] = useState("1. Review sub-second document export benchmarks\n2. Finalize client-side security boundaries\n3. Determine sprint ownership for student and work zones");
  const [discussionPoints, setDiscussionPoints] = useState("• Michael walked through the WebAssembly compilation latency, confirming sub-100ms conversions on standard laptops.\n• Sarah highlighted the importance of zero server round-trips for enterprise SOC-2 compliance.\n• Emily reviewed the typography and card styling, approving the navy and blue design system.");
  const [decisionsMade, setDecisionsMade] = useState("• Approved client-side docx and pdf-lib architecture for all document operations.\n• Agreed to persist user data in local storage with future Supabase migration hooks.\n• Scheduled next weekly sync for Thursday 10:00 AM.");

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: "a1",
      task: "Complete DOCX and XLSX client-side converter benchmarks",
      owner: "Jonathan",
      deadline: "2026-11-20",
      status: "In Progress",
    },
    {
      id: "a2",
      task: "Review and audit all input validation across student calculators",
      owner: "Michael",
      deadline: "2026-11-22",
      status: "Pending",
    },
    {
      id: "a3",
      task: "Publish finalized UI component style guide for dark mode contrast",
      owner: "Emily",
      deadline: "2026-11-25",
      status: "Done",
    },
  ]);

  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleAddActionItem = () => {
    setActionItems([
      ...actionItems,
      {
        id: "act-" + Date.now(),
        task: "",
        owner: "",
        deadline: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
        status: "Pending",
      },
    ]);
  };

  const handleRemoveActionItem = (id: string) => {
    if (actionItems.length <= 1) return;
    setActionItems(actionItems.filter((a) => a.id !== id));
  };

  const handleUpdateAction = (id: string, field: keyof ActionItem, value: any) => {
    setActionItems(actionItems.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  // Plain-text representation
  const generateFullText = () => {
    let out = `MEETING MINUTES: ${meetingTitle.toUpperCase()}\n`;
    out += `Date: ${meetingDate} | Time: ${startTime} – ${endTime}\n`;
    out += `Participants: ${participants}\n\n`;
    out += `AGENDA:\n${agenda}\n\n`;
    out += `KEY DISCUSSION POINTS:\n${discussionPoints}\n\n`;
    out += `DECISIONS MADE:\n${decisionsMade}\n\n`;
    out += `ACTION ITEMS & OWNERS:\n`;
    actionItems.forEach((item, idx) => {
      out += `${idx + 1}. [${item.status}] ${item.task} — Owner: ${item.owner || "Unassigned"} (Due: ${item.deadline})\n`;
    });
    return out;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateFullText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy meeting minutes.");
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const blob = await convertTxtToPdfBlob(generateFullText(), meetingTitle);
      triggerBlobDownload(
        blob,
        `meeting-minutes-${meetingDate}.pdf`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to export PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const tableRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Action Item", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "2563EB" },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Owner", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "2563EB" },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Deadline", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "2563EB" },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true, color: "FFFFFF" })] })],
              shading: { fill: "2563EB" },
            }),
          ],
        }),
      ];

      actionItems.forEach((a) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(a.task || "Pending task")] }),
              new TableCell({ children: [new Paragraph(a.owner || "Unassigned")] }),
              new TableCell({ children: [new Paragraph(a.deadline)] }),
              new TableCell({ children: [new Paragraph(a.status)] }),
            ],
          })
        );
      });

      const doc = new Document({
        sections: [
          {
            properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
            children: [
              new Paragraph({
                text: meetingTitle,
                heading: HeadingLevel.TITLE,
                spacing: { after: 120 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Date: ${meetingDate}  |  Time: ${startTime} – ${endTime}  |  Participants: ${participants}`,
                    color: "64748B",
                    size: 19,
                  }),
                ],
                spacing: { after: 240 },
              }),
              new Paragraph({ text: "Agenda", heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 } }),
              new Paragraph({ text: agenda, spacing: { after: 180 } }),
              new Paragraph({ text: "Discussion Points", heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 } }),
              new Paragraph({ text: discussionPoints, spacing: { after: 180 } }),
              new Paragraph({ text: "Decisions Made", heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 } }),
              new Paragraph({ text: decisionsMade, spacing: { after: 200 } }),
              new Paragraph({ text: "Action Items & Deliverables", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 120 } }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      triggerBlobDownload(blob, `meeting-minutes-${meetingDate}.docx`);
    } catch (err) {
      console.error(err);
      alert("Failed to export DOCX.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="text-white space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/work-zone"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Work Zone <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Meeting Minutes Generator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Text"}</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#777777]" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download DOCX</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Meeting Minutes Document Builder
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Compile structured meeting proceedings, attendee rolls, discussion notes, decisions, and action items into clean executive minutes.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="liquid-glass-card rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F04452]" /> Meeting Metadata
              </h3>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 font-semibold text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Attendees / Participants
                </label>
                <textarea
                  rows={2}
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Meeting Agenda
                </label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Key Discussion Points
                </label>
                <textarea
                  rows={4}
                  value={discussionPoints}
                  onChange={(e) => setDiscussionPoints(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Decisions Made
                </label>
                <textarea
                  rows={3}
                  value={decisionsMade}
                  onChange={(e) => setDecisionsMade(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Action Items Builder */}
            <div className="liquid-glass-card rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#F04452]" /> Action Items ({actionItems.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddActionItem}
                  className="text-xs text-[#F04452] hover:text-[#D72638] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              </div>

              <div className="space-y-2.5">
                {actionItems.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-lg bg-white/20 border border-white/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Action item description..."
                        value={item.task}
                        onChange={(e) => handleUpdateAction(item.id, "task", e.target.value)}
                        className="flex-1 text-xs px-2 py-1 rounded border border-white/80 bg-white focus:outline-none"
                      />
                      {actionItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveActionItem(item.id)}
                          className="text-[#777777] hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Owner name"
                        value={item.owner}
                        onChange={(e) => handleUpdateAction(item.id, "owner", e.target.value)}
                        className="px-2 py-1 rounded border border-white/80 bg-white"
                      />
                      <input
                        type="date"
                        value={item.deadline}
                        onChange={(e) => handleUpdateAction(item.id, "deadline", e.target.value)}
                        className="px-2 py-1 rounded border border-white/80 bg-white"
                      />
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateAction(item.id, "status", e.target.value as any)}
                        className="px-2 py-1 rounded border border-white/80 bg-white font-medium"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Live Document Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="floating-glass-canvas rounded-3xl shadow-xl p-8 sm:p-12 text-[#202124] min-h-[750px] font-serif space-y-6">
              {/* Header */}
              <div className="border-b border-white/80 pb-5">
                <span className="text-[11px] font-sans font-bold text-[#F04452] uppercase tracking-widest block mb-1">
                  Executive Meeting Minutes
                </span>
                <h3 className="text-2xl font-bold font-sans text-[#202124] tracking-tight">
                  {meetingTitle || "Untitled Meeting"}
                </h3>
                <div className="text-xs font-sans text-[#777777] mt-2 space-y-0.5">
                  <p>
                    <strong className="text-[#202124]">Date & Time:</strong> {meetingDate} ({startTime} – {endTime})
                  </p>
                  <p>
                    <strong className="text-[#202124]">Attendees:</strong> {participants}
                  </p>
                </div>
              </div>

              {/* Agenda */}
              <div>
                <h4 className="text-xs font-sans font-bold text-[#202124] uppercase tracking-wider mb-2">
                  1. Agenda Items
                </h4>
                <p className="text-xs leading-relaxed whitespace-pre-line text-[#202124]">
                  {agenda}
                </p>
              </div>

              {/* Discussion Points */}
              <div>
                <h4 className="text-xs font-sans font-bold text-[#202124] uppercase tracking-wider mb-2">
                  2. Discussion Summary
                </h4>
                <p className="text-xs leading-relaxed whitespace-pre-line text-[#202124]">
                  {discussionPoints}
                </p>
              </div>

              {/* Decisions */}
              <div>
                <h4 className="text-xs font-sans font-bold text-[#202124] uppercase tracking-wider mb-2">
                  3. Key Decisions
                </h4>
                <p className="text-xs leading-relaxed whitespace-pre-line text-[#202124]">
                  {decisionsMade}
                </p>
              </div>

              {/* Action Items Table */}
              <div>
                <h4 className="text-xs font-sans font-bold text-[#202124] uppercase tracking-wider mb-3">
                  4. Action Items & Next Deliverables
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-sans">
                    <thead>
                      <tr className="border-b-2 border-white/80 text-left text-[#777777] font-bold uppercase tracking-wider">
                        <th className="py-2 pr-3">Action Item</th>
                        <th className="py-2 px-3">Owner</th>
                        <th className="py-2 px-3">Deadline</th>
                        <th className="py-2 pl-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {actionItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 pr-3 font-medium text-[#202124]">
                            {item.task || "Unspecified task"}
                          </td>
                          <td className="py-2.5 px-3 text-[#777777]">{item.owner || "Unassigned"}</td>
                          <td className="py-2.5 px-3 font-mono text-[#777777]">{item.deadline}</td>
                          <td className="py-2.5 pl-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === "Done"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : item.status === "In Progress"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-white/30 text-[#777777]"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
