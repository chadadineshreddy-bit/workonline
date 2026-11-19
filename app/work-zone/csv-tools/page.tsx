import { Metadata } from "next";
import { CsvToolsSuite } from "@/components/work/csv-tools-suite";

export const metadata: Metadata = {
  title: "CSV & XLSX Spreadsheet Tools — WorkOnline Work Zone",
  description:
    "Preview CSV and Excel workbooks, search rows, sort columns, and convert between CSV, XLSX, and JSON formats in your browser.",
};

export default function CsvToolsPage() {
  return <CsvToolsSuite />;
}
