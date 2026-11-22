import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070405] text-[#9E8E93] border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
      {/* Subtle ambient red reflection in footer */}
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[220px] bg-red-600/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[350px] h-[180px] bg-rose-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 relative shrink-0 transition-transform group-hover:scale-105 drop-shadow-[0_0_14px_rgba(220,38,38,0.4)]">
                <Image
                  src="/logo.png"
                  alt="WorkOnline Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Work<span className="text-[#DC2626]">Online</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-[#9E8E93] max-w-sm leading-relaxed">
              Convert, edit, compress, organize, and manage your documents with powerful online tools — all in one place.
            </p>
            <div className="flex items-center gap-4 pt-2 text-xs text-[#E2D4D6]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
                Client-side privacy
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#DC2626]" />
                Zero server uploads
              </span>
            </div>
          </div>

          {/* Quick links: PDF Tools */}
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-4">
              PDF & Docs
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/tools/pdf-to-word" className="hover:text-white transition-colors">
                  PDF to Word
                </Link>
              </li>
              <li>
                <Link href="/tools/merge-pdf" className="hover:text-white transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/compress-pdf" className="hover:text-white transition-colors">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/jpg-to-pdf" className="hover:text-white transition-colors">
                  JPG to PDF
                </Link>
              </li>
              <li>
                <Link href="/documents/editor" className="hover:text-white transition-colors">
                  Online Word Editor
                </Link>
              </li>
              <li>
                <Link href="/documents/resume-builder" className="hover:text-white transition-colors">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-[#FB7185] hover:underline font-semibold">
                  Document Studio Hub →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links: Student & Work */}
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-4">
              Productivity Hubs
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/student-zone" className="text-[#FB7185] hover:underline font-semibold">
                  Student Zone Hub →
                </Link>
              </li>
              <li>
                <Link href="/student-zone/cgpa-calculator" className="hover:text-white transition-colors">
                  CGPA Calculator
                </Link>
              </li>
              <li>
                <Link href="/student-zone/attendance-calculator" className="hover:text-white transition-colors">
                  Attendance Tracker
                </Link>
              </li>
              <li>
                <Link href="/student-zone/study-planner" className="hover:text-white transition-colors">
                  Study Timetable
                </Link>
              </li>
              <li>
                <Link href="/work-zone" className="text-[#FB7185] hover:underline font-semibold">
                  Work Zone Hub →
                </Link>
              </li>
              <li>
                <Link href="/work-zone/email-writer" className="hover:text-white transition-colors">
                  Email Writer
                </Link>
              </li>
              <li>
                <Link href="/ai-workspace" className="text-[#FB7185] hover:underline font-semibold">
                  AI Workspace Hub →
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Platform */}
          <div>
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-4">
              Account & Workspace
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/workspace" className="text-[#FB7185] hover:underline font-bold">
                  Personal Workspace
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">
                  Account Settings
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-white transition-colors">
                  All 50+ Tools
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#FB7185] hover:underline font-bold">
                  About WorkOnline
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Support & Help
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9E8E93] gap-4">
          <p>© {currentYear} WorkOnline • Designed & Engineered with ❤️ by <strong className="text-white font-semibold">Dinesh Reddy Chada</strong></p>
          <div className="flex items-center space-x-6">
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Support & Inquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
