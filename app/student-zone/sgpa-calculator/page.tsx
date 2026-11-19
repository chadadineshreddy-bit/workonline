import { Metadata } from "next";
import { SgpaCalculatorSuite } from "@/components/student/sgpa-calculator-suite";

export const metadata: Metadata = {
  title: "SGPA Calculator — WorkOnline Student Zone",
  description:
    "Calculate semester grade point average (SGPA) with customizable credit weights, 10-point and 4-point scales, and course quality point breakdowns.",
};

export default function SgpaCalculatorPage() {
  return <SgpaCalculatorSuite />;
}
