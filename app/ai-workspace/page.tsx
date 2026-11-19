import { Metadata } from "next";
import { AiDashboard } from "@/components/ai/ai-dashboard";

export const metadata: Metadata = {
  title: "AI Workspace — WorkOnline",
  description:
    "AI-powered productivity workspace for students and working professionals: Chat with PDFs, document summarizer, notes generator, quiz maker, and text polishers.",
};

export default function AiWorkspacePage() {
  return <AiDashboard />;
}
