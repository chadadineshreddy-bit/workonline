import { Metadata } from "next";
import { GrammarCheckerSuite } from "@/components/ai/grammar-checker-suite";

export const metadata: Metadata = {
  title: "AI Grammar Checker — WorkOnline AI",
  description:
    "Detect grammatical slips, spelling mistakes, and clarity issues with interactive accept/reject cards without overwriting your original work.",
};

export default function GrammarCheckerPage() {
  return <GrammarCheckerSuite />;
}
