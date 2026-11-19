import { Metadata } from "next";
import { TaskManagerSuite } from "@/components/work/task-manager-suite";

export const metadata: Metadata = {
  title: "Workplace Task Manager (Kanban & List) — WorkOnline Work Zone",
  description:
    "Organize deliverables, sprint milestones, and action items with interactive Kanban columns, list view, overdue warnings, and persistent local storage.",
};

export default function TaskManagerPage() {
  return <TaskManagerSuite />;
}
