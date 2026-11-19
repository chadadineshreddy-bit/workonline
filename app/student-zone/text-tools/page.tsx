import { Metadata } from "next";
import { StudentTextTools } from "@/components/student/student-text-tools";

export const metadata: Metadata = {
  title: "Word Counter & Text Utilities — WorkOnline Student Zone",
  description:
    "Live word, character, and sentence counter with speaking estimates, case transformation, space cleaning, and text diff comparison.",
};

export default function TextToolsPage() {
  return <StudentTextTools />;
}
