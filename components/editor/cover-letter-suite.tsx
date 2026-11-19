"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Download,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Building,
  User,
  Briefcase
} from "lucide-react";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

type CoverLetterTone = "formal" | "modern" | "impactful" | "entry";

export function CoverLetterSuite() {
  const [tone, setTone] = useState<CoverLetterTone>("formal");
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Form inputs
  const [candidateName, setCandidateName] = useState("Alex Rivera");
  const [candidateEmail, setCandidateEmail] = useState("alex.rivera@example.com");
  const [candidatePhone, setCandidatePhone] = useState("+1 (555) 234-5678");
  const [candidateLocation, setCandidateLocation] = useState("San Francisco, CA");

  const [companyName, setCompanyName] = useState("Stripe Inc.");
  const [jobTitle, setJobTitle] = useState("Senior Full-Stack Engineer");
  const [hiringManager, setHiringManager] = useState("Engineering Hiring Team");
  const [yearsExperience, setYearsExperience] = useState("6+");
  const [topSkills, setTopSkills] = useState("Next.js, TypeScript, distributed systems, and real-time collaboration engines");
  const [customWhy, setCustomWhy] = useState("I have admired Stripe's developer-first documentation and reliable financial infrastructure for years. My background in building sub-second web platforms aligns directly with your mission.");

  // Body text state (editable)
  const generateLetterContent = (currentTone: CoverLetterTone) => {
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (currentTone === "impactful") {
      return `Dear ${hiringManager || "Hiring Team"},\n\nI am writing to express my strong enthusiasm for the ${jobTitle} position at ${companyName}. With over ${yearsExperience} years of experience architecting high-scale web platforms and optimizing critical services, I bring a proven track record of solving complex technical challenges while accelerating product delivery.\n\nAt my previous roles, I led initiatives that reduced API response latency by 40% and engineered responsive user interfaces supporting hundreds of thousands of active users. My core technical expertise spans ${topSkills}.\n\n${customWhy}\n\nI would welcome the opportunity to discuss how my technical leadership and background can deliver immediate impact to ${companyName}. Thank you for your consideration.\n\nSincerely,\n\n${candidateName}`;
    }

    if (currentTone === "entry") {
      return `Dear ${hiringManager || "Hiring Manager"},\n\nI am thrilled to apply for the ${jobTitle} role at ${companyName}. As an ambitious technologist with a solid foundation in ${topSkills}, I am eager to contribute fresh perspectives and rigorous problem-solving to your engineering team.\n\nThroughout my coursework and engineering projects, I have demonstrated a strong commitment to clean code, robust documentation, and user-centric design. ${customWhy}\n\nI am confident that my rapid learning ability and enthusiasm make me a strong candidate for this position. Thank you for taking the time to review my application.\n\nWarm regards,\n\n${candidateName}`;
    }

    // Default Formal / Modern
    return `Dear ${hiringManager || "Hiring Manager"},\n\nI am writing to submit my application for the ${jobTitle} position currently open at ${companyName}. With ${yearsExperience} years of dedicated experience and deep familiarity with ${topSkills}, I am confident in my ability to make a meaningful contribution to your team.\n\nThroughout my career, I have focused on building resilient, accessible, and performant web applications. ${customWhy}\n\nI would welcome the chance to speak further with you regarding how my technical qualifications align with the needs of ${companyName}. Thank you for your time and consideration.\n\nSincerely,\n\n${candidateName}`;
  };

  const [letterBody, setLetterBody] = useState(() => generateLetterContent("formal"));

  // Switch tone
  const handleToneChange = (newTone: CoverLetterTone) => {
    setTone(newTone);
    setLetterBody(generateLetterContent(newTone));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      const paragraphs: Paragraph[] = [
        new Paragraph({
          text: candidateName,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${candidateEmail} | ${candidatePhone} | ${candidateLocation}` }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${hiringManager}\n${companyName}` }),
          ],
          spacing: { after: 200 },
        }),
      ];

      letterBody.split("\n\n").forEach((paragraphText) => {
        if (paragraphText.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [new TextRun(paragraphText.trim())],
              spacing: { after: 140 },
            })
          );
        }
      });

      const doc = new Document({
        title: `${candidateName} Cover Letter`,
        sections: [{ children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      triggerBlobDownload(blob, `${candidateName.replace(/\s+/g, "_")}_Cover_Letter.docx`);
    } catch (err) {
      console.error(err);
      alert("Error generating DOCX cover letter.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="min-h-screen bg-white/30 dark:bg-slate-950 flex flex-col font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-white/80 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-subtle print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#202124] dark:text-white hidden sm:inline">
              WorkOnline Cover Letter Studio
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/80 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-800 text-xs font-semibold text-[#202124] dark:text-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Text"}</span>
          </button>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/80 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-800 text-xs font-semibold text-[#202124] dark:text-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-[#F04452]" />
            <span className="hidden sm:inline">Export DOCX</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 liquid-btn-primary rounded-lg text-xs font-semibold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Configuration (Col 5) */}
          <div className="space-y-5 lg:col-span-5 print:hidden">
            {/* Tone Selector */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Letter Tone & Template
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "formal", label: "Formal Corporate" },
                  { id: "impactful", label: "Direct & Impactful" },
                  { id: "modern", label: "Modern Standard" },
                  { id: "entry", label: "Early Career / Student" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToneChange(t.id as CoverLetterTone)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-colors ${
                      tone === t.id
                        ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white border-blue-600 shadow-sm"
                        : "border-white/80 dark:border-slate-700 text-[#202124] dark:text-slate-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Info */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Candidate Details
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={candidateLocation}
                  onChange={(e) => setCandidateLocation(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Job & Target Company */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                Target Opportunity
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Role Title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Hiring Manager Name"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Years of Experience"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777777] dark:text-[#777777] mb-1">
                  Key Skills Highlighted
                </label>
                <input
                  type="text"
                  value={topSkills}
                  onChange={(e) => setTopSkills(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#777777] dark:text-[#777777] mb-1">
                  Why this company / personal connection
                </label>
                <textarea
                  rows={2}
                  value={customWhy}
                  onChange={(e) => setCustomWhy(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Live Editable A4 Letter Preview (Col 7) */}
          <div className="lg:col-span-7">
            <div className="bg-white text-[#202124] p-8 sm:p-14 rounded-2xl shadow-xl border border-white/80 max-w-[750px] mx-auto print:border-none print:shadow-none print:p-0">
              {/* Header */}
              <div className="border-b border-white/80 pb-4 mb-6">
                <h1 className="text-xl font-bold text-[#202124] uppercase tracking-tight">
                  {candidateName || "Your Name"}
                </h1>
                <p className="text-xs text-[#777777] mt-1">
                  {candidateEmail} • {candidatePhone} • {candidateLocation}
                </p>
              </div>

              <div className="text-xs text-[#777777] mb-6">
                <p>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                <p className="mt-2 font-semibold text-[#202124]">{hiringManager}</p>
                <p className="text-[#202124]">{companyName}</p>
              </div>

              {/* Editable Letter Body */}
              <div className="space-y-4 text-xs sm:text-sm text-[#202124] leading-relaxed font-sans">
                <textarea
                  rows={15}
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  className="w-full p-2 rounded border border-transparent hover:border-white/80 focus:border-blue-500 bg-transparent focus:outline-none resize-y leading-relaxed font-sans text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
