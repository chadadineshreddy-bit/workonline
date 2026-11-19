import { Metadata } from "next";
import { QrGeneratorSuite } from "@/components/work/qr-generator-suite";

export const metadata: Metadata = {
  title: "Professional QR Code Generator — WorkOnline Work Zone",
  description:
    "Generate customized, high-resolution QR codes for websites, WiFi networks, plain text, email drafts, and telephone contacts with instant PNG & SVG export.",
};

export default function QrGeneratorPage() {
  return <QrGeneratorSuite />;
}
