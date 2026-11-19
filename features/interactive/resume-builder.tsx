"use client";

import React, { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Globe,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Download,
  Eye,
  Edit3
} from "lucide-react";

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
  grade: string;
}

export function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Profile data
  const [profile, setProfile] = useState({
    fullName: "Alex Rivera",
    targetRole: "Full Stack Software Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    portfolio: "alexrivera.dev",
    summary:
      "Results-oriented Software Engineer with 4+ years of experience architecting high-performance web applications, scalable APIs, and modern cloud services. Proven track record of reducing latency by 35% and boosting team velocity.",
    skills:
      "React, Next.js, TypeScript, Node.js, Python, PostgreSQL, AWS, Docker, Tailwind CSS, GraphQL, REST APIs, Git",
  });

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: "1",
      role: "Senior Software Engineer",
      company: "Apex Cloud Systems",
      period: "2023 - Present",
      description:
        "Architected core dashboard services serving 120,000+ active users. Improved API latency by 40% via Redis caching and optimized database queries. Mentored 4 junior engineers on clean TypeScript patterns.",
    },
    {
      id: "2",
      role: "Software Developer",
      company: "Nexus Digital Labs",
      period: "2021 - 2023",
      description:
        "Engineered client-side workflow tools using React and Tailwind CSS. Collaborated with product designers to implement responsive, accessible SaaS UI components.",
    },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    {
      id: "1",
      degree: "B.S. in Computer Science",
      school: "University of California, Berkeley",
      year: "2017 - 2021",
      grade: "3.85 / 4.0 GPA",
    },
  ]);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        role: "Software Engineer",
        company: "Company Name",
        period: "2023 - 2024",
        description: "Key responsibilities, quantifiable achievements, and technologies used.",
      },
    ]);
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        degree: "Degree / Certification",
        school: "Institution Name",
        year: "Graduation Year",
        grade: "GPA or Honors",
      },
    ]);
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter((e) => e.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "edit"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "preview"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>
          <span className="text-xs text-slate-400 hidden md:inline">
            ATS-optimized formatting
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Export / Print PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form */}
        <div
          className={`space-y-6 lg:col-span-6 ${
            activeTab === "preview" ? "hidden lg:block" : "block"
          } print:hidden`}
        >
          {/* Personal Info */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Contact & Header Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={profile.targetRole}
                  onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Location (City, State)
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Website / LinkedIn
                </label>
                <input
                  type="text"
                  value={profile.portfolio}
                  onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Executive Professional Summary
              </label>
              <textarea
                rows={3}
                value={profile.summary}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Core Skills (Comma separated)
              </label>
              <input
                type="text"
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Work Experience
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            <div className="space-y-4">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Position
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Role title"
                      value={exp.role}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExperiences(experiences.map((item) => item.id === exp.id ? { ...item, role: val } : item));
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExperiences(experiences.map((item) => item.id === exp.id ? { ...item, company: val } : item));
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Dates (e.g. 2022 - Present)"
                      value={exp.period}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExperiences(experiences.map((item) => item.id === exp.id ? { ...item, period: val } : item));
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Key impact bullets..."
                    value={exp.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExperiences(experiences.map((item) => item.id === exp.id ? { ...item, description: val } : item));
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Education
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-3">
              {educations.map((edu) => (
                <div
                  key={edu.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={edu.degree}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducations(educations.map((i) => i.id === edu.id ? { ...i, degree: val } : i));
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="School"
                      value={edu.school}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducations(educations.map((i) => i.id === edu.id ? { ...i, school: val } : i));
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducations(educations.map((i) => i.id === edu.id ? { ...i, year: val } : i));
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="GPA / Grade"
                      value={edu.grade}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEducations(educations.map((i) => i.id === edu.id ? { ...i, grade: val } : i));
                      }}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live A4 Document Preview */}
        <div
          className={`lg:col-span-6 ${
            activeTab === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="sticky top-20 bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-200 font-sans print:p-0 print:border-none print:shadow-none print:rounded-none">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
                {profile.fullName || "Your Name"}
              </h1>
              <p className="text-sm font-semibold text-blue-700 mt-0.5">
                {profile.targetRole || "Target Title"}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                {profile.email && <span>{profile.email}</span>}
                {profile.phone && <span>• {profile.phone}</span>}
                {profile.location && <span>• {profile.location}</span>}
                {profile.portfolio && <span>• {profile.portfolio}</span>}
              </div>
            </div>

            {/* Summary */}
            {profile.summary && (
              <div className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {profile.summary}
                </p>
              </div>
            )}

            {/* Core Skills */}
            {profile.skills && (
              <div className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  Technical & Core Skills
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed font-mono">
                  {profile.skills}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {experiences.length > 0 && (
              <div className="mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
                  Professional Experience
                </h2>
                <div className="space-y-3.5">
                  {experiences.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-bold text-slate-900">{exp.role}</span>
                        <span className="text-slate-500 font-medium">{exp.period}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700">
                        {exp.company}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                  Education & Credentials
                </h2>
                <div className="space-y-2">
                  {educations.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{edu.degree}</span>
                        <span className="text-slate-600"> — {edu.school}</span>
                      </div>
                      <div className="text-slate-500">
                        {edu.year} {edu.grade ? `(${edu.grade})` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
