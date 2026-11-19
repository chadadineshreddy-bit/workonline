import { Metadata } from "next";
import { ExamCountdownSuite } from "@/components/student/exam-countdown-suite";

export const metadata: Metadata = {
  title: "Exam Countdown & Schedule Tracker — WorkOnline Student Zone",
  description:
    "Real-time countdown timer to semester exams, test dates, room locations, and syllabus scopes with urgency indicators and local saving.",
};

export default function ExamCountdownPage() {
  return <ExamCountdownSuite />;
}
