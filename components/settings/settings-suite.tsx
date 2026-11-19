"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Bell,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Check,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";
import { clearActivities } from "@/lib/activity";
import { useTheme } from "@/components/theme-provider";

export function SettingsSuite() {
  const { theme, setTheme } = useTheme();

  // Preferences
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [clearingActivity, setClearingActivity] = useState(false);
  const [activityCleared, setActivityCleared] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleClearHistory = async () => {
    setClearingActivity(true);
    await clearActivities();
    setActivityCleared(true);
    setClearingActivity(false);
    setTimeout(() => setActivityCleared(false), 3000);
  };

  const handleResetData = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      } catch (err) {
        console.error("Failed to clear local storage", err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 text-white">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-[#9E8E93]">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9E8E93]" />
          <Link href="/workspace" className="hover:text-white transition-colors">
            Workspace
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9E8E93]" />
          <span className="text-white font-semibold">Settings</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-[#DC2626]" />
              Platform Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#9E8E93] mt-1">
              Manage your workspace preferences, local tool storage, and privacy controls.
            </p>
          </div>
        </div>

        {/* Notifications & Activity Card */}
        <div className="rounded-[20px] bg-[#171114] border border-white/10 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#DC2626]" />
            <h3 className="font-bold text-sm text-white">Activity & Preferences</h3>
          </div>

          <div className="space-y-4">
            {/* Theme Mode Option */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-white/10">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Interface Appearance</h4>
                <p className="text-xs text-[#9E8E93]">Choose between Dark Mode (Obsidian Red) and Light Mode (Apple Pearl).</p>
              </div>
              <div className="inline-flex p-1 rounded-xl bg-white/[0.05] border border-white/10">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    theme === "dark"
                      ? "bg-[#DC2626] text-white shadow-sm"
                      : "text-[#9E8E93] hover:text-white"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    theme === "light"
                      ? "bg-[#DC2626] text-white shadow-sm"
                      : "text-[#9E8E93] hover:text-white"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light Mode</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Browser Tool Alerts</h4>
                <p className="text-xs text-[#9E8E93]">Notify when long-running conversions or PDF exports finish.</p>
              </div>
              <input
                type="checkbox"
                checked={browserNotifications}
                onChange={(e) => setBrowserNotifications(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-[#DC2626] focus:ring-[#DC2626] cursor-pointer w-4 h-4 accent-[#DC2626]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-white">Tool Usage History</h4>
                <p className="text-xs text-[#9E8E93]">Clear all recorded tool usage events from your recent activity log.</p>
              </div>
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={clearingActivity}
                className="px-3.5 py-2 rounded-xl bg-white/[0.045] hover:bg-white/[0.08] border border-white/10 text-xs text-white font-medium flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#DC2626]" />
                <span>{activityCleared ? "History Cleared!" : "Clear Activity"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Local Data Reset */}
        <div className="rounded-[20px] p-6 sm:p-8 space-y-4 border border-white/10 bg-[#171114]">
          <div className="flex items-center gap-2 text-white">
            <Trash2 className="w-4 h-4 text-[#DC2626]" />
            <h3 className="font-bold text-sm text-white">Local Cache & Storage</h3>
          </div>
          <p className="text-xs text-[#E2D4D6] leading-relaxed">
            All your files and documents are processed locally in your browser. You can clear all cached editor drafts, study notes, and temporary state at any time.
          </p>

          {resetSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Local browser cache successfully cleared!</span>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handleResetData}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Local Workspace Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
