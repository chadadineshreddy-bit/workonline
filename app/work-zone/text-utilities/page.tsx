import { Metadata } from "next";
import { StudentTextTools } from "@/components/student/student-text-tools";

export const metadata: Metadata = {
  title: "Workplace Text Utilities & Word Counter — WorkOnline Work Zone",
  description:
    "Analyze character limits, reading duration, speech presentation times, and compare document revisions with side-by-side text diff.",
};

export default function WorkTextUtilitiesPage() {
  return <StudentTextTools />;
}
