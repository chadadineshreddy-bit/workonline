import { MetadataRoute } from "next";
import { ALL_TOOLS } from "@/lib/tools-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://workonline.app";
  const now = new Date();

  // Core Landing & Hub Pages
  const coreRoutes = [
    "",
    "/tools",
    "/documents",
    "/student-zone",
    "/work-zone",
    "/ai-workspace",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.9,
  }));

  // Student Zone Sub-Tools
  const studentRoutes = [
    "/student-zone/cgpa-calculator",
    "/student-zone/sgpa-calculator",
    "/student-zone/attendance-calculator",
    "/student-zone/study-planner",
    "/student-zone/assignment-tracker",
    "/student-zone/notes-manager",
    "/student-zone/flashcards",
    "/student-zone/quiz-generator",
    "/student-zone/study-timer",
    "/student-zone/exam-countdown",
    "/student-zone/text-tools",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Work Zone Sub-Tools
  const workRoutes = [
    "/work-zone/email-writer",
    "/work-zone/meeting-minutes",
    "/work-zone/excel-tools",
    "/work-zone/csv-tools",
    "/work-zone/task-manager",
    "/work-zone/work-planner",
    "/work-zone/business-letters",
    "/work-zone/signature",
    "/work-zone/qr-generator",
    "/work-zone/text-utilities",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // AI Workspace Sub-Tools
  const aiRoutes = [
    "/ai-workspace/pdf-assistant",
    "/ai-workspace/summarizer",
    "/ai-workspace/notes-generator",
    "/ai-workspace/quiz-generator",
    "/ai-workspace/flashcard-generator",
    "/ai-workspace/resume-assistant",
    "/ai-workspace/email-assistant",
    "/ai-workspace/text-rewriter",
    "/ai-workspace/grammar-checker",
    "/ai-workspace/explain-anything",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // Document Studio Sub-Tools
  const docRoutes = [
    "/documents/editor",
    "/documents/resume-builder",
    "/documents/cover-letter",
    "/documents/invoice-generator",
    "/documents/letter-generator",
    "/documents/notes",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic Catalog of PDF Tools (/tools/[slug])
  const toolRoutes = ALL_TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: tool.isPopular ? 0.8 : 0.7,
  }));

  return [
    ...coreRoutes,
    ...studentRoutes,
    ...workRoutes,
    ...aiRoutes,
    ...docRoutes,
    ...toolRoutes,
  ];
}
