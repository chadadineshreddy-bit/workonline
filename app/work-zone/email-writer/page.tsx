import { Metadata } from "next";
import { EmailWriterSuite } from "@/components/work/email-writer-suite";

export const metadata: Metadata = {
  title: "Professional Email Writer — WorkOnline Work Zone",
  description:
    "Compose clear, polite workplace emails with customizable tone settings, leave requests, meeting follow-ups, and DOCX/TXT export.",
};

export default function EmailWriterPage() {
  return <EmailWriterSuite />;
}
