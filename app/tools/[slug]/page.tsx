import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { ALL_TOOLS, getToolBySlug } from "@/lib/tools-data";
import { ToolIcon } from "@/components/ui/tool-icon";
import { ToolCard } from "@/components/tool-card";
import { FloatingRedElements } from "@/components/ui/floating-red-elements";

// Document Studio Suites
import { WordEditor } from "@/components/editor/word-editor";
import { ResumeBuilderSuite } from "@/components/editor/resume-builder-suite";
import { CoverLetterSuite } from "@/components/editor/cover-letter-suite";
import { LetterGeneratorSuite } from "@/components/editor/letter-generator-suite";
import { InvoiceGeneratorSuite } from "@/components/editor/invoice-generator-suite";
import { NotesWorkspace } from "@/components/editor/notes-workspace";

// Student Zone Suites
import { CgpaCalculatorSuite } from "@/components/student/cgpa-calculator-suite";
import { SgpaCalculatorSuite } from "@/components/student/sgpa-calculator-suite";
import { AttendanceCalculatorSuite } from "@/components/student/attendance-calculator-suite";
import { StudyTimetableSuite } from "@/components/student/study-timetable-suite";
import { AssignmentTrackerSuite } from "@/components/student/assignment-tracker-suite";
import { StudentNotesManager } from "@/components/student/student-notes-manager";
import { FlashcardSuite } from "@/components/student/flashcard-suite";
import { QuizGeneratorSuite } from "@/components/student/quiz-generator-suite";
import { PomodoroTimerSuite } from "@/components/student/pomodoro-timer-suite";
import { StudentTextTools } from "@/components/student/student-text-tools";
import { ExamCountdownSuite } from "@/components/student/exam-countdown-suite";

// Work Zone Interactive Suites
import { EmailWriterSuite } from "@/components/work/email-writer-suite";
import { MeetingMinutesSuite } from "@/components/work/meeting-minutes-suite";
import { ExcelAssistantSuite } from "@/components/work/excel-assistant-suite";
import { CsvToolsSuite } from "@/components/work/csv-tools-suite";
import { TaskManagerSuite } from "@/components/work/task-manager-suite";
import { WorkPlannerSuite } from "@/components/work/work-planner-suite";
import { BusinessLettersSuite } from "@/components/work/business-letters-suite";
import { QrGeneratorSuite } from "@/components/work/qr-generator-suite";
import { SignatureSuite } from "@/components/work/signature-suite";

// AI Workspace Suites
import { PdfAssistantSuite } from "@/components/ai/pdf-assistant-suite";
import { SummarizerSuite } from "@/components/ai/summarizer-suite";
import { NotesGeneratorSuite } from "@/components/ai/notes-generator-suite";
import { QuizGeneratorSuite as AiQuizGeneratorSuite } from "@/components/ai/quiz-generator-suite";
import { FlashcardGeneratorSuite } from "@/components/ai/flashcard-generator-suite";
import { ResumeAssistantSuite } from "@/components/ai/resume-assistant-suite";
import { EmailAssistantSuite } from "@/components/ai/email-assistant-suite";
import { TextRewriterSuite } from "@/components/ai/text-rewriter-suite";
import { GrammarCheckerSuite } from "@/components/ai/grammar-checker-suite";
import { ExplainAnythingSuite } from "@/components/ai/explain-anything-suite";

// Interactive tool modules
import { CgpaCalculator } from "@/features/interactive/cgpa-calculator";
import { AttendanceCalculator } from "@/features/interactive/attendance-calculator";
import { ImageCompressor } from "@/features/interactive/image-compressor";
import { ResumeBuilder } from "@/features/interactive/resume-builder";
import { InvoiceGenerator } from "@/features/interactive/invoice-generator";
import { EmailWriter } from "@/features/interactive/email-writer";
import { StudyPlanner } from "@/features/interactive/study-planner";
import { FlashcardCreator } from "@/features/interactive/flashcard-creator";
import { AiToolView } from "@/features/interactive/ai-tool-view";
import { GenericFileTool } from "@/features/interactive/generic-file-tool";

// Functional PDF Tools
import { MergePdfTool } from "@/features/pdf/merge-pdf-tool";
import { SplitPdfTool } from "@/features/pdf/split-pdf-tool";
import { CompressPdfTool } from "@/features/pdf/compress-pdf-tool";
import { PdfToJpgTool } from "@/features/pdf/pdf-to-jpg-tool";
import { JpgToPdfTool } from "@/features/pdf/jpg-to-pdf-tool";
import { RotatePdfTool } from "@/features/pdf/rotate-pdf-tool";
import { DeletePagesTool } from "@/features/pdf/delete-pages-tool";
import { ReorderPagesTool } from "@/features/pdf/reorder-pages-tool";
import { ExtractPagesTool } from "@/features/pdf/extract-pages-tool";
import { PdfPreviewTool } from "@/features/pdf/pdf-preview-tool";

interface ToolPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    return {
      title: "Tool Not Found - WorkOnline",
    };
  }

  return {
    title: `${tool.title} - WorkOnline Productivity Workspace`,
    description: tool.shortDescription,
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  // Related tools from same category (excluding current)
  const relatedTools = ALL_TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 4);

  // Render the appropriate interactive engine
  const renderInteractiveContent = () => {
    switch (tool.slug) {
      // Functional PDF Tools
      case "merge-pdf":
        return <MergePdfTool />;
      case "split-pdf":
        return <SplitPdfTool />;
      case "compress-pdf":
        return <CompressPdfTool />;
      case "pdf-to-jpg":
        return <PdfToJpgTool />;
      case "jpg-to-pdf":
        return <JpgToPdfTool />;
      case "rotate-pdf":
        return <RotatePdfTool />;
      case "delete-pdf-pages":
        return <DeletePagesTool />;
      case "reorder-pdf-pages":
        return <ReorderPagesTool />;
      case "extract-pdf-pages":
        return <ExtractPagesTool />;
      case "pdf-preview":
        return <PdfPreviewTool />;

      // Document Studio Engines
      case "online-word-editor":
        return <WordEditor />;
      case "resume-builder":
        return <ResumeBuilderSuite />;
      case "cover-letter-generator":
        return <CoverLetterSuite />;
      case "letter-generator":
        return <LetterGeneratorSuite />;
      case "invoice-generator":
        return <InvoiceGeneratorSuite />;
      case "notes-generator":
        return <NotesWorkspace />;

      // Student Zone Interactive Suites
      case "cgpa-calculator":
        return <CgpaCalculatorSuite />;
      case "sgpa-calculator":
        return <SgpaCalculatorSuite />;
      case "attendance-calculator":
        return <AttendanceCalculatorSuite />;
      case "study-planner":
        return <StudyTimetableSuite />;
      case "assignment-tracker":
        return <AssignmentTrackerSuite />;
      case "notes-manager":
      case "notes-generator":
        return <StudentNotesManager />;
      case "flashcard-creator":
        return <FlashcardSuite />;
      case "quiz-generator":
        return <QuizGeneratorSuite />;
      case "study-timer":
        return <PomodoroTimerSuite />;
      case "text-tools":
        return <StudentTextTools />;
      case "exam-countdown":
        return <ExamCountdownSuite />;

      // Work Zone Interactive Suites
      case "email-writer":
        return <EmailWriterSuite />;
      case "meeting-minutes":
        return <MeetingMinutesSuite />;
      case "excel-tools":
      case "excel-utilities":
        return <ExcelAssistantSuite />;
      case "csv-tools":
        return <CsvToolsSuite />;
      case "task-manager":
        return <TaskManagerSuite />;
      case "work-planner":
        return <WorkPlannerSuite />;
      case "business-letters":
        return <BusinessLettersSuite />;
      case "qr-generator":
        return <QrGeneratorSuite />;
      case "signature":
        return <SignatureSuite />;

      // AI Workspace Suites
      case "ai-pdf-assistant":
      case "pdf-assistant":
        return <PdfAssistantSuite />;
      case "ai-notes-summarizer":
      case "summarizer":
        return <SummarizerSuite />;
      case "ai-notes-generator":
      case "notes-generator":
        return <NotesGeneratorSuite />;
      case "ai-quiz-generator":
        return <AiQuizGeneratorSuite />;
      case "ai-flashcard-generator":
      case "flashcard-generator":
        return <FlashcardGeneratorSuite />;
      case "ai-resume-assistant":
      case "resume-assistant":
        return <ResumeAssistantSuite />;
      case "ai-email-writer":
      case "email-assistant":
        return <EmailAssistantSuite />;
      case "ai-text-rewriter":
      case "text-rewriter":
        return <TextRewriterSuite />;
      case "ai-grammar-checker":
      case "grammar-checker":
        return <GrammarCheckerSuite />;
      case "ai-explain-anything":
      case "explain-anything":
        return <ExplainAnythingSuite />;

      // Additional Tools
      case "image-compressor":
        return <ImageCompressor />;

      default:
        if (tool.category === "ai" || tool.status === "coming-soon") {
          return <AiToolView tool={tool} />;
        }
        return <GenericFileTool tool={tool} />;
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#9E8E93]">
        <Link href="/" className="hover:text-[#DC2626] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/tools" className="hover:text-[#DC2626] transition-colors">
          All Tools
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link
          href={`/tools?category=${tool.category}`}
          className="hover:text-[#DC2626] transition-colors"
        >
          {tool.categoryLabel}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white font-bold">
          {tool.title}
        </span>
      </nav>

      {/* Tool Title & Meta Glass Capsule */}
      <div className="relative liquid-glass-card p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#B91C1C] text-white flex items-center justify-center shrink-0 border border-white/20 shadow-[0_0_18px_rgba(220,38,38,0.45)]">
            <ToolIcon name={tool.iconName} className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                {tool.title}
              </h1>
              {tool.badge && (
                <span className="liquid-glass-pill px-3 py-0.5 text-xs font-bold text-[#FB7185] border border-[#DC2626]/30">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#E2D4D6] max-w-2xl leading-relaxed">
              {tool.longDescription || tool.shortDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 text-xs">
          <span className="liquid-glass-pill px-3.5 py-1.5 text-white font-medium flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Sandbox Memory
          </span>
          <span className="liquid-glass-pill px-3.5 py-1.5 text-white font-medium flex items-center gap-1.5 shadow-xs">
            <Zap className="w-4 h-4 text-[#FB7185]" />
            Zero Watermarks
          </span>
        </div>
      </div>

      {/* Main Interactive Tool Body - Centered Panel */}
      <div className="relative floating-glass-canvas p-6 sm:p-10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
        {renderInteractiveContent()}
      </div>

      {/* Features Checklist */}
      {tool.features && tool.features.length > 0 && (
        <div className="p-6 sm:p-8 rounded-2xl liquid-glass-card">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] shadow-[0_0_8px_#DC2626]" />
            <span>Core Capabilities & Highlights</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tool.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-[#E2D4D6]">
                <CheckCircle2 className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="font-medium text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                More in {tool.categoryLabel}
              </h3>
              <p className="text-xs text-[#9E8E93]">
                Other utilities frequently used with {tool.title}.
              </p>
            </div>

            <Link
              href={`/tools?category=${tool.category}`}
              className="text-xs font-bold text-[#DC2626] hover:text-[#FB7185] transition-colors"
            >
              View all {tool.categoryLabel} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((relTool) => (
              <ToolCard key={relTool.id} tool={relTool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
