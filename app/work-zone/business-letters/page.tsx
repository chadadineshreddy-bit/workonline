import { Metadata } from "next";
import { BusinessLettersSuite } from "@/components/work/business-letters-suite";

export const metadata: Metadata = {
  title: "Business & Corporate Letter Generator — WorkOnline Work Zone",
  description:
    "Generate professional business proposals, client introduction letters, complaint notices, and formal requests with DOCX and PDF export.",
};

export default function BusinessLettersPage() {
  return <BusinessLettersSuite />;
}
