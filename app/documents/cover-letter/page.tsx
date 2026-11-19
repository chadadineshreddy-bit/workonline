import { Metadata } from "next";
import { CoverLetterSuite } from "@/components/editor/cover-letter-suite";

export const metadata: Metadata = {
  title: "Cover Letter Generator — WorkOnline Document Studio",
  description:
    "Generate tailored, professional cover letters for job applications. Customize tone, experience, and export to DOCX or print-ready PDF.",
};

export default function CoverLetterPage() {
  return <CoverLetterSuite />;
}
