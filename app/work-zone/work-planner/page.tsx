import { Metadata } from "next";
import { WorkPlannerSuite } from "@/components/work/work-planner-suite";

export const metadata: Metadata = {
  title: "Daily Work Planner & Time-Blocking — WorkOnline Work Zone",
  description:
    "Organize daily workplace schedules, prevent session time overlaps, schedule rest intervals, and track productive focus hours.",
};

export default function WorkPlannerPage() {
  return <WorkPlannerSuite />;
}
