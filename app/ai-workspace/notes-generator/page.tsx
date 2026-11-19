import { Metadata } from "next";
import { NotesGeneratorSuite } from "@/components/ai/notes-generator-suite";

export const metadata: Metadata = {
  title: "AI Notes Generator — WorkOnline AI",
  description:
    "Generate structured academic and professional study notes with high-yield definitions, formula callouts, and DOCX/PDF export.",
};

export default function NotesGeneratorPage() {
  return <NotesGeneratorSuite />;
}
