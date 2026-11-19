import { Metadata } from "next";
import { ExcelAssistantSuite } from "@/components/work/excel-assistant-suite";

export const metadata: Metadata = {
  title: "Excel Formula Assistant & Reference Library — WorkOnline Work Zone",
  description:
    "Comprehensive Excel and spreadsheet formula guide with search, syntax examples, and step-by-step formula breakdown.",
};

export default function ExcelToolsPage() {
  return <ExcelAssistantSuite />;
}
