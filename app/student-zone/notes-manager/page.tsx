import { Metadata } from "next";
import { StudentNotesManager } from "@/components/student/student-notes-manager";

export const metadata: Metadata = {
  title: "Academic Notes & Study Binder — WorkOnline Student Zone",
  description:
    "Organize lecture notes, formula sheets, and revision summaries by subject. Export to PDF or DOCX with local persistence.",
};

export default function NotesManagerPage() {
  return <StudentNotesManager />;
}
