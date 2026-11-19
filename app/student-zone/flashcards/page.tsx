import { Metadata } from "next";
import { FlashcardSuite } from "@/components/student/flashcard-suite";

export const metadata: Metadata = {
  title: "Flashcard Creator & Study Decks — WorkOnline Student Zone",
  description:
    "Active recall study flashcards with interactive 3D flip, multi-subject decks, card shuffling, and mastery progress tracking.",
};

export default function FlashcardsPage() {
  return <FlashcardSuite />;
}
