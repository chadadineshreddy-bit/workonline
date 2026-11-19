import { Metadata } from "next";
import { ResumeAssistantSuite } from "@/components/ai/resume-assistant-suite";

export const metadata: Metadata = {
  title: "AI Resume Assistant — WorkOnline AI",
  description:
    "Evaluate your resume structure, STAR-method bullet points, and target job description keywords without false hallucinations.",
};

export default function ResumeAssistantPage() {
  return <ResumeAssistantSuite />;
}
