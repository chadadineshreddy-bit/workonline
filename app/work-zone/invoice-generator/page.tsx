import { Metadata } from "next";
import { InvoiceGeneratorSuite } from "@/components/editor/invoice-generator-suite";

export const metadata: Metadata = {
  title: "Professional Invoice Generator — WorkOnline Work Zone",
  description:
    "Generate itemized corporate and freelance invoices with automated tax, discounts, multi-currency formatting, DOCX export, and print-ready PDF.",
};

export default function WorkInvoicePage() {
  return <InvoiceGeneratorSuite />;
}
