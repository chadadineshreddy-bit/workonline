import { Metadata } from "next";
import { CgpaCalculatorSuite } from "@/components/student/cgpa-calculator-suite";

export const metadata: Metadata = {
  title: "Credit-Weighted CGPA Calculator — WorkOnline Student Zone",
  description:
    "Calculate cumulative GPA with credit-weighted semester math, university percentage conversion formulas (CBSE, AICTE, VTU, Mumbai), and instant local saving.",
};

export default function CgpaCalculatorPage() {
  return <CgpaCalculatorSuite />;
}
