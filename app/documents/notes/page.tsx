import { Metadata } from "next";
import { NotesWorkspace } from "@/components/editor/notes-workspace";

export const metadata: Metadata = {
  title: "Notes & Quick Document Workspace — WorkOnline",
  description:
    "Organize, create, and format study notes, work ideas, and meeting summaries with folder organization, search, local autosave, and DOCX/PDF export.",
};

export default function NotesPage() {
  return <NotesWorkspace />;
}
