import { Metadata } from "next";
import { LetterGeneratorSuite } from "@/components/editor/letter-generator-suite";

export const metadata: Metadata = {
  title: "Professional Letter Generator — WorkOnline Document Studio",
  description:
    "Generate formal letters, leave applications, resignations, permission letters, and official requests. Export directly to DOCX or print-ready PDF.",
};

export default function LetterGeneratorPage() {
  return <LetterGeneratorSuite />;
}
