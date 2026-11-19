"use client";

import React, { useState } from "react";
import {
  Send,
  Copy,
  Check,
  MailCheck,
  Sparkles,
  RotateCcw,
  Sliders
} from "lucide-react";

interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  generateBody: (recipient: string, sender: string, details: string, tone: string) => string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "follow-up",
    label: "Interview / Application Follow-up",
    subject: "Following up on [Role Title] application — Alex Rivera",
    generateBody: (recipient, sender, details, tone) =>
      `Dear ${recipient || "Hiring Team"},\n\nI hope this email finds you well.\n\nI am following up regarding the interview for the position we discussed. I remain very enthusiastic about the opportunity to contribute to your team.\n\n${details ? `Regarding our discussion: ${details}\n\n` : ""}Please let me know if there are any additional materials or references I can provide from my side.\n\nThank you once again for your time and consideration.\n\nBest regards,\n${sender || "Alex Rivera"}`,
  },
  {
    id: "leave-request",
    label: "Leave / Absence Request",
    subject: "Leave Request: [Dates] — [Your Name]",
    generateBody: (recipient, sender, details, tone) =>
      `Hi ${recipient || "Manager"},\n\nI would like to request leave on the following dates: ${details || "[Insert Date Range]"}.\n\nBefore taking leave, I will make sure all my current sprint deliverables are handed off and documented so the team experiences no blocker.\n\nPlease let me know if this works with our schedule.\n\nWarm regards,\n${sender || "Alex Rivera"}`,
  },
  {
    id: "client-update",
    label: "Client Project Milestone Update",
    subject: "Project Status & Milestone Delivery Update",
    generateBody: (recipient, sender, details, tone) =>
      `Hi ${recipient || "Client Name"},\n\nI am writing to share our progress on the ongoing project milestones.\n\nKey updates:\n- ${details || "Completed core system architecture and visual designs"}\n- Next sprint focuses on final verification and deployment prep\n\nEverything is tracking on schedule. Let me know if you would like to jump on a quick 10-minute sync this week.\n\nBest,\n${sender || "Alex Rivera"}`,
  },
  {
    id: "salary-negotiation",
    label: "Offer & Salary Discussion",
    subject: "Reflecting on Offer: [Role Title] — [Your Name]",
    generateBody: (recipient, sender, details, tone) =>
      `Dear ${recipient || "Recruiter"},\n\nThank you so much for extending the offer for the role. I am genuinely thrilled about the team's mission.\n\nBased on my 4+ years of specialized engineering experience and current industry standards in our market, I would like to explore if there is flexibility around the base compensation to ${details || "bring it closer to $135,000"}.\n\nI am confident I will bring immediate high-impact value to the organization and look forward to your thoughts.\n\nSincerely,\n${sender || "Alex Rivera"}`,
  },
];

export function EmailWriter() {
  const [selectedTemplateId, setSelectedTemplateId] = useState("follow-up");
  const [recipient, setRecipient] = useState("Hiring Manager");
  const [sender, setSender] = useState("Alex Rivera");
  const [details, setDetails] = useState("Shared the updated portfolio link and technical challenge repository.");
  const [copied, setCopied] = useState(false);

  const currentTemplate =
    EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];

  const generatedSubject = currentTemplate.subject;
  const generatedBody = currentTemplate.generateBody(recipient, sender, details, "formal");

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${generatedSubject}\n\n${generatedBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Template Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {EMAIL_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => setSelectedTemplateId(tmpl.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              selectedTemplateId === tmpl.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            {tmpl.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Email Parameters
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recipient Name or Title
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Your Name (Sign-off)
            </label>
            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Specific Context / Bullet Details
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Next steps from meeting, specific dates, or requirements..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Output Email Preview */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated Message
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Email</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="text-slate-500 font-medium">Subject line:</p>
              <p className="font-bold text-slate-900 dark:text-white">{generatedSubject}</p>
            </div>

            <pre className="font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {generatedBody}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
