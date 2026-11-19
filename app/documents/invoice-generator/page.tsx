import { Metadata } from "next";
import { InvoiceGeneratorSuite } from "@/components/editor/invoice-generator-suite";

export const metadata: Metadata = {
  title: "Invoice & Billing Generator — WorkOnline Document Studio",
  description:
    "Generate professional invoices and billings with dynamic line items, auto-calculated totals, taxes, and discounts. Download as DOCX or print-ready PDF.",
};

export default function InvoiceGeneratorPage() {
  return <InvoiceGeneratorSuite />;
}
