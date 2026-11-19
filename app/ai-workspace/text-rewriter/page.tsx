import { Metadata } from "next";
import { TextRewriterSuite } from "@/components/ai/text-rewriter-suite";

export const metadata: Metadata = {
  title: "AI Text Rewriter — WorkOnline AI",
  description:
    "Rewrite, simplify, expand, or professionally polish text with side-by-side comparison and instant copy.",
};

export default function TextRewriterPage() {
  return <TextRewriterSuite />;
}
