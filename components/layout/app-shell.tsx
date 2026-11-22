"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SaasDashboardLayout } from "./saas-dashboard-layout";
import { AmbientScrollExperience } from "@/components/ui/ambient-scroll-experience";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 0. Full-screen Document Studio (Microsoft Word desktop & web experience)
  const isFullBleedEditor =
    pathname === "/documents/editor" ||
    pathname === "/tools/online-word-editor" ||
    pathname === "/tools/word-editor" ||
    pathname === "/tools/document-editor";

  if (isFullBleedEditor) {
    return (
      <div className="w-full h-screen overflow-hidden flex flex-col bg-[#070405] text-slate-100 select-none">
        {children}
      </div>
    );
  }

  // 1. Workspace / SaaS Dashboard routes use the dedicated Sidebar & Cockpit layout
  if (pathname.startsWith("/workspace")) {
    return (
      <>
        <AmbientScrollExperience />
        <SaasDashboardLayout>{children}</SaasDashboardLayout>
      </>
    );
  }

  // 2. Authentication routes use a standalone layout
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isAuthRoute) {
    return (
      <div className="min-h-screen saas-canvas-bg flex flex-col justify-between text-slate-900 dark:text-white relative overflow-hidden">
        <AmbientScrollExperience />
        {/* Subtle background ambient red lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Fixed Top Navbar */}
        <Navbar />

        <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 relative z-10">
          {children}
        </main>

        <footer className="text-center py-4 text-xs text-[#9E8E93] relative z-10">
          <p>© {new Date().getFullYear()} WorkOnline. 100% Client-Side Privacy Assured.</p>
        </footer>
      </div>
    );
  }

  // 3. All other independent pages (Home, Tools, Document Studio, Student Zone, Work Zone, AI Workspace, Contact, etc.)
  // Render separately with the permanent fixed top Navbar and clean Footer
  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen saas-canvas-bg flex flex-col text-slate-900 dark:text-white selection:bg-[#DC2626] selection:text-white relative overflow-x-hidden">
      <AmbientScrollExperience />
      {/* Permanent Fixed Top Navbar */}
      <Navbar />

      {/* Main Page Canvas with top padding for fixed navbar */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 w-full pt-20 sm:pt-24 relative z-10 ${
          isHomePage
            ? "px-0"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16"
        }`}
      >
        {children}
      </main>

      {/* Standalone Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export { SaasDashboardLayout };
