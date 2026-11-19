import { Metadata } from "next";
import { FlashcardGeneratorSuite } from "@/components/ai/flashcard-generator-suite";

export const metadata: Metadata = {
  title: "AI Flashcard Generator — WorkOnline AI",
  description:
    "Generate active recall question-answer flashcard decks with 3D flip card study, shuffle, and mastery tracking.",
};

export default function FlashcardGeneratorPage() {
  return <FlashcardGeneratorSuite />;
}
