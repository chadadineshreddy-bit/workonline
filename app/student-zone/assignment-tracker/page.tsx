import { Metadata } from "next";
import { AssignmentTrackerSuite } from "@/components/student/assignment-tracker-suite";

export const metadata: Metadata = {
  title: "Assignment & Homework Tracker — WorkOnline Student Zone",
  description:
    "Track student assignments, project milestones, due dates, priority tiers, and completion status with local persistence and overdue notifications.",
};

export default function AssignmentTrackerPage() {
  return <AssignmentTrackerSuite />;
}
