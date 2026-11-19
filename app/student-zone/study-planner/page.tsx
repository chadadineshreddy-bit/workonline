import { Metadata } from "next";
import { StudyTimetableSuite } from "@/components/student/study-timetable-suite";

export const metadata: Metadata = {
  title: "Study Timetable & Planner — WorkOnline Student Zone",
  description:
    "Generate non-overlapping weekly study schedules weighted by course priority, exam dates, and automated rest intervals.",
};

export default function StudyPlannerPage() {
  return <StudyTimetableSuite />;
}
