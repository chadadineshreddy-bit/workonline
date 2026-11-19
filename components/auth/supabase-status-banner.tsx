"use client";

import React, { useState } from "react";
import { Database, ExternalLink, ShieldAlert, X } from "lucide-react";
import { useAuth } from "./auth-provider";

export function SupabaseStatusBanner() {
  const { isConfigured } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (isConfigured) return null;

  return (
    <>
      <div className="bg-[#171114] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#9E8E93] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#DC2626] shrink-0" />
          <span>
            <strong className="text-white">Supabase Notice:</strong> Cloud database credentials are not configured in your environment. Cloud registration, database RLS, and storage sync require Supabase setup.
          </span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="underline font-semibold text-[#FB7185] hover:text-white shrink-0 flex items-center gap-1"
        >
          View Setup Guide <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-[24px] bg-[#171114] border border-white/15 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center shadow-sm">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">Configure Supabase Backend</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-[#9E8E93] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#E2D4D6]">
              <p>
                WorkOnline uses a <strong className="text-white">genuine Supabase PostgreSQL database</strong> with Row Level Security (RLS) and encrypted session cookies with zero fabricated user sessions.
              </p>

              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-2.5">
                <p className="font-bold text-[#FB7185] text-xs uppercase tracking-wider">
                  Quick 3-Minute Setup:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#9E8E93]">
                  <li>
                    Create a free project at{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FB7185] hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      Supabase.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Go to <strong>Project Settings → API</strong>.</li>
                  <li>Copy your <strong>Project URL</strong> and <strong>anon public API key</strong>.</li>
                  <li>
                    Add them to <code className="bg-white/10 border border-white/10 px-1.5 py-0.5 rounded text-white font-mono">.env.local</code>:
                    <pre className="mt-1 p-2.5 bg-black/50 border border-white/10 text-[#FB7185] rounded-xl text-[11px] font-mono overflow-x-auto">
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
                    </pre>
                  </li>
                  <li>
                    Execute the database migrations in{" "}
                    <code className="bg-white/10 border border-white/10 px-1 py-0.5 rounded font-mono text-[#FB7185]">
                      supabase/migrations/20261114_worknest_schema.sql
                    </code>{" "}
                    in the Supabase SQL Editor.
                  </li>
                </ol>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-[#E2D4D6]">
                <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Security Guarantee:</strong> WorkOnline protects all private files with PostgreSQL Row Level Security (RLS) so User A can never access User B&apos;s documents.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-semibold transition-colors shadow-sm shadow-[#DC2626]/30"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
