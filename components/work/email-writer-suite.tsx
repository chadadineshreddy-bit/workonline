"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Copy,
  Check,
  RotateCcw,
  Download,
  Sparkles,
  ChevronRight,
  Send,
  Sliders,
  Layers,
  FileText
} from "lucide-react";
import { Document, Paragraph, TextRun, Packer } from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

type EmailTone = "Professional" | "Formal" | "Friendly" | "Polite" | "Concise" | "Apologetic";

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  defaultSubject: string;
  generateBody: (recipient: string, sender: string, purpose: string, points: string) => string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "leave-request",
    name: "Leave Request",
    category: "HR & Personal",
    defaultSubject: "Request for Leave of Absence — [Your Name]",
    generateBody: (rec, sender, purpose, points) =>
      `Dear ${rec || "Manager"},\n\nI am writing to formally request leave of absence from [Start Date] to [End Date] due to ${purpose || "personal commitments"}.\n\nDuring my absence, I have ensured that my current tasks are organized: ${points || "I have briefed [Colleague Name] on urgent project deliverables and finalized all pending pull requests"}. I will have limited access to my email and can be reached on my phone for any urgent emergencies.\n\nI look forward to your approval and resuming my responsibilities on [Return Date].\n\nThank you for your understanding.\n\nBest regards,\n${sender || "Your Name"}`,
  },
  {
    id: "meeting-invite",
    name: "Meeting Invitation",
    category: "Collaboration",
    defaultSubject: "Invitation: [Project Name] Discussion & Alignment",
    generateBody: (rec, sender, purpose, points) =>
      `Hi ${rec || "Team"},\n\nI would like to schedule a brief meeting to discuss ${purpose || "our upcoming milestone roadmap and team deliverables"}.\n\nKey agenda points:\n${points || "• Review current progress against Q4 objectives\n• Address key technical bottlenecks\n• Align on ownership and next sprint deadlines"}\n\nPlease let me know if [Proposed Date and Time, e.g. Thursday at 2:00 PM EST] works for your schedule, or feel free to suggest an alternative time that suits you.\n\nLooking forward to speaking with you.\n\nBest regards,\n${sender || "Your Name"}`,
  },
  {
    id: "meeting-followup",
    name: "Meeting Follow-up & Action Items",
    category: "Collaboration",
    defaultSubject: "Follow-up & Action Items: [Meeting Topic]",
    generateBody: (rec, sender, purpose, points) =>
      `Hi ${rec || "Team"},\n\nThank you for your time during our discussion today regarding ${purpose || "the platform architecture review"}.\n\nAs discussed, here is a summary of the key action items and next steps:\n${points || "1. Finalize the API interface documentation by Friday (Owner: [Name])\n2. Run performance benchmarks on database indexing (Owner: [Name])\n3. Schedule a client demo for early next week"}\n\nPlease reply directly if anything was missed or requires further clarification.\n\nBest regards,\n${sender || "Your Name"}`,
  },
  {
    id: "job-application",
    name: "Job Application",
    category: "Career",
    defaultSubject: "Application for [Role Title] — [Your Name]",
    generateBody: (rec, sender, purpose, points) =>
      `Dear ${rec || "Hiring Team"},\n\nI am writing to express my strong enthusiasm for the [Job Title] role at [Company Name]. With my background in ${purpose || "full-stack software engineering and scalable system design"}, I am confident that my technical skills and ownership mindset align well with your team's mission.\n\nHighlights of my qualifications:\n${points || "• Over 4+ years of experience architecting resilient web services\n• Proven record of reducing system latency and accelerating sprint velocity\n• Deep expertise in Next.js, TypeScript, cloud deployments, and distributed systems"}\n\nI have attached my resume for your review and welcome the chance to discuss how I can contribute to your engineering objectives.\n\nSincerely,\n${sender || "Your Name"}`,
  },
  {
    id: "interview-followup",
    name: "Interview Follow-up & Thank You",
    category: "Career",
    defaultSubject: "Thank you for the opportunity — [Job Title] Interview",
    generateBody: (rec, sender, purpose, points) =>
      `Dear ${rec || "Interviewer"},\n\nThank you very much for taking the time to speak with me today about the [Job Title] position. I thoroughly enjoyed our conversation, especially learning more about ${purpose || "how your engineering team tackles real-time data streaming"}.\n\nOur discussion reinforced my excitement about the opportunity: ${points || "My background in optimizing client-side performance directly addresses the challenges we discussed"}.\n\nPlease let me know if you need any additional code samples, references, or details from my side.\n\nWarm regards,\n${sender || "Your Name"}`,
  },
  {
    id: "resignation",
    name: "Resignation Notice",
    category: "HR & Personal",
    defaultSubject: "Formal Notice of Resignation — [Your Name]",
    generateBody: (rec, sender, purpose, points) =>
      `Dear ${rec || "Manager"},\n\nPlease accept this email as formal notice that I am resigning from my position as [Your Job Title] at [Company Name]. My last working day will be [Last Working Date, e.g. November 30, 2026].\n\n${purpose || "I have accepted a new career opportunity that aligns with my long-term technical goals"}.\n\nDuring my remaining notice period, I will focus on:\n${points || "• Transitioning ongoing projects to the team\n• Documenting core architecture and deployment workflows\n• Assisting in onboarding my successor"}\n\nI want to thank you for the mentorship and support throughout my time here. I wish the company continued success.\n\nSincerely,\n${sender || "Your Name"}`,
  },
  {
    id: "project-update",
    name: "Project Status Update",
    category: "Management",
    defaultSubject: "Weekly Project Status: [Project Name] — [Week/Date]",
    generateBody: (rec, sender, purpose, points) =>
      `Hi ${rec || "Team"},\n\nHere is our executive progress report for ${purpose || "the Q4 customer portal launch"}.\n\nHighlights & Completed Items:\n${points || "• Finalized the payment gateway sandbox integration\n• Passed full regression test suite (100% test pass rate)\n• Deployed staging release candidate for user acceptance testing"}\n\nBlockers / Risks:\nNone at this time. All deliverables remain on schedule for production release on [Target Date].\n\nPlease let me know if you have any questions.\n\nBest regards,\n${sender || "Your Name"}`,
  },
  {
    id: "client-communication",
    name: "Client Check-in / Proposal",
    category: "Business",
    defaultSubject: "[Company Name] — Project Proposal & Scope Review",
    generateBody: (rec, sender, purpose, points) =>
      `Dear ${rec || "Client Name"},\n\nI hope this email finds you well. I am following up on our recent conversation regarding ${purpose || "the custom software solution for your team"}.\n\nWe have outlined a tailored roadmap designed to achieve your key business goals:\n${points || "• Streamlined data workflow saving an estimated 10+ hours weekly\n• High-security cloud infrastructure adhering to industry compliance\n• Comprehensive onboarding and ongoing technical support"}\n\nI have attached our detailed proposal and deliverables schedule. Would you have 15 minutes this Thursday or Friday for a quick walk-through?\n\nSincerely,\n${sender || "Your Name"}`,
  },
  {
    id: "wfh-request",
    name: "Work-From-Home Request",
    category: "HR & Personal",
    defaultSubject: "Work From Home Request — [Date]",
    generateBody: (rec, sender, purpose, points) =>
      `Hi ${rec || "Manager"},\n\nI would like to request permission to work remotely from home on [Date, e.g. Friday, November 20].\n\nReason: ${purpose || "To accommodate scheduled home maintenance / focus on deep work deliverables"}.\n\nI will maintain normal working hours, attend all scheduled virtual meetings, and remain reachable via Slack and email throughout the day: ${points || "My main priority will be wrapping up the sprint documentation and code reviews"}.\n\nThank you for considering my request.\n\nBest regards,\n${sender || "Your Name"}`,
  },
  {
    id: "thank-you",
    name: "Professional Thank You",
    category: "General",
    defaultSubject: "Thank you for your partnership and support",
    generateBody: (rec, sender, purpose, points) =>
      `Dear ${rec || "Colleague / Partner"},\n\nI wanted to take a moment to express my sincere gratitude for your help with ${purpose || "successfully closing the product release on schedule"}.\n\nYour contribution made an enormous difference: ${points || "Your quick response on the critical bug fix and dedication over the weekend kept the entire team moving forward"}.\n\nIt is truly a pleasure collaborating with you, and I look forward to our next project together.\n\nWarm regards,\n${sender || "Your Name"}`,
  },
];

export function EmailWriterSuite() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("leave-request");
  const [tone, setTone] = useState<EmailTone>("Professional");

  // Form Fields
  const [recipient, setRecipient] = useState("Sarah Jenkins");
  const [senderName, setSenderName] = useState("Jonathan Doe");
  const [subject, setSubject] = useState("Request for Leave of Absence — Jonathan Doe");
  const [purpose, setPurpose] = useState("a family commitment and scheduled medical appointment");
  const [keyPoints, setKeyPoints] = useState(
    "All pending pull requests have been reviewed, and critical handover notes are shared with Michael."
  );

  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Active template
  const activeTpl = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate) || EMAIL_TEMPLATES[0];

  // Body content (editable)
  const [bodyText, setBodyText] = useState(() =>
    activeTpl.generateBody(recipient, senderName, purpose, keyPoints)
  );

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    const tpl = EMAIL_TEMPLATES.find((t) => t.id === id);
    if (tpl) {
      setSubject(tpl.defaultSubject.replace("[Your Name]", senderName || "Your Name"));
      setBodyText(tpl.generateBody(recipient, senderName, purpose, keyPoints));
    }
  };

  const handleApplyForm = () => {
    setBodyText(activeTpl.generateBody(recipient, senderName, purpose, keyPoints));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${bodyText}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy email.");
    }
  };

  const handleClear = () => {
    setBodyText("");
    setSubject("");
  };

  const handleDownloadTxt = () => {
    const full = `Subject: ${subject}\n\n${bodyText}`;
    const blob = new Blob([full], { type: "text/plain;charset=utf-8" });
    triggerBlobDownload(blob, `${selectedTemplate}-email.txt`);
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const paragraphs: Paragraph[] = [
        new Paragraph({
          children: [
            new TextRun({ text: "SUBJECT: ", bold: true, size: 24 }),
            new TextRun({ text: subject, bold: true, size: 24, color: "1E293B" }),
          ],
          spacing: { after: 240 },
        }),
      ];

      const lines = bodyText.split("\n\n");
      for (const line of lines) {
        if (line.trim().length > 0) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: line.trim(), size: 22 })],
              spacing: { after: 180, line: 320 },
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
      triggerBlobDownload(blob, `${selectedTemplate}-email.docx`);
    } catch (err) {
      console.error(err);
      alert("Failed to export as DOCX.");
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
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-[#F04452]">
                <Mail className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Professional Workplace Email Writer
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#777777]" />
              <span>Clear</span>
            </button>
            <button
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#777777]" />
              <span>TXT</span>
            </button>
            <button
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#F04452]" />
              <span>{isExportingDocx ? "Exporting..." : "DOCX"}</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Email"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Workplace Email Writer
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Compose courteous, well-structured professional communications for leave requests, meeting follow-ups, client proposals, and team updates.
          </p>
        </div>

        {/* Template Selector Chips */}
        <div className="liquid-glass-card rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F04452]" /> Ready-Made Workplace Templates ({EMAIL_TEMPLATES.length})
            </span>
            <span className="text-xs text-[#777777]">
              Select a scenario to populate business verbiage
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {EMAIL_TEMPLATES.map((tpl) => {
              const isActive = tpl.id === selectedTemplate;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs font-semibold"
                      : "bg-white/30 text-[#202124] hover:bg-slate-200"
                  }`}
                >
                  {tpl.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Composer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Settings */}
          <div className="lg:col-span-5 space-y-4">
            <div className="liquid-glass-card rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#F04452]" /> Email Parameters
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Jonathan Doe"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Email Tone
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["Professional", "Formal", "Friendly", "Polite", "Concise", "Apologetic"] as EmailTone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`text-[11px] py-1 rounded-md transition-colors ${
                        tone === t
                          ? "bg-slate-900 text-white font-semibold"
                          : "bg-white/30 text-[#777777] hover:bg-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Core Purpose / Main Reason
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. scheduled medical appointment / quarterly review"
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Key Points / Action Items to Highlight
                </label>
                <textarea
                  rows={3}
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  placeholder="Key deliverables, delegation, next steps..."
                  className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyForm}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/15 text-[#D72638] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Re-Compose Email Body
              </button>
            </div>
          </div>

          {/* Right Editor Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="floating-glass-canvas rounded-3xl shadow-xl p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm font-bold text-[#202124] px-3 py-2 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block mb-1">
                  Email Body (Fully Editable)
                </label>
                <textarea
                  rows={15}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-white/80 font-serif leading-relaxed text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/60 text-xs text-[#777777]">
                <span>{bodyText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  Tone: {tone} • Ready to copy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
