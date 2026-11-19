import { Metadata } from "next";
import { AttendanceCalculatorSuite } from "@/components/student/attendance-calculator-suite";

export const metadata: Metadata = {
  title: "Attendance Calculator & Bunk Planner — WorkOnline Student Zone",
  description:
    "Calculate lecture attendance percentage, safely missed class allowance, and required consecutive classes to reach minimum attendance targets.",
};

export default function AttendanceCalculatorPage() {
  return <AttendanceCalculatorSuite />;
}
