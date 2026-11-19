import { Metadata } from "next";
import { QuizGeneratorSuite } from "@/components/student/quiz-generator-suite";

export const metadata: Metadata = {
  title: "MCQ Quiz Generator & Exam Simulator — WorkOnline Student Zone",
  description:
    "Create and take custom multiple choice quizzes with instant scoring, answer keys, rationale explanations, and question bank management.",
};

export default function QuizGeneratorPage() {
  return <QuizGeneratorSuite />;
}
