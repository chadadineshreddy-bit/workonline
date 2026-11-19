import { Metadata } from "next";
import { StudentDashboard } from "@/components/student/student-dashboard";

export const metadata: Metadata = {
  title: "Student Zone — WorkOnline Academic Productivity Hub",
  description:
    "Comprehensive academic toolkit: Credit-weighted CGPA/SGPA calculators, attendance bunk planner, study timetable generator, assignment tracker, flashcards, and quiz generator.",
};

export default function StudentZonePage() {
  return <StudentDashboard />;
}
