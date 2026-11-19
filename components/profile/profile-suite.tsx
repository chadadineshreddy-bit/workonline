"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  GraduationCap,
  Save,
  Check,
  AlertCircle,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { SupabaseStatusBanner } from "@/components/auth/supabase-status-banner";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

export function ProfileSuite() {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [workspacePreference, setWorkspacePreference] = useState<"student" | "professional" | "both">("both");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setWorkspacePreference(profile.workspace_preference || "both");
      setSelectedAvatar(profile.avatar_url || "");
    } else if (user) {
      setFullName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      setWorkspacePreference((user.user_metadata?.workspace_preference as any) || "both");
      setSelectedAvatar(user.user_metadata?.avatar_url || "");
    }
  }, [profile, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    if (!fullName.trim()) {
      setError("Full name cannot be empty.");
      return;
    }

    if (!user) {
      setError("You must be signed in to update your profile.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    if (supabase) {
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            full_name: fullName.trim(),
            avatar_url: selectedAvatar || null,
            workspace_preference: workspacePreference,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          setError(profileError.message);
        } else {
          await refreshProfile();
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }
      } catch (err: any) {
        setError("Failed to save profile: " + err.message);
      }
    } else {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }

    setIsLoading(false);
  };

  const creationDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Active Member";

  const initials = (fullName || user?.email || "U")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 pb-12 text-white">
      <SupabaseStatusBanner />

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs text-[#9E8E93]">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9E8E93]" />
          <Link href="/workspace" className="hover:text-white transition-colors">
            Workspace
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9E8E93]" />
          <span className="text-white font-semibold">User Profile</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Account Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#9E8E93] mt-1">
              Manage your personal identification, avatar, and workspace preferences.
            </p>
          </div>
          <Link
            href="/settings"
            className="px-4 py-2 rounded-xl bg-white/[0.045] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Account Settings
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-[#FB7185] text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-[#DC2626]/30 text-white text-xs sm:text-sm flex items-center gap-2.5 font-medium shadow-sm">
            <Check className="w-5 h-5 text-[#FB7185] shrink-0" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        {/* Main Profile Form Card */}
        <div className="rounded-[20px] bg-[#171114] border border-white/10 p-6 sm:p-8 space-y-6">
          {/* Avatar & Hero Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
            <div className="relative group">
              {selectedAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedAvatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#DC2626] shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center font-bold text-xl">
                  {initials}
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-lg font-bold text-white">
                {fullName || "WorkOnline User"}
              </h2>
              <p className="text-xs text-[#9E8E93] flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#9E8E93]" />
                {user?.email || "guest@workonline.com"}
              </p>
              <p className="text-xs text-[#9E8E93] flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#9E8E93]" />
                Member since {creationDate}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Choose Avatar Preset */}
            <div>
              <label className="block text-xs font-semibold text-[#9E8E93] uppercase tracking-wider mb-2.5">
                Choose Profile Photo
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAvatar("")}
                  className={`w-11 h-11 rounded-xl font-bold text-xs border flex items-center justify-center transition-all ${
                    !selectedAvatar
                      ? "border-[#DC2626] bg-red-500/20 text-white"
                      : "border-white/10 text-[#9E8E93] hover:text-white"
                  }`}
                >
                  Initials
                </button>
                {AVATAR_OPTIONS.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(imgUrl)}
                    className={`relative rounded-xl overflow-hidden border transition-all ${
                      selectedAvatar === imgUrl
                        ? "border-[#DC2626] scale-105 shadow-md"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`Avatar ${i}`} className="w-11 h-11 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white/[0.045] border border-white/10 text-white placeholder-[#9E8E93] focus:outline-none focus:border-[#DC2626]/60 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">
                  Email Address (Read Only)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    readOnly
                    value={user?.email || "guest@workonline.com"}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-white/[0.02] text-[#9E8E93] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Workspace Preference */}
            <div>
              <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">
                Workspace Role & Toolkit Preference
              </label>
              <p className="text-xs text-[#9E8E93] mb-3">
                Tailors shortcuts, default templates, and dashboard organization to your primary productivity mode.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "student",
                    label: "Student",
                    desc: "Prioritize CGPA tools, timetable planner, flashcards, and notes binder.",
                    icon: GraduationCap,
                  },
                  {
                    id: "professional",
                    label: "Working Professional",
                    desc: "Prioritize email composer, meeting minutes, Excel tools, and invoices.",
                    icon: Briefcase,
                  },
                  {
                    id: "both",
                    label: "Universal (Both)",
                    desc: "Equal access across all student, office, document, and AI workspace tools.",
                    icon: Layers,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = workspacePreference === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setWorkspacePreference(item.id as any)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#DC2626] bg-red-500/10 shadow-sm"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-[#FB7185]" : "text-[#9E8E93]"}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FB7185]" />}
                      </div>
                      <h4 className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#E2D4D6]"}`}>{item.label}</h4>
                      <p className="text-[10px] text-[#9E8E93] mt-1 leading-snug">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs text-[#9E8E93]">
                Changes take effect across your active session immediately.
              </span>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm shadow-[#DC2626]/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isLoading ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
