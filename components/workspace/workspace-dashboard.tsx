"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  Star,
  Clock,
  Plus,
  ArrowRight,
  Settings,
  User,
  ShieldCheck,
  FileEdit,
  FolderOpen,
  Zap,
  Compass,
  Heart,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { getFavorites } from "@/lib/favorites";
import { getRecentActivities, ActivityItem } from "@/lib/activity";
import { ALL_TOOLS } from "@/lib/tools-data";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { SupabaseStatusBanner } from "@/components/auth/supabase-status-banner";

interface SavedDocItem {
  id: string;
  title: string;
  document_type: string;
  created_at: string;
}

export function WorkspaceDashboard() {
  const { user, profile, isConfigured } = useAuth();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [documents, setDocuments] = useState<SavedDocItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspaceData() {
      setIsLoading(true);

      // 1. Load favorites
      const favs = await getFavorites(user?.id);
      setFavorites(favs);

      // 2. Load recent activity
      const acts = await getRecentActivities(user?.id, 6);
      setActivities(acts);

      // 3. Load documents from Supabase (or localStorage fallback)
      if (user && isConfigured) {
        const supabase = createClient();
        if (supabase) {
          try {
            const { data } = await supabase
              .from("saved_documents")
              .select("id, title, document_type, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(8);

            if (data && data.length > 0) {
              setDocuments(data);
            }
          } catch {
            // fallback
          }
        }
      }

      // Check localStorage for offline document drafts
      if (typeof window !== "undefined") {
        try {
          const localNotes = localStorage.getItem("workonline_student_notes");
          if (localNotes) {
            const parsed = JSON.parse(localNotes);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const localDocs: SavedDocItem[] = parsed.slice(0, 4).map((n: any) => ({
                id: n.id || String(Math.random()),
                title: n.title || "Untitled Note",
                document_type: "study_note",
                created_at: n.lastModified || new Date().toISOString(),
              }));
              setDocuments((prev) => (prev.length === 0 ? localDocs : prev));
            }
          }
        } catch {
          // ignore
        }
      }

      setIsLoading(false);
    }

    loadWorkspaceData();
  }, [user, isConfigured]);

  const favoriteToolObjects = ALL_TOOLS.filter((t) => favorites.includes(t.slug));

  const quickShortcuts = [
    { name: "Merge PDF", slug: "merge-pdf", desc: "Combine multiple PDF files" },
    { name: "PDF to Word", slug: "pdf-to-word", desc: "Editable DOCX extraction" },
    { name: "Resume Builder", slug: "resume-builder", desc: "ATS-optimized templates" },
    { name: "CGPA Calculator", slug: "cgpa-calculator", desc: "Credit-weighted GPA" },
    { name: "Meeting Minutes", slug: "meeting-minutes", desc: "Corporate agenda generator" },
    { name: "AI PDF Chat", slug: "pdf-ai-assistant", desc: "Ask questions to documents" },
  ];

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      {/* -----------------------------------------------------------------------
          1. WELCOME MESSAGE & PRODUCTIVITY OVERVIEW
         ----------------------------------------------------------------------- */}
      <div className="floating-glass-canvas p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-red-500/10 text-[#DC2626] dark:text-[#FB7185] border border-red-500/20">
                100% Free & Unlocked • All Features Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome to Your{" "}
              <span className="bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent">
                Personal Workspace
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#E2D4D6] max-w-2xl leading-relaxed">
              Your unified workspace for document conversions, academic calculations, career deliverables, and generative AI. All tools are free to use without restrictions.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/profile"
              className="liquid-btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Profile</span>
            </Link>
            <Link
              href="/settings"
              className="liquid-btn-secondary px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-[#9E8E93]" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Productivity Overview Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-white/10 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-400 dark:text-[#9E8E93] uppercase font-bold block">Browser Security</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Sandboxed
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-400 dark:text-[#9E8E93] uppercase font-bold block">Execution Speed</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
              <Zap className="w-4 h-4 text-[#DC2626] dark:text-[#FB7185]" /> Sub-second
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-400 dark:text-[#9E8E93] uppercase font-bold block">Starred Favorites</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
              <Star className="w-4 h-4 text-[#DC2626] fill-[#DC2626]" /> {favorites.length} Tools
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
            <span className="text-[10px] text-slate-400 dark:text-[#9E8E93] uppercase font-bold block">Cloud Documents</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 mt-0.5">
              <FolderOpen className="w-4 h-4 text-[#DC2626] dark:text-[#FB7185]" /> {documents.length} Saved
            </span>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          2. QUICK ACTION CARDS (5 Core Hub Modules)
         ----------------------------------------------------------------------- */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold text-slate-400 dark:text-[#9E8E93] uppercase tracking-wider px-1">
          Quick Action Modules
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          <Link
            href="/tools?category=pdf"
            className="p-4 rounded-2xl liquid-glass-card group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center border border-white/20 shadow-[0_0_12px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#DC2626] dark:group-hover:text-[#FB7185] transition-colors">PDF Tools</h3>
              <p className="text-[10px] text-slate-500 dark:text-[#9E8E93] mt-0.5 line-clamp-1">Merge, split & edit</p>
            </div>
          </Link>

          <Link
            href="/documents/editor"
            className="p-4 rounded-2xl liquid-glass-card group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center border border-white/20 shadow-[0_0_12px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform">
              <FileEdit className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#DC2626] dark:group-hover:text-[#FB7185] transition-colors">Word Editor</h3>
              <p className="text-[10px] text-slate-500 dark:text-[#9E8E93] mt-0.5 line-clamp-1">Rich document studio</p>
            </div>
          </Link>

          <Link
            href="/student-zone"
            className="p-4 rounded-2xl liquid-glass-card group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center border border-white/20 shadow-[0_0_12px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#DC2626] dark:group-hover:text-[#FB7185] transition-colors">Student Zone</h3>
              <p className="text-[10px] text-slate-500 dark:text-[#9E8E93] mt-0.5 line-clamp-1">CGPA, planner & quiz</p>
            </div>
          </Link>

          <Link
            href="/work-zone"
            className="p-4 rounded-2xl liquid-glass-card group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center border border-white/20 shadow-[0_0_12px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#DC2626] dark:group-hover:text-[#FB7185] transition-colors">Work Zone</h3>
              <p className="text-[10px] text-slate-500 dark:text-[#9E8E93] mt-0.5 line-clamp-1">Emails, Excel & tasks</p>
            </div>
          </Link>

          <Link
            href="/ai-workspace"
            className="p-4 rounded-2xl liquid-glass-card group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center border border-white/20 shadow-[0_0_12px_rgba(220,38,38,0.35)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#DC2626] dark:group-hover:text-[#FB7185] transition-colors">AI Workspace</h3>
              <p className="text-[10px] text-slate-500 dark:text-[#9E8E93] mt-0.5 line-clamp-1">Chat with PDF & notes</p>
            </div>
          </Link>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          3. 2-COLUMN SECTION: FAVORITES & MY DOCUMENTS
         ----------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Starred Favorite Tools */}
        <div id="favorites" className="liquid-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#DC2626] fill-[#DC2626]" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Favorite Tools</h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-[#9E8E93]">{favoriteToolObjects.length} pinned</span>
          </div>

          {favoriteToolObjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {favoriteToolObjects.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-between group transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-[#DC2626] dark:group-hover:text-[#FB7185] truncate pr-2 transition-colors">
                    {tool.title}
                  </span>
                  <FavoriteButton toolSlug={tool.slug} size="sm" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 space-y-2">
              <Star className="w-6 h-6 text-slate-400 dark:text-[#9E8E93]/40 mx-auto" />
              <p className="text-xs font-semibold text-slate-800 dark:text-white">No favorite tools starred yet</p>
              <p className="text-[11px] text-slate-500 dark:text-[#9E8E93] max-w-xs mx-auto">
                Click the star icon on any tool card across WorkOnline to pin it here for 1-click access.
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center gap-1 text-xs text-[#DC2626] font-semibold hover:underline pt-1"
              >
                Browse tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* My Saved Documents */}
        <div className="liquid-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#DC2626]" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">My Saved Documents</h3>
            </div>
            <Link
              href="/documents/editor"
              className="text-xs font-semibold text-[#DC2626] hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Doc</span>
            </Link>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-[#9E8E93] capitalize">
                        {doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/documents/editor"
                    className="text-xs text-[#DC2626] font-semibold hover:underline shrink-0"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 space-y-2">
              <FileText className="w-6 h-6 text-slate-400 dark:text-[#9E8E93]/40 mx-auto" />
              <p className="text-xs font-semibold text-slate-800 dark:text-white">No cloud documents saved yet</p>
              <p className="text-[11px] text-slate-500 dark:text-[#9E8E93] max-w-xs mx-auto">
                Create rich documents in the Word Editor, resumes in Resume Builder, or notes in the Study Binder.
              </p>
              <Link
                href="/documents/editor"
                className="inline-flex items-center gap-1 text-xs text-[#DC2626] font-semibold hover:underline pt-1"
              >
                Create Document <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          4. USEFUL SHORTCUTS GRID
         ----------------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-extrabold text-slate-400 dark:text-[#9E8E93] uppercase tracking-wider">
            Useful Shortcuts
          </h2>
          <Link href="/tools" className="text-xs font-semibold text-[#DC2626] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickShortcuts.map((sc) => (
            <Link
              key={sc.slug}
              href={`/tools/${sc.slug}`}
              className="p-3.5 rounded-xl liquid-glass-card hover:border-[#DC2626]/40 transition-all flex items-center justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#DC2626] dark:group-hover:text-[#FB7185] transition-colors">
                  {sc.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#9E8E93] mt-0.5">
                  {sc.desc}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#9E8E93] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      </div>

      {/* -----------------------------------------------------------------------
          5. RECENT ACTIVITY LOG
         ----------------------------------------------------------------------- */}
      <div id="activity" className="liquid-glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#DC2626]" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Platform Activity</h3>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-[#9E8E93]">Chronological history</span>
        </div>

        {activities.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {activities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shadow-[0_0_6px_#DC2626]" />
                  <span className="font-semibold text-slate-800 dark:text-white">{act.tool_name}</span>
                </div>
                <span className="text-slate-400 dark:text-[#9E8E93] font-mono text-[11px]">
                  {new Date(act.used_at).toLocaleDateString()} {new Date(act.used_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-[#9E8E93] py-4 text-center">
            No recent tool activity logged yet. Launch any tool to see your timeline appear here.
          </p>
        )}
      </div>

      {/* -----------------------------------------------------------------------
          6. ABOUT WORKONLINE & CREATOR CALLOUT
         ----------------------------------------------------------------------- */}
      <div className="floating-glass-canvas p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-[#DC2626]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              WorkOnline — Made by Dinesh Reddy Chada
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#9E8E93]">
              100% free, client-side private productivity tools uniting documents and Gemini AI.
            </p>
          </div>
        </div>

        <Link
          href="/about"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 inline-flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>About WorkOnline</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#DC2626]" />
        </Link>
      </div>
    </div>
  );
}
