"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Building,
  User,
  Calendar,
  Layers,
  ChevronRight,
  Send,
  Info
} from "lucide-react";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

export type LetterType =
  | "leave"
  | "resignation"
  | "formal-request"
  | "permission"
  | "recommendation"
  | "experience-request"
  | "application";

interface LetterPreset {
  id: LetterType;
  label: string;
  category: "Professional" | "Academic" | "HR";
  defaultSubject: string;
  defaultRecipientTitle: string;
  defaultRecipientOrg: string;
  generateBody: (sender: string, recipient: string, org: string, date: string) => string;
}

const LETTER_PRESETS: LetterPreset[] = [
  {
    id: "leave",
    label: "Leave Application",
    category: "Professional",
    defaultSubject: "Application for Casual Leave / Medical Leave",
    defaultRecipientTitle: "Human Resources / Reporting Manager",
    defaultRecipientOrg: "WorkOnline Technologies Inc.",
    generateBody: (sender, recipient, org) =>
      `Dear ${recipient || "Manager"},\n\nI am writing to formally request leave of absence from work from [Start Date] to [End Date], comprising [Number] working days, due to [personal reasons / medical emergency / family commitment].\n\nI have delegated my immediate responsibilities to [Colleague's Name] and completed all pending critical handovers. I will remain reachable via email at [Your Email] for any urgent matters that may require my input during this period.\n\nI kindly request you to approve my leave application. I look forward to resuming my duties on [Resumption Date].\n\nThank you for your understanding.\n\nSincerely,\n\n${sender || "Your Name"}`,
  },
  {
    id: "resignation",
    label: "Resignation Letter",
    category: "Professional",
    defaultSubject: "Formal Notice of Resignation — [Your Full Name]",
    defaultRecipientTitle: "Senior Director of Engineering",
    defaultRecipientOrg: "WorkOnline Technologies Inc.",
    generateBody: (sender, recipient, org) =>
      `Dear ${recipient || "Manager"},\n\nPlease accept this letter as formal notification that I am resigning from my position as [Your Job Title] at ${org || "the company"}. In accordance with my employment terms, my last working day will be [Last Working Date, e.g., November 30, 2026].\n\nI am immensely grateful for the opportunities, mentorship, and support I have received during my tenure here. Working alongside such talented colleagues has been a rewarding professional experience that has contributed significantly to my career growth.\n\nDuring my remaining notice period, I will dedicate my full efforts to ensuring a seamless transition of my ongoing projects and documentation. Please let me know how best I can assist in onboarding my successor.\n\nI wish ${org || "the company"} continued success in all future endeavors.\n\nWarm regards,\n\n${sender || "Your Name"}`,
  },
  {
    id: "formal-request",
    label: "Formal Request",
    category: "Professional",
    defaultSubject: "Formal Request for [Equipment / Budget / Software License]",
    defaultRecipientTitle: "Department Head / Operations Manager",
    defaultRecipientOrg: "Acme Corporation",
    generateBody: (sender, recipient, org) =>
      `Dear ${recipient || "Department Head"},\n\nI am writing to formally request approval for [specific request details, e.g. upgrading testing workstation hardware / subscribing to specialized analytical software].\n\nThis resource is essential for [explain justification: e.g. streamlining our Q4 testing pipeline and decreasing build latency by an estimated 35%]. The estimated expenditure is [Amount or 'detailed in the attached quotation'].\n\nI have thoroughly reviewed alternative solutions and believe this proposal offers the most cost-effective and dependable outcome for our team's operational goals.\n\nI would be delighted to schedule a brief discussion to walk through any questions. Thank you for your review and consideration.\n\nRespectfully,\n\n${sender || "Your Name"}`,
  },
  {
    id: "permission",
    label: "Permission Letter",
    category: "Academic",
    defaultSubject: "Permission to Access [Campus Laboratory / Facility / Archive]",
    defaultRecipientTitle: "Head of Department / Academic Dean",
    defaultRecipientOrg: "Department of Computer Science & Engineering",
    generateBody: (sender, recipient, org) =>
      `Respected ${recipient || "Dean / Professor"},\n\nI am writing to formally request your permission to utilize the [Facility / Lab Name, e.g., High-Performance Computing Laboratory] from [Start Date] to [End Date] between [Working Hours].\n\nThis access is required in connection with my capstone research project entitled \"[Project Title]\", supervised by [Advisor Name]. The project requires specialized equipment and environments available only within your department.\n\nI pledge to abide strictly by all departmental regulations, safety protocols, and laboratory guidelines during my tenure in the facility.\n\nThank you for your time, guidance, and favorable consideration.\n\nYours faithfully,\n\n${sender || "Student Name"}\n[Roll / Student ID Number]`,
  },
  {
    id: "recommendation",
    label: "Recommendation Request",
    category: "Academic",
    defaultSubject: "Request for Academic / Professional Letter of Recommendation",
    defaultRecipientTitle: "Dr. Evelyn Vance, Professor",
    defaultRecipientOrg: "School of Engineering & Applied Sciences",
    generateBody: (sender, recipient, org) =>
      `Dear ${recipient || "Professor"},\n\nI hope this letter finds you well. I am writing to respectfully ask if you would feel comfortable writing a strong letter of recommendation on my behalf for my application to [Target Graduate Program / Fellowship / Company Name].\n\nI thoroughly enjoyed your course on [Course Name] during the [Semester/Year] semester, where I worked on [Key Project / Research Topic] and earned an [Grade, e.g., 'A']. Your insights into [specific domain] deeply inspired my aspiration to specialize in this field.\n\nThe submission deadline for the application is [Deadline Date]. I have attached my updated curriculum vitae, academic transcript, and personal statement for your convenience.\n\nThank you very much for your mentorship, encouragement, and support.\n\nWarm regards,\n\n${sender || "Your Name"}`,
  },
  {
    id: "experience-request",
    label: "Experience Certificate",
    category: "HR",
    defaultSubject: "Request for Work Experience Certificate & Relieving Letter",
    defaultRecipientTitle: "Human Resources Department",
    defaultRecipientOrg: "Apex Global Solutions Ltd.",
    generateBody: (sender, recipient, org) =>
      `Dear ${recipient || "HR Team"},\n\nI am writing to formally request the issuance of my Work Experience Certificate and Relieving Letter. I was employed with ${org || "the organization"} as [Job Title] under Employee ID [Employee ID] from [Joining Date] to [Relieving Date].\n\nAll exit formalities, property handovers, and department clearances were successfully finalized on [Clearance Date].\n\nI require these documents for [higher education admissions / employment verification with my prospective employer]. Kindly arrange to provide digital stamped copies via email, and if possible, inform me when the physical certificates are ready for collection.\n\nThank you for your prompt assistance and support.\n\nSincerely,\n\n${sender || "Your Name"}\nContact: [Your Phone Number]`,
  },
  {
    id: "application",
    label: "Formal Application",
    category: "Professional",
    defaultSubject: "Application for the Position of [Position Name]",
    defaultRecipientTitle: "Selection Committee / Hiring Director",
    defaultRecipientOrg: "Global Innovation Institute",
    generateBody: (sender, recipient, org) =>
      `Dear ${recipient || "Hiring Committee"},\n\nI am writing to formally submit my application for [Opportunity / Fellowship / Position Name] as advertised on [Platform or Date].\n\nWith a rigorous background in [Field of Study / Expertise] and demonstrated achievements in [Notable project or skill], I am confident that my qualifications and dedication make me an exceptional fit for this opportunity.\n\nEnclosed with this letter are my comprehensive resume, academic credentials, and references. I welcome the opportunity to discuss my candidacy in further detail during an interview.\n\nThank you for your time, consideration, and review of my application materials.\n\nSincerely,\n\n${sender || "Your Name"}`,
  },
];

export function LetterGeneratorSuite() {
  const [selectedType, setSelectedType] = useState<LetterType>("formal-request");
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Form Fields
  const [senderName, setSenderName] = useState("Jonathan Doe");
  const [senderTitle, setSenderTitle] = useState("Software Engineer");
  const [senderEmail, setSenderEmail] = useState("jonathan.doe@example.com");
  const [senderPhone, setSenderPhone] = useState("+1 (555) 019-2834");
  const [senderAddress, setSenderAddress] = useState("456 Innovation Way, San Francisco, CA");

  const [date, setDate] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );

  const [recipientName, setRecipientName] = useState("Ms. Sarah Jenkins");
  const [recipientTitle, setRecipientTitle] = useState("Director of Engineering");
  const [recipientOrg, setRecipientOrg] = useState("WorkOnline Technologies Inc.");
  const [recipientAddress, setRecipientAddress] = useState("100 Market Street, Suite 500, San Francisco, CA");

  const activePreset = LETTER_PRESETS.find((p) => p.id === selectedType) || LETTER_PRESETS[0];

  const [subject, setSubject] = useState(activePreset.defaultSubject);
  const [body, setBody] = useState(() =>
    activePreset.generateBody(senderName, recipientName, recipientOrg, date)
  );

  // When preset switches
  const handleTypeChange = (newType: LetterType) => {
    setSelectedType(newType);
    const preset = LETTER_PRESETS.find((p) => p.id === newType);
    if (preset) {
      setSubject(preset.defaultSubject);
      setBody(preset.generateBody(senderName, recipientName, recipientOrg, date));
    }
  };

  const handleCopyText = async () => {
    const fullLetter = `${senderName}\n${senderTitle}\n${senderAddress}\n${senderEmail} | ${senderPhone}\n\n${date}\n\n${recipientName}\n${recipientTitle}\n${recipientOrg}\n${recipientAddress}\n\nSubject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy to clipboard.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const paragraphs: Paragraph[] = [];

      // Sender Info
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: senderName,
              bold: true,
              size: 24, // 12pt
              font: "Calibri",
            }),
          ],
        })
      );
      if (senderTitle) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: senderTitle,
                italics: true,
                size: 20,
                color: "555555",
                font: "Calibri",
              }),
            ],
          })
        );
      }
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${senderAddress} • ${senderEmail} • ${senderPhone}`,
              size: 19,
              color: "666666",
              font: "Calibri",
            }),
          ],
        })
      );

      // Spacer
      paragraphs.push(new Paragraph({ text: "" }));

      // Date
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: date,
              size: 21,
              font: "Calibri",
            }),
          ],
        })
      );

      paragraphs.push(new Paragraph({ text: "" }));

      // Recipient
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: recipientName,
              bold: true,
              size: 21,
              font: "Calibri",
            }),
          ],
        })
      );
      if (recipientTitle) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: recipientTitle,
                size: 21,
                font: "Calibri",
              }),
            ],
          })
        );
      }
      if (recipientOrg) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: recipientOrg,
                size: 21,
                font: "Calibri",
              }),
            ],
          })
        );
      }
      if (recipientAddress) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: recipientAddress,
                size: 21,
                color: "444444",
                font: "Calibri",
              }),
            ],
          })
        );
      }

      paragraphs.push(new Paragraph({ text: "" }));

      // Subject
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `SUBJECT: `,
              bold: true,
              size: 21,
              font: "Calibri",
            }),
            new TextRun({
              text: subject,
              bold: true,
              size: 21,
              font: "Calibri",
            }),
          ],
        })
      );

      paragraphs.push(new Paragraph({ text: "" }));

      // Body paragraphs
      const bodyLines = body.split("\n\n");
      for (const line of bodyLines) {
        if (line.trim().length > 0) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  size: 21,
                  font: "Calibri",
                }),
              ],
              spacing: { after: 180, line: 320 },
            })
          );
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch
                  bottom: 1440,
                  left: 1440,
                  right: 1440,
                },
              },
            },
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      triggerBlobDownload(
        blob,
        `${selectedType}-letter-${senderName.toLowerCase().replace(/\s+/g, "-")}.docx`
      );
    } catch (err) {
      console.error("DOCX generation error:", err);
      alert("Failed to export letter as DOCX.");
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
              href="/documents"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Document Studio <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-[#F04452]">
                <FileText className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Professional Letter Generator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Preset Selector Chips */}
        <div className="liquid-glass-card rounded-2xl p-4 mb-6 shadow-xs print:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F04452]" />
              Select Letter Type
            </span>
            <span className="text-xs text-[#777777]">
              Pick a template to preload formal corporate & academic verbiage
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {LETTER_PRESETS.map((p) => {
              const isActive = p.id === selectedType;
              return (
                <button
                  key={p.id}
                  onClick={() => handleTypeChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs font-semibold"
                      : "bg-white/30 text-[#202124] hover:bg-slate-200"
                  }`}
                >
                  <span>{p.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? "bg-red-500/100 text-white" : "bg-white text-[#777777] border border-white/80"
                    }`}
                  >
                    {p.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Controls */}
          <div className="lg:col-span-5 space-y-4 print:hidden">
            {/* Sender Card */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#F04452]" /> Sender Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Your Full Name</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Title / Designation</label>
                    <input
                      type="text"
                      value={senderTitle}
                      onChange={(e) => setSenderTitle(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Email Address</label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Phone</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Address / City</label>
                  <input
                    type="text"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
              </div>
            </div>

            {/* Recipient & Date Card */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#F04452]" /> Recipient Details
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Recipient Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Recipient Title</label>
                    <input
                      type="text"
                      value={recipientTitle}
                      onChange={(e) => setRecipientTitle(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Organization / Company</label>
                    <input
                      type="text"
                      value={recipientOrg}
                      onChange={(e) => setRecipientOrg(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Recipient Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
              </div>
            </div>

            {/* Subject & Body Card */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#F04452]" /> Letter Content
                </h3>
                <button
                  onClick={() => {
                    setBody(activePreset.generateBody(senderName, recipientName, recipientOrg, date));
                    setSubject(activePreset.defaultSubject);
                  }}
                  className="text-[11px] text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Text
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 font-semibold focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Letter Body</label>
                  <textarea
                    rows={12}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-white/80 font-serif leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 resize-y"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Preview Canvas */}
          <div className="lg:col-span-7">
            <div className="sticky top-20">
              <div className="bg-slate-200 rounded-t-xl px-4 py-2 flex items-center justify-between text-xs text-[#777777] print:hidden">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#F04452]" /> Live Letter Preview (Standard A4 Format)
                </span>
                <span className="text-[11px] text-[#777777]">
                  Ready to print or export
                </span>
              </div>

              {/* Printable Letter Sheet */}
              <div
                id="letter-preview-sheet"
                className="bg-white rounded-b-xl lg:rounded-b-none border border-white/80 shadow-lg p-10 sm:p-14 text-[#202124] font-serif min-h-[800px] print:shadow-none print:border-none print:p-0 print:m-0"
              >
                {/* Header / Sender */}
                <div className="border-b border-white/80 pb-5 mb-6">
                  <h2 className="text-xl font-bold text-[#202124] tracking-tight font-sans">
                    {senderName || "Your Full Name"}
                  </h2>
                  {senderTitle && (
                    <p className="text-xs font-medium text-[#F04452] mt-0.5 font-sans">
                      {senderTitle}
                    </p>
                  )}
                  <p className="text-xs text-[#777777] mt-1 font-sans">
                    {[senderAddress, senderEmail, senderPhone].filter(Boolean).join("  •  ")}
                  </p>
                </div>

                {/* Date */}
                <div className="text-xs text-[#777777] mb-6 font-sans">
                  {date}
                </div>

                {/* Recipient */}
                <div className="text-xs text-[#202124] leading-relaxed mb-6 font-sans">
                  <p className="font-bold text-[#202124]">{recipientName}</p>
                  {recipientTitle && <p>{recipientTitle}</p>}
                  {recipientOrg && <p className="font-semibold text-[#202124]">{recipientOrg}</p>}
                  {recipientAddress && <p className="text-[#777777]">{recipientAddress}</p>}
                </div>

                {/* Subject */}
                {subject && (
                  <div className="text-sm font-bold text-[#202124] mb-6 pb-2 border-b border-white/60 font-sans uppercase tracking-wide">
                    Subject: <span className="font-semibold text-[#202124] normal-case">{subject}</span>
                  </div>
                )}

                {/* Body Content */}
                <div className="text-[13px] leading-relaxed text-[#202124] space-y-4 whitespace-pre-line font-serif">
                  {body}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
