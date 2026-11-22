"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Clock,
  Star,
  FileText,
  FileEdit,
  GraduationCap,
  Briefcase,
  Sparkles,
  Brain,
  BookOpen,
  HelpCircle,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Layers,
  ShieldCheck,
  Zap,
  ExternalLink,
  Command,
  ArrowRight,
  CheckCircle2,
  Info,
  Heart,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ALL_TOOLS } from "@/lib/tools-data";
import { ToolIcon } from "@/components/ui/tool-icon";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SaasDashboardLayoutProps {
  children: React.ReactNode;
}

export function SaasDashboardLayout({ children }: SaasDashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Restore sidebar preference from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("workonline_sidebar_collapsed");
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("workonline_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Keyboard shortcut listener for Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation Groups strictly matching specification
  const navigationGroups: NavGroup[] = [
    {
      group: "GENERAL",
      items: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
        { label: "All Tools", href: "/tools", icon: Compass },
        { label: "Recent Activity", href: "/workspace#activity", icon: Clock },
        { label: "Favorites", href: "/workspace#favorites", icon: Star },
      ],
    },
    {
      group: "PRODUCTIVITY",
      items: [
        { label: "PDF Tools", href: "/tools?category=pdf", icon: FileText },
        { label: "Document Tools", href: "/documents", icon: FileEdit },
        { label: "Student Zone", href: "/student-zone", icon: GraduationCap },
        { label: "Employee Zone", href: "/work-zone", icon: Briefcase },
      ],
    },
    {
      group: "AI WORKSPACE",
      items: [
        { label: "AI Assistant", href: "/ai-workspace", icon: Sparkles, badge: "Gemini" },
        { label: "AI PDF Assistant", href: "/tools/pdf-ai-assistant", icon: Brain },
        { label: "AI Notes", href: "/ai-workspace/notes-generator", icon: BookOpen },
        { label: "AI Quiz Generator", href: "/ai-workspace/quiz-generator", icon: HelpCircle },
      ],
    },
    {
      group: "ACCOUNT & ABOUT",
      items: [
        { label: "Profile", href: "/profile", icon: User },
        { label: "Settings", href: "/settings", icon: Settings },
        { label: "About WorkOnline", href: "/about", icon: Info, badge: "Dinesh" },
      ],
    },
  ];

  // Helper for user avatar/initials
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email[0].toUpperCase()
    : "WO";

  // Filtered tools for Cmd+K Search
  const filteredTools = React.useMemo(() => {
    if (!searchQuery.trim()) return ALL_TOOLS.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return ALL_TOOLS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push("/");
  };

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    const cleanHref = href.split("?")[0].split("#")[0];
    if (cleanHref === "/tools") {
      if (href.includes("?category=pdf")) {
        return pathname === "/tools" && typeof window !== "undefined" && window.location.search.includes("pdf");
      }
      return pathname === "/tools" && (typeof window === "undefined" || !window.location.search.includes("pdf"));
    }
    return pathname.startsWith(cleanHref);
  };

  return (
    <div className="min-h-screen saas-canvas-bg text-slate-900 dark:text-white selection:bg-[#DC2626] selection:text-white flex flex-col p-2 sm:p-4 lg:p-6 overflow-x-hidden">
      {/* Centered Main Dashboard Container */}
      <div className="w-full max-w-[1720px] mx-auto min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] rounded-[24px] sm:rounded-[28px] bg-white dark:bg-[#100C0E] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* =========================================================================
            A. LEFT SIDEBAR (Desktop)
           ========================================================================= */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 bg-slate-50 dark:bg-[#171114]/80 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 transition-all duration-300 relative z-30 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Logo & Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
            <Link
              href="/"
              className={`flex items-center gap-3 transition-opacity ${
                isCollapsed ? "justify-center w-full" : "px-1"
              }`}
            >
              {/* Official WorkOnline 3D Emblem */}
              <div className="w-9 h-9 relative shrink-0 transition-transform group-hover:scale-105 drop-shadow-[0_0_14px_rgba(220,38,38,0.45)]">
                <Image
                  src="/logo.png"
                  alt="WorkOnline Logo"
                  width={36}
                  height={36}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>

              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center">
                    Work<span className="text-[#DC2626]">Online</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-[#9E8E93] font-semibold tracking-wider uppercase -mt-0.5">
                    Work Smarter Online
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse/Expand Toggle */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300/80 dark:border-white/10 text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* When collapsed, show expand button below header */}
          {isCollapsed && (
            <div className="py-2 flex justify-center border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-7 h-7 rounded-lg bg-slate-200/60 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300/80 dark:border-white/10 text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                {/* Group Heading */}
                {!isCollapsed ? (
                  <h3 className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-[#9E8E93] uppercase tracking-wider mb-2">
                    {group.group}
                  </h3>
                ) : (
                  <div className="h-px bg-slate-200 dark:bg-white/10 my-3 mx-2" />
                )}

                {/* Group Items */}
                {group.items.map((item) => {
                  const active = isItemActive(item.href);
                  const ItemIcon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        active
                          ? "bg-red-500/10 dark:bg-red-500/20 text-[#DC2626] dark:text-[#FB7185] border border-red-500/20 dark:border-[#DC2626]/30 shadow-xs"
                          : "text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5">
                        <ItemIcon
                          className={`w-4 h-4 shrink-0 ${
                            active ? "text-[#DC2626] dark:text-[#FB7185]" : "text-slate-400 dark:text-[#9E8E93]"
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-red-500/10 text-[#DC2626] dark:text-[#FB7185] border border-red-500/20">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* User Profile / Account Status at Bottom */}
          <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-[#100C0E]/50">
            <div
              className={`flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-xs ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/20 shadow-sm"
                title="Workspace Profile"
              >
                {initials}
              </div>

              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                    {profile?.full_name || (user ? user.email?.split("@")[0] : "Free Workspace")}
                  </p>
                  <span className="text-[10px] text-[#DC2626] dark:text-[#FB7185] font-semibold block truncate">
                    100% Free & Unlocked
                  </span>
                </div>
              )}

              {!isCollapsed && (
                <Link
                  href="/settings"
                  className="p-1.5 text-slate-400 dark:text-[#9E8E93] hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* =========================================================================
            B. MAIN WORKSPACE CONTAINER
           ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#100C0E]">
          
          {/* -----------------------------------------------------------------------
             TOP NAVIGATION BAR
             ----------------------------------------------------------------------- */}
          <header className="h-16 px-4 sm:px-6 bg-white/95 dark:bg-[#100C0E]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between sticky top-0 z-20">
            {/* Left side: Mobile Toggle & Quick Search */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              {/* Mobile menu hamburger toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Fast Search Input Bar (triggers Cmd+K palette) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-between w-full h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-white/[0.045] hover:bg-slate-200/80 dark:hover:bg-white/[0.07] border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-[#9E8E93] hover:text-slate-900 dark:hover:text-[#E2D4D6] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-slate-400 dark:text-[#9E8E93] group-hover:text-[#DC2626] transition-colors" />
                  <span className="hidden sm:inline font-medium">Search 50+ productivity tools & files...</span>
                  <span className="sm:hidden font-medium">Search tools...</span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-[#9E8E93] font-mono shadow-xs">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </button>
            </div>

            {/* Right side: Hub Pills, Notifications & User Avatar */}
            <div className="flex items-center gap-2 sm:gap-3 ml-3">
              {/* Quick Hub Jump Pills (Hidden on small screens) */}
              <div className="hidden xl:flex items-center gap-1.5">
                <Link
                  href="/tools?category=pdf"
                  className="px-3 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  PDF
                </Link>
                <Link
                  href="/documents"
                  className="px-3 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Docs
                </Link>
                <Link
                  href="/student-zone"
                  className="px-3 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Student
                </Link>
                <Link
                  href="/work-zone"
                  className="px-3 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Work
                </Link>
                <Link
                  href="/ai-workspace"
                  className="px-3 py-1 rounded-full text-xs font-semibold text-[#DC2626] dark:text-[#FB7185] bg-red-500/10 border border-[#DC2626]/20 hover:bg-red-500/20 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#DC2626]" />
                  <span>AI</span>
                </Link>
              </div>

              {/* Notification Control */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.045] hover:bg-slate-200/80 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors relative"
                  title="Notifications & System Status"
                >
                  <Bell className="w-4 h-4" />
                  <span className="w-2 h-2 rounded-full bg-[#DC2626] absolute top-2.5 right-2.5 shadow-[0_0_8px_#DC2626]" />
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 elevated-panel border border-slate-200 dark:border-white/15 p-4 shadow-2xl z-50 animate-in fade-in duration-150 space-y-3 bg-white dark:bg-[#171114] text-slate-800 dark:text-white rounded-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        System Notifications
                      </span>
                      <span className="text-[10px] text-[#DC2626] font-semibold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        Operational
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Gemini AI Active</p>
                          <p className="text-[11px] text-slate-500 dark:text-[#9E8E93] leading-relaxed">
                            Google Gemini intelligence active across all tools.
                          </p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Client Sandbox Privacy</p>
                          <p className="text-[11px] text-slate-500 dark:text-[#9E8E93] leading-relaxed">
                            100% client-side WebAssembly execution enabled.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Workspace Status Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/[0.045] border border-slate-200 dark:border-white/10 shadow-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white font-bold text-[10px] flex items-center justify-center border border-white/20">
                  {initials}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-white hidden sm:block">
                  {profile?.full_name?.split(" ")[0] || (user ? user.email?.split("@")[0] : "Free Workspace")}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#34D399]" title="100% Free & Unlocked" />
              </div>
            </div>
          </header>

          {/* -----------------------------------------------------------------------
             MAIN CONTENT PANE (Scrollable)
             ----------------------------------------------------------------------- */}
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-transparent">
            {children}
          </main>

          {/* -----------------------------------------------------------------------
             INTEGRATED DASHBOARD FOOTER
             ----------------------------------------------------------------------- */}
          <footer className="border-t border-slate-200 dark:border-white/10 px-6 py-5 text-xs text-slate-500 dark:text-[#9E8E93] bg-slate-50 dark:bg-[#100C0E]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                Work<span className="text-[#DC2626]">Online</span>
              </span>
              <span>•</span>
              <span>Made with ❤️ by <strong className="text-slate-800 dark:text-white font-semibold">Dinesh Reddy Chada</strong></span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                About
              </Link>
              <Link href="/tools" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                All Tools
              </Link>
              <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-[#E2D4D6]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DC2626]" /> Client Sandbox Privacy
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* =========================================================================
          C. MOBILE DRAWER NAVIGATION (< lg)
         ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#171114] border-r border-slate-200 dark:border-white/10 p-4 flex flex-col z-50 animate-in slide-in-from-left duration-200 shadow-2xl text-slate-800 dark:text-white">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 relative shrink-0 drop-shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                  <Image
                    src="/logo.png"
                    alt="WorkOnline Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                  Work<span className="text-[#DC2626]">Online</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:text-[#9E8E93] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {navigationGroups.map((group) => (
                <div key={group.group} className="space-y-1">
                  <h4 className="px-2 text-[10px] font-extrabold text-slate-400 dark:text-[#9E8E93] uppercase tracking-wider mb-1">
                    {group.group}
                  </h4>
                  {group.items.map((item) => {
                    const active = isItemActive(item.href);
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          active
                            ? "bg-[#DC2626]/20 text-[#DC2626] dark:text-white border-l-2 border-[#DC2626]"
                            : "text-slate-600 dark:text-[#E2D4D6] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ItemIcon className={`w-4 h-4 ${active ? "text-[#DC2626]" : "text-slate-400 dark:text-[#9E8E93]"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#DC2626]/20 text-[#DC2626] dark:text-[#FB7185]">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile Footer Auth */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-[#DC2626] bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="py-2 text-center text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="py-2 text-center text-xs font-semibold rounded-xl liquid-btn-primary"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          D. GLOBAL SEARCH PALETTE MODAL (Cmd/Ctrl + K)
         ========================================================================= */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl elevated-panel border border-slate-200 dark:border-white/15 p-4 shadow-2xl space-y-4 bg-white dark:bg-[#171114] text-slate-800 dark:text-white rounded-2xl">
            {/* Search Input */}
            <div className="relative flex items-center border-b border-slate-200 dark:border-white/10 pb-3">
              <Search className="w-5 h-5 text-[#DC2626] mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. merge pdf, cgpa, resume)..."
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9E8E93] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs text-slate-500 dark:text-[#9E8E93] hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto space-y-1">
              {filteredTools.map((t) => (
                <Link
                  key={t.id}
                  href={`/tools/${t.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-xs transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-[#DC2626] border border-red-500/20 flex items-center justify-center shrink-0">
                      <ToolIcon name={t.iconName} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-[#DC2626] dark:group-hover:text-[#FB7185] transition-colors">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#9E8E93] line-clamp-1">
                        {t.shortDescription}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-[#9E8E93] font-medium bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                    {t.categoryLabel}
                  </span>
                </Link>
              ))}

              {filteredTools.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-[#9E8E93]">
                  No matching tools found for &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#9E8E93]">
              <span>Navigation: Tab / Click</span>
              <Link
                href="/tools"
                onClick={() => setSearchOpen(false)}
                className="text-[#DC2626] hover:underline font-semibold flex items-center gap-1"
              >
                Browse all tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
