import { Metadata } from "next";
import { SignatureSuite } from "@/components/work/signature-suite";

export const metadata: Metadata = {
  title: "Digital Signature Tool — WorkOnline Work Zone",
  description:
    "Draw or type professional electronic signatures with transparent background PNG/JPG export, ink color options, and stroke thickness controls.",
};

export default function SignaturePage() {
  return <SignatureSuite />;
}
