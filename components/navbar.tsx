"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Layers,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  Briefcase,
  FileText,
  FileEdit,
  Compass,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Search,
  Command,
  LucideIcon
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ALL_TOOLS } from "@/lib/tools-data";
import { ToolIcon } from "@/components/ui/tool-icon";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, signOut } = useAuth();

  // Keyboard shortcut for Search Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setUserDropdownOpen(false);
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setUserDropdownOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks: { name: string; href: string; icon: LucideIcon }[] = [
    { name: "Home", href: "/", icon: Layers },
    { name: "PDF Tools", href: "/tools?category=pdf", icon: FileText },
    { name: "Document Studio", href: "/documents", icon: FileEdit },
    { name: "Student Zone", href: "/student-zone", icon: GraduationCap },
    { name: "Employee Zone", href: "/work-zone", icon: Briefcase },
    { name: "AI Workspace", href: "/ai-workspace", icon: Sparkles },
    { name: "All Tools", href: "/tools", icon: Compass },
  ];

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email[0].toUpperCase()
    : "U";

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    router.push("/");
  };

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#070405]/50 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-16 flex items-center justify-between gap-3 xl:gap-6">
          {/* Brand Logo with Official WorkOnline 3D Emblem */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
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
            <div className="flex flex-col shrink-0">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center whitespace-nowrap">
                Work<span className="text-[#DC2626]">Online</span>
              </span>
              <span className="text-[9px] text-[#9E8E93] font-semibold tracking-wider uppercase -mt-1 hidden sm:block whitespace-nowrap">
                Work Smarter Online
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 2xl:gap-2.5 shrink-0">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/tools?category=pdf"
                  ? pathname === "/tools" && typeof window !== "undefined" && window.location.search.includes("category=pdf")
                  : item.href === "/tools"
                  ? pathname === "/tools" && (typeof window === "undefined" || !window.location.search.includes("category=pdf"))
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? "bg-red-500/20 text-[#FB7185] border border-[#DC2626]/30 shadow-xs"
                      : "text-[#E2D4D6] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}

            {/* Dedicated Workspace Dashboard Link */}
            <Link
              href="/workspace"
              className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all ${
                pathname === "/workspace"
                  ? "bg-red-500/20 text-[#FB7185] border border-[#DC2626]/30 shadow-xs"
                  : "text-[#E2D4D6] hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 shrink-0 ${pathname === "/workspace" ? "text-white" : "text-[#DC2626]"}`} />
              <span className="whitespace-nowrap">Workspace</span>
            </Link>
          </nav>

          {/* Free Access Action & Theme Toggle */}
          <div className="hidden sm:flex items-center space-x-2.5 shrink-0">
            <ThemeToggle />
            <Link
              href="/workspace"
              className="liquid-btn-glass-crimson px-4 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-md shadow-[#DC2626]/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="whitespace-nowrap">Free Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>

          {/* Mobile hamburger menu toggle & Theme Toggle */}
          <div className="flex lg:hidden items-center space-x-1.5">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-[#E2D4D6] hover:text-white hover:bg-white/5 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5 text-[#FB7185]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#100C0E]/98 backdrop-blur-3xl px-4 sm:px-6 py-5 space-y-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

            {user ? (
              <div className="pb-3 border-b border-white/10 flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white font-bold text-xs flex items-center justify-center border border-white/20 shadow-[0_0_12px_rgba(220,38,38,0.4)]">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate font-heading">
                    {profile?.full_name || "WorkOnline User"}
                  </p>
                  <p className="text-[11px] text-[#9E8E93] truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="pb-3 border-b border-white/10 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Free Access Active</span>
                </div>
                <span className="text-[11px] text-[#FB7185] font-semibold">100% Unlocked</span>
              </div>
            )}

            <div className="space-y-1">
              <Link
                href="/workspace"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  pathname === "/workspace"
                    ? "text-[#FB7185] bg-red-500/10 border border-[#DC2626]/30"
                    : "text-[#E2D4D6] hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#FB7185]" />
                <span>Personal Workspace</span>
              </Link>

              {navLinks.map((item) => {
                const NavIcon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : item.href === "/tools?category=pdf"
                    ? pathname === "/tools" && typeof window !== "undefined" && window.location.search.includes("category=pdf")
                    : item.href === "/tools"
                    ? pathname === "/tools" && (typeof window === "undefined" || !window.location.search.includes("category=pdf"))
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? "text-[#FB7185] bg-red-500/10 border border-[#DC2626]/30"
                        : "text-[#E2D4D6] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <NavIcon className={`w-4 h-4 ${isActive ? "text-[#FB7185]" : "text-[#9E8E93]"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#E2D4D6] hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4 text-[#9E8E93]" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#E2D4D6] hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4 text-[#9E8E93]" />
                <span>Account Settings</span>
              </Link>
            </div>

            <div className="pt-3 border-t border-white/10">
              <Link
                href="/workspace"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-xl liquid-btn-glass-crimson text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Open Free Workspace</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette Modal (Cmd+K / Ctrl+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-[24px] bg-[#171114] border border-white/15 shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-150">
            {/* Search Input Bar */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#DC2626] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 50+ tools (e.g. merge pdf, cgpa, resume)..."
                className="w-full bg-transparent text-sm text-white placeholder-[#9E8E93] focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-[#9E8E93] hover:text-white"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="p-2 max-h-[380px] overflow-y-auto space-y-1">
              <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#9E8E93] uppercase tracking-wider">
                {searchQuery ? `Matching Tools (${filteredTools.length})` : "Popular Tools"}
              </p>
              {filteredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center shrink-0">
                      <ToolIcon name={tool.iconName} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#FB7185] transition-colors">
                        {tool.title}
                      </p>
                      <p className="text-[11px] text-[#9E8E93] line-clamp-1">
                        {tool.shortDescription}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#9E8E93] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 shrink-0">
                    {tool.categoryLabel}
                  </span>
                </Link>
              ))}
            </div>

            {/* Quick Hub Links */}
            <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs text-[#9E8E93]">
              <span>Need help finding a tool?</span>
              <Link
                href="/tools"
                onClick={() => setSearchOpen(false)}
                className="text-[#FB7185] font-semibold hover:underline"
              >
                View all 50+ tools →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
