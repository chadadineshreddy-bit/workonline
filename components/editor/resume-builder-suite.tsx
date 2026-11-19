"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Globe,
  Plus,
  Trash2,
  Printer,
  Download,
  Eye,
  Edit3,
  Layers,
  ArrowUp,
  ArrowDown,
  Sparkles,
  FileCheck
} from "lucide-react";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

export type ResumeTemplate = "modern" | "executive" | "tech" | "minimal";

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string;
}

interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year: string;
  gpa: string;
}

interface ProjectItem {
  id: string;
  name: string;
  tech: string;
  link: string;
  description: string;
}

interface CertItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
}

export function ResumeBuilderSuite() {
  const [template, setTemplate] = useState<ResumeTemplate>("modern");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Personal info
  const [personal, setPersonal] = useState({
    fullName: "Alex Rivera",
    targetTitle: "Lead Full Stack Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    website: "https://alexrivera.dev",
    linkedin: "linkedin.com/in/alexrivera",
  });

  // Summary
  const [summary, setSummary] = useState(
    "Senior Full-Stack Engineer with 6+ years of experience architecting high-scale web platforms, cloud infrastructure, and responsive web applications. Proven track record of boosting system performance by 40% and mentoring high-velocity engineering teams."
  );

  // Skills
  const [skills, setSkills] = useState(
    "TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, Tailwind CSS, GraphQL, CI/CD pipelines"
  );

  // Experiences
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: "1",
      role: "Lead Software Engineer",
      company: "CloudScale Technologies",
      location: "San Francisco, CA",
      period: "2023 - Present",
      bullets:
        "• Architected core microservices handling 25M+ monthly requests with 99.99% uptime.\n• Spearheaded migration to Next.js 14, cutting initial bundle load time by 38%.\n• Managed and mentored a team of 5 distributed frontend and backend engineers.",
    },
    {
      id: "2",
      role: "Senior Full Stack Developer",
      company: "Nexus Labs",
      location: "Austin, TX",
      period: "2020 - 2023",
      bullets:
        "• Built real-time collaboration canvas used by 150,000 active remote workers.\n• Integrated Stripe automated invoicing and webhooks for SaaS subscriptions.\n• Reduced Postgres query latency by 45% through indexing and Redis caching.",
    },
  ]);

  // Education
  const [educations, setEducations] = useState<EducationItem[]>([
    {
      id: "1",
      degree: "B.S. in Computer Science & Engineering",
      school: "University of California, Berkeley",
      year: "2016 - 2020",
      gpa: "3.85 / 4.0 GPA (Honors)",
    },
  ]);

  // Projects
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "1",
      name: "DocuFast — Browser PDF Toolkit",
      tech: "Next.js, WebAssembly, pdf-lib",
      link: "github.com/alex/docufast",
      description: "Open-source zero-upload document manipulation tool with 10,000+ GitHub stars.",
    },
  ]);

  // Certifications
  const [certifications, setCertifications] = useState<CertItem[]>([
    {
      id: "1",
      title: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      year: "2023",
    },
  ]);

  // Languages & Achievements
  const [languages, setLanguages] = useState("English (Native), Spanish (Professional working)");
  const [achievements, setAchievements] = useState("1st Place Winner - HackMIT Global Hackathon 2022\nAuthor of 3 peer-reviewed conference articles on distributed systems");

  // Export to Genuine DOCX
  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      const paragraphs: Paragraph[] = [
        new Paragraph({
          text: personal.fullName,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: personal.targetTitle, bold: true, color: "2563eb" }),
            new TextRun({ text: ` | ${personal.email} | ${personal.phone} | ${personal.location}` }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "PROFESSIONAL SUMMARY",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [new TextRun(summary)],
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "TECHNICAL SKILLS",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [new TextRun(skills)],
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "WORK EXPERIENCE",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      ];

      experiences.forEach((exp) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: exp.role, bold: true }),
              new TextRun({ text: ` — ${exp.company} (${exp.period})` }),
            ],
            spacing: { before: 100, after: 60 },
          })
        );
        exp.bullets.split("\n").forEach((b) => {
          if (b.trim()) {
            paragraphs.push(
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun(b.replace(/^[•\-\*]\s*/, ""))],
                spacing: { after: 60 },
              })
            );
          }
        });
      });

      // Education
      paragraphs.push(
        new Paragraph({
          text: "EDUCATION",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
      educations.forEach((edu) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: edu.degree, bold: true }),
              new TextRun({ text: ` — ${edu.school} (${edu.year}) ${edu.gpa ? `[${edu.gpa}]` : ""}` }),
            ],
            spacing: { after: 60 },
          })
        );
      });

      const doc = new Document({
        title: `${personal.fullName} Resume`,
        sections: [{ children: paragraphs }],
      });

      const blob = await Packer.toBlob(doc);
      triggerBlobDownload(blob, `${personal.fullName.replace(/\s+/g, "_")}_Resume.docx`);
    } catch (err) {
      console.error("Resume DOCX error:", err);
      alert("Error generating DOCX resume.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white/30 dark:bg-slate-950 flex flex-col font-sans pb-16">
      {/* Header bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-white/80 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-subtle print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#202124] dark:text-white hidden sm:inline">
              WorkOnline Resume Studio
            </span>
          </Link>

          <div className="inline-flex rounded-full border border-white/80 p-0.5 liquid-glass-pill ml-2">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                activeTab === "edit"
                  ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs"
                  : "text-[#777777] hover:text-[#202124]"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                activeTab === "preview"
                  ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs"
                  : "text-[#777777] hover:text-[#202124]"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Template Selector & Downloads */}
        <div className="flex items-center gap-2">
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as ResumeTemplate)}
            className="text-xs font-semibold py-1.5 px-3 border border-white/80 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-[#202124] dark:text-slate-200"
          >
            <option value="modern">Modern Tech</option>
            <option value="executive">Executive Corporate</option>
            <option value="minimal">Minimal ATS</option>
            <option value="tech">Classic Standard</option>
          </select>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/80 dark:border-slate-700 hover:bg-white/20 dark:hover:bg-slate-800 text-xs font-semibold text-[#202124] dark:text-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-[#F04452]" />
            <span className="hidden sm:inline">Export DOCX</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 liquid-btn-primary rounded-lg text-xs font-semibold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Editor (Col 5) */}
          <div
            className={`space-y-6 lg:col-span-5 ${
              activeTab === "preview" ? "hidden lg:block" : "block"
            } print:hidden`}
          >
            {/* Personal Details */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                1. Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  className="px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Target Job Title"
                  value={personal.targetTitle}
                  onChange={(e) => setPersonal({ ...personal, targetTitle: e.target.value })}
                  className="px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className="px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  className="px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Location (City, State)"
                  value={personal.location}
                  onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                  className="px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Portfolio / LinkedIn URL"
                  value={personal.website}
                  onChange={(e) => setPersonal({ ...personal, website: e.target.value })}
                  className="px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                2. Professional Summary
              </h3>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* Technical Skills */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                3. Technical & Core Skills
              </h3>
              <textarea
                rows={2}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Comma separated skills..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {/* Work Experience */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                  4. Work Experience
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setExperiences([
                      ...experiences,
                      {
                        id: Date.now().toString(),
                        role: "Software Engineer",
                        company: "Company Name",
                        location: "City, State",
                        period: "2023 - 2024",
                        bullets: "• Achieved quantifiable business outcome using modern tools.",
                      },
                    ])
                  }
                  className="text-xs font-semibold text-[#F04452] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-xl bg-white/20 dark:bg-slate-850 border border-white/80 dark:border-slate-700 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[#777777]">
                      Position #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExperiences(experiences.filter((e) => e.id !== exp.id))}
                      className="text-[#777777] hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Role title"
                      value={exp.role}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExperiences(experiences.map((i) => i.id === exp.id ? { ...i, role: val } : i));
                      }}
                      className="px-2 py-1 text-xs rounded border border-white/80 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExperiences(experiences.map((i) => i.id === exp.id ? { ...i, company: val } : i));
                      }}
                      className="px-2 py-1 text-xs rounded border border-white/80 dark:border-slate-700"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Period (e.g. 2022 - Present)"
                    value={exp.period}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExperiences(experiences.map((i) => i.id === exp.id ? { ...i, period: val } : i));
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-white/80 dark:border-slate-700"
                  />
                  <textarea
                    rows={2}
                    placeholder="Bullet points (one per line)..."
                    value={exp.bullets}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExperiences(experiences.map((i) => i.id === exp.id ? { ...i, bullets: val } : i));
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-white/80 dark:border-slate-700"
                  />
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                  5. Education
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setEducations([
                      ...educations,
                      {
                        id: Date.now().toString(),
                        degree: "Degree / Program",
                        school: "University",
                        year: "2020 - 2024",
                        gpa: "GPA or Honors",
                      },
                    ])
                  }
                  className="text-xs font-semibold text-[#F04452] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="p-3 rounded-xl bg-white/20 dark:bg-slate-850 border border-white/80 dark:border-slate-700 flex items-center justify-between gap-2"
                >
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducations(educations.map((i) => i.id === edu.id ? { ...i, degree: val } : i));
                      }}
                      className="px-2 py-1 text-xs rounded border border-white/80 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      placeholder="School"
                      value={edu.school}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducations(educations.map((i) => i.id === edu.id ? { ...i, school: val } : i));
                      }}
                      className="px-2 py-1 text-xs rounded border border-white/80 dark:border-slate-700"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEducations(educations.filter((e) => e.id !== edu.id))}
                    className="text-[#777777] hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Additional: Certifications & Languages */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-white/80/90 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#777777]">
                6. Languages & Certifications
              </h3>
              <input
                type="text"
                placeholder="Languages (e.g. English, Spanish)"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <textarea
                rows={2}
                placeholder="Key Achievements / Honors..."
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/80 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Live A4 Resume Preview (Col 7) */}
          <div
            className={`lg:col-span-7 ${
              activeTab === "edit" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="sticky top-20 bg-white text-[#202124] p-8 sm:p-12 rounded-2xl shadow-xl border border-white/80 max-w-[750px] mx-auto print:border-none print:shadow-none print:p-0 print:m-0">
              {/* Template Style 1: Modern Tech */}
              {template === "modern" && (
                <div className="space-y-5">
                  <div className="border-b-2 border-blue-600 pb-4">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#202124] uppercase">
                      {personal.fullName || "Your Name"}
                    </h1>
                    <p className="text-sm font-semibold text-[#F04452] mt-0.5">
                      {personal.targetTitle || "Target Role"}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-[#777777]">
                      {personal.email && <span>{personal.email}</span>}
                      {personal.phone && <span>• {personal.phone}</span>}
                      {personal.location && <span>• {personal.location}</span>}
                      {personal.website && <span>• {personal.website}</span>}
                    </div>
                  </div>

                  {summary && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#D72638] border-b border-white/80 pb-1 mb-1.5">
                        Professional Summary
                      </h2>
                      <p className="text-xs text-[#202124] leading-relaxed">{summary}</p>
                    </div>
                  )}

                  {skills && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#D72638] border-b border-white/80 pb-1 mb-1.5">
                        Technical Competencies
                      </h2>
                      <p className="text-xs text-[#202124] font-mono leading-relaxed">{skills}</p>
                    </div>
                  )}

                  {experiences.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#D72638] border-b border-white/80 pb-1 mb-2">
                        Professional Experience
                      </h2>
                      <div className="space-y-3.5">
                        {experiences.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-baseline text-xs font-bold text-[#202124]">
                              <span>{exp.role}</span>
                              <span className="text-[#777777] font-normal">{exp.period}</span>
                            </div>
                            <div className="text-xs text-[#D72638] font-medium">{exp.company}</div>
                            <p className="text-xs text-[#777777] whitespace-pre-line mt-1 leading-relaxed">
                              {exp.bullets}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {educations.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#D72638] border-b border-white/80 pb-1 mb-1.5">
                        Education
                      </h2>
                      <div className="space-y-1.5">
                        {educations.map((edu) => (
                          <div key={edu.id} className="flex justify-between text-xs">
                            <div>
                              <strong className="text-[#202124]">{edu.degree}</strong>
                              <span className="text-[#777777]"> — {edu.school}</span>
                            </div>
                            <span className="text-[#777777]">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {languages && (
                    <div className="pt-2 text-xs text-[#777777]">
                      <strong>Languages: </strong> {languages}
                    </div>
                  )}
                </div>
              )}

              {/* Template Style 2: Executive Corporate */}
              {template === "executive" && (
                <div className="space-y-5 font-serif">
                  <div className="text-center border-b border-slate-900 pb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-wide text-[#202124] uppercase">
                      {personal.fullName || "Your Name"}
                    </h1>
                    <p className="text-xs uppercase tracking-widest text-[#777777] mt-1">
                      {personal.targetTitle}
                    </p>
                    <p className="text-xs text-[#777777] mt-2 font-sans">
                      {personal.email} • {personal.phone} • {personal.location}
                    </p>
                  </div>

                  {summary && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[#202124] border-b border-white/80 pb-1 mb-1.5">
                        Executive Profile
                      </h2>
                      <p className="text-xs text-[#202124] leading-relaxed font-sans">{summary}</p>
                    </div>
                  )}

                  {experiences.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[#202124] border-b border-white/80 pb-1 mb-2">
                        Career History
                      </h2>
                      <div className="space-y-3 font-sans">
                        {experiences.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-baseline text-xs font-bold text-[#202124]">
                              <span>{exp.role} | {exp.company}</span>
                              <span className="text-[#777777] font-normal">{exp.period}</span>
                            </div>
                            <p className="text-xs text-[#777777] whitespace-pre-line mt-1 leading-relaxed">
                              {exp.bullets}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {educations.length > 0 && (
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-[#202124] border-b border-white/80 pb-1 mb-1.5">
                        Credentials
                      </h2>
                      <div className="space-y-1 font-sans text-xs">
                        {educations.map((edu) => (
                          <div key={edu.id} className="flex justify-between">
                            <span><strong>{edu.degree}</strong>, {edu.school}</span>
                            <span className="text-[#777777]">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Template Style 3 & 4: Minimal ATS */}
              {(template === "minimal" || template === "tech") && (
                <div className="space-y-4 font-sans text-[#202124]">
                  <div className="border-b border-slate-800 pb-3">
                    <h1 className="text-2xl font-bold uppercase tracking-tight">
                      {personal.fullName || "Your Name"}
                    </h1>
                    <p className="text-xs font-medium text-[#202124] mt-0.5">
                      {personal.targetTitle}
                    </p>
                    <p className="text-xs text-[#777777] mt-1">
                      {personal.email} | {personal.phone} | {personal.location} | {personal.website}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-white/80 pb-0.5 mb-1">
                      SUMMARY
                    </h2>
                    <p className="text-xs text-[#202124]">{summary}</p>
                  </div>

                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-white/80 pb-0.5 mb-1">
                      SKILLS
                    </h2>
                    <p className="text-xs text-[#202124] font-mono">{skills}</p>
                  </div>

                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-white/80 pb-0.5 mb-1.5">
                      EXPERIENCE
                    </h2>
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <div key={exp.id} className="text-xs">
                          <div className="flex justify-between font-bold">
                            <span>{exp.role} — {exp.company}</span>
                            <span className="text-[#777777] font-normal">{exp.period}</span>
                          </div>
                          <p className="text-[#202124] whitespace-pre-line mt-1">{exp.bullets}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-white/80 pb-0.5 mb-1">
                      EDUCATION
                    </h2>
                    {educations.map((edu) => (
                      <div key={edu.id} className="flex justify-between text-xs">
                        <span>{edu.degree} — {edu.school}</span>
                        <span>{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
