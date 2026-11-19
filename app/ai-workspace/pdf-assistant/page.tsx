import { Metadata } from "next";
import { PdfAssistantSuite } from "@/components/ai/pdf-assistant-suite";

export const metadata: Metadata = {
  title: "AI PDF Document Assistant — WorkOnline AI",
  description:
    "Upload multi-page PDFs and interact through an intelligent AI chat interface with grounded answers, page citations, and summary extraction.",
};

export default function PdfAssistantPage() {
  return <PdfAssistantSuite />;
}
