import { Metadata } from "next";
import { WorkDashboard } from "@/components/work/work-dashboard";

export const metadata: Metadata = {
  title: "Employee Productivity Hub — WorkOnline Work Zone",
  description:
    "Professional workplace tools for office employees, freelancers, developers, and managers: Email writer, meeting minutes, Excel assistant, CSV converter, task manager, and more.",
};

export default function WorkZonePage() {
  return <WorkDashboard />;
}
