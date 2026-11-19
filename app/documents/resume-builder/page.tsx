import React from "react";
import { Metadata } from "next";
import { ResumeBuilderSuite } from "@/components/editor/resume-builder-suite";

export const metadata: Metadata = {
  title: "Professional Resume Builder - WorkOnline",
  description: "Create modern ATS-compliant resumes with multiple professional templates, live preview, and instant PDF & DOCX export.",
};

export default function ResumeBuilderPage() {
  return <ResumeBuilderSuite />;
}
