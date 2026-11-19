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
  ChevronRight,
  Building,
  User,
  Calendar,
  Layers,
  AlertCircle
} from "lucide-react";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";
import { convertTxtToPdfBlob } from "@/lib/docx/document-converters";

export type BusinessLetterType =
  | "proposal"
  | "client-intro"
  | "follow-up"
  | "request"
  | "permission"
  | "complaint"
  | "apology"
  | "resignation"
  | "experience-draft"
  | "recommendation-draft";

interface BusinessLetterTemplate {
  id: BusinessLetterType;
  label: string;
  category: "Client & Sales" | "Corporate Operations" | "HR & Career";
  defaultSubject: string;
  isOfficialDraft?: boolean;
  generateBody: (sender: string, recipient: string, company: string, date: string) => string;
}

const BUSINESS_TEMPLATES: BusinessLetterTemplate[] = [
  {
    id: "proposal",
    label: "Business Proposal",
    category: "Client & Sales",
    defaultSubject: "Commercial Proposal for [Project/Service Name]",
    generateBody: (sender, recipient, comp) =>
      `Dear ${recipient || "Partner"},\n\nWe are pleased to submit our formal commercial proposal for [Project Name]. At ${comp || "our firm"}, we specialize in engineering high-reliability software architectures and scalable productivity solutions tailored to dynamic enterprise environments.\n\nKey Strategic Deliverables:\n• Phase 1: Needs assessment, systems audit, and security boundary review\n• Phase 2: Core implementation, data migration, and sandbox integration\n• Phase 3: Comprehensive team onboarding, documentation, and continuous monitoring\n\nOur proposed investment schedule and service-level agreements are outlined in detail in the accompanying documentation. We believe this solution provides exceptional return on investment while eliminating operational bottlenecks.\n\nWe would welcome the opportunity to discuss this proposal with your team this week.\n\nSincerely,\n\n${sender || "Your Name"}\n[Your Title]`,
  },
  {
    id: "client-intro",
    label: "Client Introduction",
    category: "Client & Sales",
    defaultSubject: "Introduction: Innovative Productivity Solutions from [Your Company]",
    generateBody: (sender, recipient, comp) =>
      `Dear ${recipient || "Client"},\n\nI hope this letter finds you well. I am reaching out to introduce ${comp || "WorkOnline Technologies"}, a modern productivity and document intelligence workspace engineered for high-performance knowledge workers.\n\nWe help organizations streamline everyday document processing, eliminate browser clutter, and execute complex file conversions with guaranteed client-side security.\n\nI have closely followed ${recipient}'s growth in the industry and believe our automated workflows could significantly accelerate your team's day-to-day operations.\n\nI would love to arrange a brief 10-minute introductory call to explore potential synergy.\n\nBest regards,\n\n${sender || "Your Name"}\n[Your Title]`,
  },
  {
    id: "follow-up",
    label: "Client Follow-up",
    category: "Client & Sales",
    defaultSubject: "Follow-up: Discussion regarding [Topic/Deliverable]",
    generateBody: (sender, recipient) =>
      `Dear ${recipient || "Partner"},\n\nI am writing to follow up on our productive discussion on [Meeting Date] regarding [Project/Topic].\n\nAs agreed, we have refined the deliverables and timeline to address your feedback. We are fully prepared to initiate the next phase upon your confirmation.\n\nPlease let me know if you require any additional materials, references, or clarifications before moving forward.\n\nThank you for your continued partnership.\n\nWarm regards,\n\n${sender || "Your Name"}`,
  },
  {
    id: "request",
    label: "Formal Request",
    category: "Corporate Operations",
    defaultSubject: "Formal Request for Approval: [Equipment/Budget Allocation]",
    generateBody: (sender, recipient) =>
      `Dear ${recipient || "Department Head"},\n\nI am writing to formally request approval for [specific request details, e.g., departmental server upgrades / analytical software licenses].\n\nThis resource is essential to maintain our delivery velocity, decrease processing latency by an estimated 35%, and support increased workload demands in the upcoming quarter.\n\nI have attached the detailed cost breakdown and vendor comparison for your review. Thank you for your leadership and consideration.\n\nRespectfully,\n\n${sender || "Your Name"}`,
  },
  {
    id: "permission",
    label: "Permission Letter",
    category: "Corporate Operations",
    defaultSubject: "Request for Official Permission: [Event / Facility Use]",
    generateBody: (sender, recipient, comp) =>
      `Dear ${recipient || "Operations Committee"},\n\nI am writing to request permission to utilize [Facility Name / Conference Hall / Equipment] on [Date] from [Start Time] to [End Time] for the purpose of conducting [Event / Workshop Name].\n\nWe anticipate approximately [Number] attendees. All participants will strictly adhere to company safety protocols, property security standards, and IT usage guidelines.\n\nThank you in advance for your assistance and favorable approval.\n\nSincerely,\n\n${sender || "Your Name"}`,
  },
  {
    id: "complaint",
    label: "Formal Complaint",
    category: "Corporate Operations",
    defaultSubject: "Formal Notice: Service Non-Compliance / Delivery Discrepancy",
    generateBody: (sender, recipient, comp) =>
      `Dear ${recipient || "Vendor Management"},\n\nI am writing to register a formal complaint regarding [Product/Service/Order #], delivered on [Date].\n\nContrary to the agreed contract terms and service-level agreements, we encountered the following substantial discrepancies:\n1. [Discrepancy 1: e.g. Failure to meet latency threshold benchmarks]\n2. [Discrepancy 2: e.g. Incomplete documentation and delayed milestone handoffs]\n\nThese issues have caused notable operational delays for our team. We request an immediate review and written resolution plan within 5 business days, including appropriate credit or remediation.\n\nSincerely,\n\n${sender || "Your Name"}\n${comp || "Company Name"}`,
  },
  {
    id: "apology",
    label: "Official Apology",
    category: "Corporate Operations",
    defaultSubject: "Official Apology: [Incident / Service Disruption Explanation]",
    generateBody: (sender, recipient, comp) =>
      `Dear ${recipient || "Valued Client"},\n\nPlease accept our sincere apologies for [incident details, e.g. the unexpected service outage on November 12]. We understand the disruption this caused to your daily operations and deeply regret the inconvenience.\n\nOur engineering team identified the root cause as [brief technical reason] and immediately deployed preventative patches. We have implemented secondary automated redundancies to ensure this issue does not recur.\n\nYour trust is our highest priority, and we remain dedicated to providing the reliable infrastructure you expect from ${comp || "us"}.\n\nSincerely,\n\n${sender || "Your Name"}\n[Leadership Team]`,
  },
  {
    id: "resignation",
    label: "Resignation Notice",
    category: "HR & Career",
    defaultSubject: "Formal Notice of Resignation — [Your Full Name]",
    generateBody: (sender, recipient, comp) =>
      `Dear ${recipient || "Manager"},\n\nPlease accept this letter as formal notification that I am resigning from my position as [Your Job Title] at ${comp || "the company"}. My final working day will be [Last Working Date, e.g. November 30, 2026].\n\nI am deeply grateful for the opportunities, mentorship, and collegial environment I have enjoyed during my tenure here. Working alongside such dedicated professionals has contributed immensely to my professional career.\n\nDuring my notice period, I will ensure a thorough transition of all active projects, documentation, and handover processes.\n\nI wish ${comp || "the organization"} continued growth and success.\n\nWarm regards,\n\n${sender || "Your Name"}`,
  },
  {
    id: "experience-draft",
    label: "Experience Letter (Draft)",
    category: "HR & Career",
    isOfficialDraft: true,
    defaultSubject: "Draft Experience & Relieving Certificate for [Employee Name]",
    generateBody: (sender, recipient, comp) =>
      `TO WHOM IT MAY CONCERN\n\nThis is a preliminary draft certifying that [Employee Name] was employed with ${comp || "WorkOnline Technologies Inc."} from [Joining Date] to [Relieving Date] as a [Job Title].\n\nDuring their tenure, [Employee Name] demonstrated outstanding technical acumen, dedication, and professional integrity. Their key responsibilities included leading full-stack engineering initiatives and accelerating product velocity.\n\nAll exit formalities, property clearances, and contractual obligations have been satisfactorily completed.\n\nWe wish them all the best in their future professional endeavors.\n\nAuthorized Signatory (HR Department)\n${comp || "Company Name"}\n[Official Corporate Seal Required for Validity]`,
  },
  {
    id: "recommendation-draft",
    label: "Recommendation Draft",
    category: "HR & Career",
    isOfficialDraft: true,
    defaultSubject: "Professional Letter of Recommendation for [Candidate Name]",
    generateBody: (sender, recipient, comp) =>
      `Dear ${recipient || "Selection Committee"},\n\nIt is my pleasure to write this letter of recommendation on behalf of [Candidate Name], who worked under my direct supervision as [Job Title] at ${comp || "our organization"} for [Duration].\n\nDuring this period, [Candidate Name] consistently distinguished themselves through exceptional analytical problem-solving, collaborative leadership, and strong ownership of complex technical challenges.\n\nI am confident that [Candidate Name] will bring the same dedication, skill, and positive impact to your organization. I give them my highest recommendation without reservation.\n\nSincerely,\n\n${sender || "Your Name"}\n[Your Title / Department]`,
  },
];

export function BusinessLettersSuite() {
  const [selectedType, setSelectedType] = useState<BusinessLetterType>("proposal");

  const [senderName, setSenderName] = useState("Jonathan Doe");
  const [senderTitle, setSenderTitle] = useState("Director of Engineering");
  const [companyName, setCompanyName] = useState("WorkOnline Technologies Inc.");
  const [senderAddress, setSenderAddress] = useState("500 Howard Street, Suite 400, San Francisco, CA");

  const [recipientName, setRecipientName] = useState("Ms. Sarah Jenkins");
  const [recipientCompany, setRecipientCompany] = useState("Acme Cloud Solutions");
  const [recipientAddress, setRecipientAddress] = useState("100 Innovation Way, Austin, TX");

  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  );

  const activeTemplate =
    BUSINESS_TEMPLATES.find((t) => t.id === selectedType) || BUSINESS_TEMPLATES[0];

  const [subject, setSubject] = useState(activeTemplate.defaultSubject);
  const [body, setBody] = useState(() =>
    activeTemplate.generateBody(senderName, recipientName, companyName, date)
  );

  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handleTypeChange = (id: BusinessLetterType) => {
    setSelectedType(id);
    const tpl = BUSINESS_TEMPLATES.find((t) => t.id === id);
    if (tpl) {
      setSubject(tpl.defaultSubject);
      setBody(tpl.generateBody(senderName, recipientName, companyName, date));
    }
  };

  const getFullText = () => {
    return `${senderName}\n${senderTitle}\n${companyName}\n${senderAddress}\n\n${date}\n\n${recipientName}\n${recipientCompany}\n${recipientAddress}\n\nSubject: ${subject}\n\n${body}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getFullText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy letter.");
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await convertTxtToPdfBlob(getFullText(), subject);
      triggerBlobDownload(blob, `${selectedType}-letter.pdf`);
    } catch {
      alert("Failed to export PDF.");
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const paragraphs: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: senderName, bold: true, size: 24 })],
        }),
        new Paragraph({
          children: [new TextRun({ text: `${senderTitle} • ${companyName}`, size: 20, color: "555555" })],
        }),
        new Paragraph({
          children: [new TextRun({ text: senderAddress, size: 19, color: "777777" })],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: date }),
        new Paragraph({ text: "" }),
        new Paragraph({ children: [new TextRun({ text: recipientName, bold: true })] }),
        new Paragraph({ text: recipientCompany }),
        new Paragraph({ text: recipientAddress }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "SUBJECT: ", bold: true }),
            new TextRun({ text: subject, bold: true, color: "1E293B" }),
          ],
        }),
        new Paragraph({ text: "" }),
      ];

      body.split("\n\n").forEach((para) => {
        if (para.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: para.trim(), size: 22 })],
              spacing: { after: 180, line: 320 },
            })
          );
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      triggerBlobDownload(blob, `${selectedType}-business-letter.docx`);
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
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-[#F04452]">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Business & Corporate Letter Generator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#777777]" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleExportPdf}
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
            Corporate Letter Generator
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Draft formal business proposals, client introductions, formal requests, and employment notices in standard block format.
          </p>
        </div>

        {/* Legal Disclaimer for Experience & Recommendation Drafts */}
        {activeTemplate.isOfficialDraft && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Draft Notice:</strong> This document is an editable template draft for preparation purposes. Official experience and recommendation certificates must be printed on official company letterhead and signed with authorized corporate seals.
            </span>
          </div>
        )}

        {/* Template Selector */}
        <div className="liquid-glass-card rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F04452]" /> Select Business Letter Type
            </span>
            <span className="text-xs text-[#777777]">
              10 corporate letter scenarios
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {BUSINESS_TEMPLATES.map((tpl) => {
              const isActive = tpl.id === selectedType;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleTypeChange(tpl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs font-semibold"
                      : "bg-white/30 text-[#202124] hover:bg-slate-200"
                  }`}
                >
                  {tpl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="liquid-glass-card rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#F04452]" /> Sender & Recipient Details
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Your Title
                  </label>
                  <input
                    type="text"
                    value={senderTitle}
                    onChange={(e) => setSenderTitle(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Your Company / Firm
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Recipient Company
                  </label>
                  <input
                    type="text"
                    value={recipientCompany}
                    onChange={(e) => setRecipientCompany(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Live Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="floating-glass-canvas rounded-3xl shadow-xl p-8 sm:p-12 text-[#202124] font-serif min-h-[750px] space-y-6">
              {/* Sender Block */}
              <div className="border-b border-white/80 pb-5 font-sans">
                <h3 className="text-xl font-bold text-[#202124]">{senderName}</h3>
                <p className="text-xs text-[#F04452] font-semibold mt-0.5">{senderTitle}</p>
                <p className="text-xs text-[#777777]">{companyName}</p>
                <p className="text-xs text-[#777777]">{senderAddress}</p>
              </div>

              {/* Date */}
              <div className="text-xs text-[#777777] font-sans">{date}</div>

              {/* Recipient Block */}
              <div className="text-xs text-[#202124] font-sans leading-relaxed">
                <p className="font-bold text-[#202124]">{recipientName}</p>
                <p>{recipientCompany}</p>
                <p className="text-[#777777]">{recipientAddress}</p>
              </div>

              {/* Subject */}
              <div className="text-xs font-bold text-[#202124] font-sans uppercase tracking-wider pb-2 border-b border-white/60">
                SUBJECT: <span className="font-semibold normal-case text-[#202124]">{subject}</span>
              </div>

              {/* Body */}
              <div className="text-xs sm:text-sm leading-relaxed text-[#202124] whitespace-pre-line space-y-4">
                {body}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
