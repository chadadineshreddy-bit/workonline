import React from "react";
import { Metadata } from "next";
import { WordEditor } from "@/components/editor/word-editor";

export const metadata: Metadata = {
  title: "Online Word Editor - WorkOnline",
  description: "Create, format, import and export Word (.docx) and PDF documents directly in your browser with zero bloat.",
};

export default function DocumentEditorPage() {
  return <WordEditor />;
}
