import { Metadata } from "next";
import { EmailAssistantSuite } from "@/components/ai/email-assistant-suite";

export const metadata: Metadata = {
  title: "AI Email Assistant — WorkOnline AI",
  description:
    "Compose clear, polite workplace emails with customizable tone settings, leave requests, meeting follow-ups, and DOCX/TXT export.",
};

export default function EmailAssistantPage() {
  return <EmailAssistantSuite />;
}
