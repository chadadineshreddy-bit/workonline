import { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  FileEdit,
  Mail,
  Receipt,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Download,
} from "lucide-react";
import { DocumentConvertersSuite } from "@/components/editor/document-converters-suite";

export const metadata: Metadata = {
  title: "Document Studio — WorkOnline",
  description:
    "Create, edit, and convert documents with WorkOnline Document Studio. Features an online Word editor, resume builder, cover letter generator, professional letters, invoices, and notes.",
};

const DOCUMENT_TOOLS = [
  {
    title: "Online Word Editor",
    description:
      "Full-featured document editor with rich text styling, tables, images, outline navigation, DOCX import/export, and PDF export.",
    href: "/documents/editor",
    icon: FileEdit,
    badge: "Core Editor",
  },
  {
    title: "Resume Builder",
    description:
      "Craft ATS-friendly, professional resumes with 4 modern templates, dynamic sections, live A4 preview, DOCX, and PDF downloads.",
    href: "/documents/resume-builder",
    icon: FileText,
    badge: "4 Templates",
  },
  {
    title: "Cover Letter Generator",
    description:
      "Generate tailored, persuasive cover letters tailored to your target company and role with customizable tone presets.",
    href: "/documents/cover-letter",
    icon: Mail,
    badge: "Tone Presets",
  },
  {
    title: "Professional Letter Generator",
    description:
      "Draft formal leave applications, resignation letters, permission requests, and official recommendation letters with DOCX export.",
    href: "/documents/letter-generator",
    icon: Sparkles,
    badge: "Formal Templates",
  },
  {
    title: "Invoice & Billing Generator",
    description:
      "Create clean, itemized business invoices with auto-calculated subtotals, tax rates, discount rates, and PDF/DOCX downloads.",
    href: "/documents/invoice-generator",
    icon: Receipt,
    badge: "Auto Calculate",
  },
  {
    title: "Notes & Document Workspace",
    description:
      "Multi-notebook scratchpad with category organization, instant search, markdown formatting, local autosave, and export.",
    href: "/documents/notes",
    icon: BookOpen,
    badge: "Local Autosave",
  },
];

export default function DocumentStudioPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Studio Header */}
      <section className="relative overflow-hidden rounded-[24px] bg-[#171114] border border-white/10 p-6 sm:p-10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-[#DC2626]/30 text-[#FB7185] text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] shadow-sm" />
            <span>WorkOnline Document Studio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Create, Edit & Convert{" "}
            <span className="bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent">
              Documents with Elegance.
            </span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#E2D4D6] leading-relaxed">
            A comprehensive document creation workspace designed for students and working professionals.
            Format rich documents, build executive resumes, generate formal letters, and convert files with
            zero server uploads.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.045] border border-white/10 text-[#E2D4D6]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DC2626]" />
              <span className="font-semibold text-white">100% Client-Side Privacy</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.045] border border-white/10 text-[#E2D4D6]">
              <Download className="w-3.5 h-3.5 text-[#DC2626]" />
              <span className="font-semibold text-white">Genuine DOCX & PDF Exports</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.045] border border-white/10 text-[#E2D4D6]">
              <Zap className="w-3.5 h-3.5 text-[#DC2626]" />
              <span className="font-semibold text-white">Sub-Second Local Processing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="space-y-10">
        {/* Creator Tools Grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Document Creators & Editors
              </h2>
              <p className="text-xs text-[#9E8E93] mt-0.5">
                Full-featured authoring suites with live preview and multi-format export
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DOCUMENT_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-[20px] bg-white/[0.045] border border-white/10 hover:border-[#DC2626]/40 p-5 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center group-hover:scale-105 transition-all">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-[#FB7185] border border-[#DC2626]/30">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#FB7185] transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-[#E2D4D6] leading-relaxed mt-1.5 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#FB7185]">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Document Conversion Suite */}
        <section>
          <div className="mb-5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Document Conversion & Extraction Suite
            </h2>
            <p className="text-xs text-[#9E8E93] mt-0.5">
              Transform formats instantly: Word DOCX, raw plain text, HTML snapshots, and formatted PDFs
            </p>
          </div>

          <DocumentConvertersSuite />
        </section>

        {/* Technical Highlights */}
        <section className="rounded-[20px] bg-[#171114] border border-white/10 p-6 sm:p-8">
          <div className="max-w-3xl">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Enterprise-Grade Document Processing in Your Browser
            </h3>
            <p className="text-xs sm:text-sm text-[#E2D4D6] mt-2 leading-relaxed">
              Unlike legacy document tools that upload your private contracts, academic transcripts, and resumes to third-party cloud servers, WorkOnline executes document assembly, styling, and parsing right on your CPU using WebAssembly, `docx`, and `mammoth`.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5 pt-5 border-t border-white/10 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#FB7185]">Standard DOCX XML</span>
                <p className="text-[#9E8E93] text-[11px] leading-relaxed">
                  Generates true OpenXML documents compatible with Microsoft Word, Apple Pages, and LibreOffice.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#FB7185]">Exact A4 Pagination</span>
                <p className="text-[#9E8E93] text-[11px] leading-relaxed">
                  Preserves standard 1-inch margins and pagination across resumes and formal business correspondence.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#FB7185]">Offline Ready</span>
                <p className="text-[#9E8E93] text-[11px] leading-relaxed">
                  Drafts, notes, and invoice data auto-persist securely in browser LocalStorage.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
