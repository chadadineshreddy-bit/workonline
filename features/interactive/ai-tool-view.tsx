"use client";

import React, { useState } from "react";
import { ToolItem } from "@/types/tools";
import {
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Bot,
  Zap,
  ArrowRight
} from "lucide-react";

interface AiToolViewProps {
  tool: ToolItem;
}

export function AiToolView({ tool }: AiToolViewProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    try {
      const existing = JSON.parse(localStorage.getItem("workonline_waitlist") || "[]");
      existing.push({ tool: tool.slug, email, timestamp: new Date().toISOString() });
      localStorage.setItem("workonline_waitlist", JSON.stringify(existing));
    } catch (e) {
      // Ignore
    }

    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Early Preview Hero Box */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-purple-50/60 via-white to-slate-50/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900 border border-purple-200/60 dark:border-purple-800/50 shadow-lg text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Feature In Early Beta Development</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {tool.title} is Coming Soon
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          {tool.longDescription || tool.shortDescription}
        </p>

        {/* Planned Capabilities */}
        {tool.features && (
          <div className="pt-4 border-t border-purple-100 dark:border-purple-900/40 max-w-md mx-auto text-left space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block text-center mb-3">
              Planned Engine Features
            </span>
            {tool.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Email Waitlist Notification */}
        <div className="pt-6 max-w-md mx-auto">
          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You&apos;re on the early access priority list! We&apos;ll notify you first.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email for early access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-sm"
                >
                  Join Waitlist
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Zero spam. Only a single notification when public beta opens.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Architecture and Supabase notice */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white font-semibold">
            Enterprise Architecture Ready:
          </strong>{" "}
          This AI utility connects to WorkOnline&apos;s Supabase vector storage and LLM inference endpoints. To activate in your private deployment, configure your Supabase URL and API keys in your environment variables.
        </div>
      </div>
    </div>
  );
}
