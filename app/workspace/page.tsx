import { Metadata } from "next";
import { WorkspaceDashboard } from "@/components/workspace/workspace-dashboard";

export const metadata: Metadata = {
  title: "Personal Workspace — WorkOnline",
  description: "Access your starred tools, recent documents, recent activities, and productivity workspaces in one place.",
};

export default function WorkspacePage() {
  return <WorkspaceDashboard />;
}
