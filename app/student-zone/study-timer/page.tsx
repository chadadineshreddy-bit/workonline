import { Metadata } from "next";
import { PomodoroTimerSuite } from "@/components/student/pomodoro-timer-suite";

export const metadata: Metadata = {
  title: "Pomodoro Study & Focus Timer — WorkOnline Student Zone",
  description:
    "Drift-resistant Pomodoro timer with customizable focus intervals, short breaks, long breaks, session tracking, and audio chime alerts.",
};

export default function StudyTimerPage() {
  return <PomodoroTimerSuite />;
}
