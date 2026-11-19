import { Metadata } from "next";
import { ExplainAnythingSuite } from "@/components/ai/explain-anything-suite";

export const metadata: Metadata = {
  title: "AI Explain Anything — WorkOnline AI",
  description:
    "Deconstruct complex academic or professional topics with clear real-world analogies, step-by-step depth, and beginner-to-advanced levels.",
};

export default function ExplainAnythingPage() {
  return <ExplainAnythingSuite />;
}
