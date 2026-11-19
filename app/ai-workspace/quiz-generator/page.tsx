import { Metadata } from "next";
import { QuizGeneratorSuite } from "@/components/ai/quiz-generator-suite";

export const metadata: Metadata = {
  title: "AI Quiz Generator — WorkOnline AI",
  description:
    "Generate interactive self-grading quizzes directly from syllabus topics or uploaded textbooks to test conceptual mastery.",
};

export default function QuizGeneratorPage() {
  return <QuizGeneratorSuite />;
}
