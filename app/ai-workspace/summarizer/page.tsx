import { Metadata } from "next";
import { SummarizerSuite } from "@/components/ai/summarizer-suite";

export const metadata: Metadata = {
  title: "AI Document Summarizer — WorkOnline AI",
  description:
    "Summarize PDF, DOCX, and text documents into bullet points, executive summaries, and action item trackers with DOCX/PDF export.",
};

export default function SummarizerPage() {
  return <SummarizerSuite />;
}
