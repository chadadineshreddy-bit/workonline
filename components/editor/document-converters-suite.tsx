"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  FileCode,
  FileCheck,
  AlertCircle
} from "lucide-react";
import {
  convertDocxToHtml,
  extractDocxText,
  convertTxtToPdfBlob
} from "@/lib/docx/document-converters";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

type ConverterTab = "docx-to-pdf" | "docx-extractor" | "txt-to-pdf" | "html-to-pdf" | "pdf-to-docx";

export function DocumentConvertersSuite() {
  const [activeTab, setActiveTab] = useState<ConverterTab>("docx-to-pdf");

  // State: DOCX to PDF
  const [docxFile, setDocxFile] = useState<File | null>(null);
  const [docxHtml, setDocxHtml] = useState<string>("");
  const [docxLoading, setDocxLoading] = useState(false);
  const [docxError, setDocxError] = useState("");

  // State: DOCX Extractor
  const [extractFile, setExtractFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [extractStats, setExtractStats] = useState<{ words: number; chars: number } | null>(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractCopied, setExtractCopied] = useState(false);

  // State: TXT to PDF
  const [txtTitle, setTxtTitle] = useState("Meeting Minutes & Action Items");
  const [txtContent, setTxtContent] = useState(
    `WORKONLINE PRODUCTIVITY SUITE\nDocument Type: Executive Summary\nDate: November 2026\n\n1. Overview\nWorkOnline unites essential everyday office utilities and student tools into a unified, privacy-respecting client-side application.\n\n2. Key Functional Modules:\n- Client-side PDF toolkit: Merge, Split, Compress, Rotate, Page preview\n- Document Creator: Online Word Editor, Resume Builder, Cover Letter, Professional Letters, Invoices, Notes\n- Zero Server Uploads: All data processed directly in your browser sandbox.\n\n3. Action Items:\n- Test DOCX export fidelity with complex tables.\n- Ensure responsive layouts across mobile, tablet, and ultra-wide displays.`
  );
  const [txtConverting, setTxtConverting] = useState(false);

  // State: HTML to PDF
  const [htmlContent, setHtmlContent] = useState(
    `<div style="font-family: sans-serif; padding: 24px; color: #FFFFFF; background-color: #171114;">
  <h1 style="color: #FB7185; font-size: 24px; margin-bottom: 8px;">WorkOnline Report</h1>
  <p style="color: #9E8E93; font-size: 14px;">Automated HTML-to-PDF Document Snapshot</p>
  <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.12); margin: 16px 0;" />
  <p>This is a rendered HTML document ready for one-click browser PDF printing.</p>
  <ul>
    <li>Preserves modern CSS styling</li>
    <li>Zero server round-trips for complete privacy</li>
    <li>High-resolution vector text rendering</li>
  </ul>
</div>`
  );

  // Handle DOCX to HTML
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setDocxError("Please select a valid .docx file.");
      return;
    }
    setDocxError("");
    setDocxFile(file);
    setDocxLoading(true);
    try {
      const res = await convertDocxToHtml(file);
      setDocxHtml(res.html);
    } catch (err: any) {
      setDocxError(err.message || "Failed to parse DOCX document.");
    } finally {
      setDocxLoading(false);
    }
  };

  const handleOpenInEditor = () => {
    if (!docxHtml) return;
    localStorage.setItem("workonline_editor_content", docxHtml);
    localStorage.setItem(
      "workonline_editor_title",
      docxFile?.name.replace(/\.docx$/i, "") || "Imported Document"
    );
    window.location.href = "/documents/editor";
  };

  // Handle DOCX Text Extract
  const handleExtractUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      alert("Please upload a .docx file.");
      return;
    }
    setExtractFile(file);
    setExtractLoading(true);
    try {
      const res = await extractDocxText(file);
      setExtractedText(res.text);
      setExtractStats({ words: res.wordCount, chars: res.charCount });
    } catch {
      alert("Failed to extract text from DOCX file.");
    } finally {
      setExtractLoading(false);
    }
  };

  const handleCopyExtracted = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setExtractCopied(true);
      setTimeout(() => setExtractCopied(false), 2000);
    } catch {
      alert("Failed to copy text.");
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    triggerBlobDownload(
      blob,
      `${extractFile?.name.replace(/\.docx$/i, "") || "extracted"}-text.txt`
    );
  };

  // Handle TXT to PDF
  const handleConvertTxtToPdf = async () => {
    if (!txtContent.trim()) {
      alert("Please enter some text to convert.");
      return;
    }
    setTxtConverting(true);
    try {
      const pdfBlob = await convertTxtToPdfBlob(txtContent, txtTitle);
      triggerBlobDownload(
        pdfBlob,
        `${txtTitle.toLowerCase().replace(/[^a-z0-9]/g, "-") || "document"}.pdf`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF from text.");
    } finally {
      setTxtConverting(false);
    }
  };

  const handlePrintHtml = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print HTML to PDF.");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WorkOnline HTML to PDF</title>
          <style>
            @page { margin: 1in; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="rounded-[20px] bg-white/[0.045] border border-white/10 overflow-hidden text-white">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 bg-white/[0.02] overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("docx-to-pdf")}
          className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === "docx-to-pdf"
              ? "border-[#DC2626] text-[#FB7185] bg-white/[0.04]"
              : "border-transparent text-[#9E8E93] hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4 text-[#DC2626]" />
          <span>DOCX to PDF</span>
        </button>
        <button
          onClick={() => setActiveTab("docx-extractor")}
          className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === "docx-extractor"
              ? "border-[#DC2626] text-[#FB7185] bg-white/[0.04]"
              : "border-transparent text-[#9E8E93] hover:text-white"
          }`}
        >
          <FileCheck className="w-4 h-4 text-[#DC2626]" />
          <span>DOCX Text Extractor</span>
        </button>
        <button
          onClick={() => setActiveTab("txt-to-pdf")}
          className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === "txt-to-pdf"
              ? "border-[#DC2626] text-[#FB7185] bg-white/[0.04]"
              : "border-transparent text-[#9E8E93] hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-[#DC2626]" />
          <span>TXT to PDF</span>
        </button>
        <button
          onClick={() => setActiveTab("html-to-pdf")}
          className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === "html-to-pdf"
              ? "border-[#DC2626] text-[#FB7185] bg-white/[0.04]"
              : "border-transparent text-[#9E8E93] hover:text-white"
          }`}
        >
          <FileCode className="w-4 h-4 text-[#DC2626]" />
          <span>HTML to PDF</span>
        </button>
        <button
          onClick={() => setActiveTab("pdf-to-docx")}
          className={`px-5 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === "pdf-to-docx"
              ? "border-[#DC2626] text-[#FB7185] bg-white/[0.04]"
              : "border-transparent text-[#9E8E93] hover:text-white"
          }`}
        >
          <Info className="w-4 h-4 text-[#9E8E93]" />
          <span>PDF to DOCX Guide</span>
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {/* TAB 1: DOCX to PDF */}
        {activeTab === "docx-to-pdf" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">
                DOCX to PDF Viewer & Converter
              </h3>
              <p className="text-xs text-[#9E8E93] mt-0.5">
                Upload your Microsoft Word (.docx) document to preview its structure and convert it directly into a PDF.
              </p>
            </div>

            <div className="border border-dashed border-white/20 hover:border-[#DC2626]/40 bg-white/[0.02] rounded-xl p-8 text-center transition-all">
              <Upload className="w-8 h-8 text-[#DC2626] mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {docxFile ? docxFile.name : "Select or drag a .docx document here"}
              </p>
              <p className="text-[11px] text-[#9E8E93] mt-1">
                Parsed entirely in your browser using Mammoth. No documents leave your device.
              </p>
              <label className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-semibold cursor-pointer shadow-sm transition-all">
                <span>Browse DOCX File</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleDocxUpload}
                  className="hidden"
                />
              </label>
            </div>

            {docxError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-[#FB7185] text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{docxError}</span>
              </div>
            )}

            {docxLoading && (
              <div className="text-center py-6 text-xs text-[#9E8E93]">
                Parsing Word document contents...
              </div>
            )}

            {docxHtml && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Document Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenInEditor}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.045] hover:bg-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
                      <span>Open in Online Word Editor</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / Save as PDF</span>
                    </button>
                  </div>
                </div>

                <div
                  className="border border-white/10 rounded-xl p-5 bg-white/[0.02] max-h-[400px] overflow-y-auto prose prose-invert prose-sm max-w-none text-xs text-[#E2D4D6]"
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCX Extractor */}
        {activeTab === "docx-extractor" && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white">
                DOCX Plain Text Extractor
              </h3>
              <p className="text-xs text-[#9E8E93] mt-0.5">
                Extract unformatted raw text from any .docx file for data analysis, AI prompts, or text editing.
              </p>
            </div>

            <div className="border border-dashed border-white/20 hover:border-[#DC2626]/40 bg-white/[0.02] rounded-xl p-8 text-center transition-all">
              <Upload className="w-8 h-8 text-[#DC2626] mx-auto mb-2" />
              <p className="text-xs font-bold text-white">
                {extractFile ? extractFile.name : "Select a Word (.docx) file to extract text"}
              </p>
              <label className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-semibold cursor-pointer shadow-sm">
                <span>Select DOCX</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleExtractUpload}
                  className="hidden"
                />
              </label>
            </div>

            {extractLoading && (
              <div className="text-center py-4 text-xs text-[#9E8E93]">
                Extracting plain text...
              </div>
            )}

            {extractedText && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#9E8E93] flex items-center gap-3">
                    <span>
                      Words: <strong className="text-white">{extractStats?.words}</strong>
                    </span>
                    <span>
                      Characters: <strong className="text-white">{extractStats?.chars}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyExtracted}
                      className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.045] hover:bg-white/[0.08] text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                    >
                      {extractCopied ? <Check className="w-3.5 h-3.5 text-[#FB7185]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{extractCopied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .TXT</span>
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  rows={10}
                  value={extractedText}
                  className="w-full text-xs p-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white font-mono leading-relaxed focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TXT to PDF */}
        {activeTab === "txt-to-pdf" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                TXT to Formatted PDF Converter
              </h3>
              <p className="text-xs text-[#9E8E93] mt-0.5">
                Convert plain text notes or summaries into a multi-page, paginated A4 PDF with clean typography.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9E8E93]">Document Header / Title</label>
              <input
                type="text"
                value={txtTitle}
                onChange={(e) => setTxtTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl bg-white/[0.045] border border-white/10 text-white focus:outline-none focus:border-[#DC2626]/60 font-semibold mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#9E8E93]">Content to Convert</label>
              <textarea
                rows={10}
                value={txtContent}
                onChange={(e) => setTxtContent(e.target.value)}
                placeholder="Paste or write your text here..."
                className="w-full text-xs p-3.5 rounded-xl bg-white/[0.045] border border-white/10 text-white font-mono focus:outline-none focus:border-[#DC2626]/60 leading-relaxed mt-1"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#9E8E93]">
                Paginates automatically onto standard A4 pages using pdf-lib.
              </span>
              <button
                onClick={handleConvertTxtToPdf}
                disabled={txtConverting}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{txtConverting ? "Generating PDF..." : "Convert & Download PDF"}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: HTML to PDF */}
        {activeTab === "html-to-pdf" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                HTML to PDF Converter
              </h3>
              <p className="text-xs text-[#9E8E93] mt-0.5">
                Render clean HTML code and print or export it directly into a high-resolution PDF document.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-[#9E8E93]">HTML Source Code</label>
                <textarea
                  rows={12}
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl font-mono bg-white/[0.045] border border-white/10 text-white focus:outline-none focus:border-[#DC2626]/60 leading-relaxed mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#9E8E93]">Live Rendered View</label>
                <div
                  className="border border-white/10 rounded-xl p-4 bg-white/[0.02] h-[260px] overflow-y-auto text-xs mt-1"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handlePrintHtml}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Render & Print / Save to PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: PDF to DOCX Guide */}
        {activeTab === "pdf-to-docx" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl border border-[#DC2626]/30 text-xs">
              <Info className="w-5 h-5 shrink-0 text-[#DC2626]" />
              <div>
                <strong className="font-bold text-[#FB7185]">Understanding PDF to DOCX Conversion</strong>
                <p className="mt-0.5 leading-relaxed text-[#E2D4D6]">
                  PDF is a fixed-layout presentation language (storing glyphs at exact XY coordinates), whereas DOCX is a flow-layout XML document (storing paragraphs, runs, and styles). Client-side conversion reconstructs text runs and tables; scanned documents without OCR require specialized optical character recognition.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Native PDF Extraction
                </h4>
                <p className="text-xs text-[#9E8E93] leading-relaxed">
                  For documents created digitally (from Word, Google Docs, or LaTeX), text and tables can be extracted cleanly.
                </p>
                <Link
                  href="/tools/extract-pages"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#FB7185] hover:underline"
                >
                  Use WorkOnline PDF Tools <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Open in Online Word Editor
                </h4>
                <p className="text-xs text-[#9E8E93] leading-relaxed">
                  Paste or draft your document in our rich online editor, then export standard .docx files with complete style preservation.
                </p>
                <Link
                  href="/documents/editor"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#FB7185] hover:underline"
                >
                  Open Word Editor <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
