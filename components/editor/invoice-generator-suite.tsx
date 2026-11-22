"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Download,
  Printer,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Building,
  User,
  CreditCard,
  ChevronRight,
  Save,
  Check
} from "lucide-react";
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer
} from "docx";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "CAD", symbol: "$", label: "CAD ($)" },
  { code: "AUD", symbol: "$", label: "AUD ($)" },
];

export function InvoiceGeneratorSuite() {
  const [currency, setCurrency] = useState("$");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-0042");
  const [issueDate, setIssueDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  // Business Details
  const [businessName, setBusinessName] = useState("Nexus Digital Studio LLC");
  const [businessEmail, setBusinessEmail] = useState("billing@nexusdigital.io");
  const [businessPhone, setBusinessPhone] = useState("+1 (555) 789-0123");
  const [businessAddress, setBusinessAddress] = useState("742 Evergreen Terrace, Suite 100, Austin, TX 78701");
  const [taxId, setTaxId] = useState("US-EIN: 84-9382104");

  // Client Details
  const [clientName, setClientName] = useState("Acme Cloud Solutions Inc.");
  const [clientContact, setClientContact] = useState("Marcus Sterling (VP Eng)");
  const [clientEmail, setClientEmail] = useState("marcus@acmecloud.com");
  const [clientAddress, setClientAddress] = useState("100 Tech Boulevard, Floor 12, San Francisco, CA 94105");

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "Frontend UI/UX Architecture & Design System Implementation (Next.js & Tailwind)",
      quantity: 40,
      rate: 125,
    },
    {
      id: "2",
      description: "Document Processing & Client-Side Engine Integration",
      quantity: 25,
      rate: 140,
    },
    {
      id: "3",
      description: "Performance Optimization, Lighthouse Audit & Production Hardening",
      quantity: 1,
      rate: 950,
    },
  ]);

  // Tax, discount, notes
  const [taxRate, setTaxRate] = useState<number>(8.5);
  const [discountRate, setDiscountRate] = useState<number>(5);
  const [paymentNotes, setPaymentNotes] = useState(
    "Payment terms: Net 14 days. Please transfer payment to Silicon Valley Bank (Routing: 121000358, Acct: 9948271048) or via ACH. Thank you for your business!"
  );

  const [savedStatus, setSavedStatus] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Auto-save draft to local storage
  useEffect(() => {
    const saved = localStorage.getItem("workonline_invoice_draft");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.invoiceNumber) setInvoiceNumber(data.invoiceNumber);
        if (data.businessName) setBusinessName(data.businessName);
        if (data.clientName) setClientName(data.clientName);
        if (data.items?.length) setItems(data.items);
      } catch {
        // ignore error
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const data = {
      invoiceNumber,
      issueDate,
      dueDate,
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      taxId,
      clientName,
      clientContact,
      clientEmail,
      clientAddress,
      items,
      taxRate,
      discountRate,
      paymentNotes,
    };
    localStorage.setItem("workonline_invoice_draft", JSON.stringify(data));
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        description: "",
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculations
  const subtotal = items.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
    0
  );
  const discountAmount = subtotal * ((Number(discountRate) || 0) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * ((Number(taxRate) || 0) / 100);
  const grandTotal = taxableAmount + taxAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const tableRows: TableRow[] = [];

      // Header row
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF" })],
                }),
              ],
              shading: { fill: "2563EB" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF" })],
                }),
              ],
              shading: { fill: "2563EB" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: "Rate", bold: true, color: "FFFFFF" })],
                }),
              ],
              shading: { fill: "2563EB" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: "Amount", bold: true, color: "FFFFFF" })],
                }),
              ],
              shading: { fill: "2563EB" },
            }),
          ],
        })
      );

      // Line items rows
      items.forEach((item) => {
        const itemTotal = (item.quantity || 0) * (item.rate || 0);
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph(item.description || "Item")],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun(String(item.quantity))],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun(`${currency}${item.rate.toFixed(2)}`)],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun(`${currency}${itemTotal.toFixed(2)}`)],
                  }),
                ],
              }),
            ],
          })
        );
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
              },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "INVOICE",
                    bold: true,
                    size: 36,
                    color: "1E293B",
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `# ${invoiceNumber}  •  Date: ${issueDate}  •  Due: ${dueDate}`,
                    size: 20,
                    color: "64748B",
                  }),
                ],
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({ text: "FROM:\n", bold: true }),
                  new TextRun(`${businessName}\n${businessAddress}\n${businessEmail} | ${businessPhone}\n${taxId}`),
                ],
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({ text: "BILL TO:\n", bold: true }),
                  new TextRun(`${clientName}\n${clientContact}\n${clientAddress}\n${clientEmail}`),
                ],
              }),
              new Paragraph({ text: "" }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: `Subtotal: ${currency}${subtotal.toFixed(2)}\n` }),
                  new TextRun({ text: `Discount (${discountRate}%): -${currency}${discountAmount.toFixed(2)}\n` }),
                  new TextRun({ text: `Tax (${taxRate}%): ${currency}${taxAmount.toFixed(2)}\n` }),
                  new TextRun({
                    text: `TOTAL DUE: ${currency}${grandTotal.toFixed(2)}`,
                    bold: true,
                    size: 24,
                    color: "2563EB",
                  }),
                ],
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Notes / Payment Details:\n", bold: true }),
                  new TextRun(paymentNotes),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      triggerBlobDownload(blob, `invoice-${invoiceNumber.toLowerCase()}.docx`);
    } catch (err) {
      console.error("Invoice DOCX generation error:", err);
      alert("Failed to export invoice as DOCX.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="text-white space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Document Studio <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Receipt className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Invoice & Billing Generator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDraft}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              {savedStatus ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 text-[#777777]" />}
              <span>{savedStatus ? "Saved" : "Save Draft"}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#777777]" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-medium hover:from-[#FF5B66] hover:to-[#F04452] disabled:opacity-50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingDocx ? "Exporting..." : "Export DOCX"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form Controls */}
          <div className="lg:col-span-5 space-y-4 print:hidden">
            {/* Invoice Meta */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#F04452]" /> Invoice Settings
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.symbol}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
              </div>
            </div>

            {/* Business / Sender Details */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#F04452]" /> Your Business (Issuer)
              </h3>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Company / Freelancer Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Email</label>
                    <input
                      type="email"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Phone</label>
                    <input
                      type="text"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Billing Address</label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Tax ID / VAT / GSTIN</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#F04452]" /> Client (Billed To)
              </h3>
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Client / Company Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-[#777777]">Contact Person</label>
                    <input
                      type="text"
                      value={clientContact}
                      onChange={(e) => setClientContact(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Client Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Client Address</label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Builder */}
            <div className="liquid-glass-card rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#F04452]" /> Line Items ({items.length})
                </h3>
                <button
                  onClick={handleAddItem}
                  className="text-xs text-[#F04452] hover:text-[#D72638] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white/20 rounded-lg border border-white/80 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#777777]">Item #{index + 1}</span>
                      {items.length > 1 && (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Description of service or goods..."
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded border border-white/80 bg-white focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[#777777]">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-xs px-2 py-1 rounded border border-white/80 bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#777777]">Unit Rate ({currency})</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleUpdateItem(item.id, "rate", parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-xs px-2 py-1 rounded border border-white/80 bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tax & Discount adjustments */}
              <div className="pt-3 border-t border-white/80 mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountRate}
                    onChange={(e) => setDiscountRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#777777]">Tax / VAT (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-white/80 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment notes */}
              <div className="mt-3">
                <label className="text-[11px] font-medium text-[#777777]">Payment Notes / Terms</label>
                <textarea
                  rows={3}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-white/80 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Right Live Invoice Preview */}
          <div className="lg:col-span-7">
            <div className="sticky top-20">
              <div className="bg-slate-100 dark:bg-[#1C1619] border border-slate-200 dark:border-white/10 rounded-t-xl px-4 py-2.5 flex items-center justify-between text-xs print:hidden">
                <span className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                  <Receipt className="w-3.5 h-3.5 text-[#DC2626]" /> Live Invoice Preview
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-[#9E8E93]">
                  Ready to print or export
                </span>
              </div>

              {/* Printable Invoice Sheet */}
              <div
                id="invoice-preview-sheet"
                className="bg-white rounded-b-xl border-x border-b border-slate-200 dark:border-white/10 shadow-xl p-8 sm:p-12 text-slate-900 min-h-[800px] print:shadow-none print:border-none print:p-0 print:m-0"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-200 pb-8 mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {businessName || "Your Company"}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm">
                      {businessAddress}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {[businessEmail, businessPhone].filter(Boolean).join("  •  ")}
                    </p>
                    {taxId && (
                      <p className="text-xs font-mono text-slate-600 mt-1">
                        {taxId}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <span className="text-3xl font-extrabold text-[#DC2626] tracking-wider">
                      INVOICE
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                      # {invoiceNumber}
                    </p>
                    <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                      <div><span className="font-medium text-slate-900">Issue Date:</span> {issueDate}</div>
                      <div><span className="font-medium text-slate-900">Due Date:</span> {dueDate}</div>
                    </div>
                  </div>
                </div>

                {/* Billed To */}
                <div className="mb-8">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Billed To:
                  </p>
                  <p className="text-base font-bold text-slate-900">{clientName || "Client Name"}</p>
                  {clientContact && (
                    <p className="text-xs text-[#777777]">{clientContact}</p>
                  )}
                  {clientAddress && (
                    <p className="text-xs text-[#777777] max-w-sm mt-0.5">{clientAddress}</p>
                  )}
                  {clientEmail && (
                    <p className="text-xs text-[#F04452] mt-0.5">{clientEmail}</p>
                  )}
                </div>

                {/* Table of items */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-white/80 text-left text-[#777777] uppercase tracking-wider font-semibold">
                        <th className="py-2.5 pr-4">Description</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate</th>
                        <th className="py-2.5 pl-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => {
                        const rowTotal = (item.quantity || 0) * (item.rate || 0);
                        return (
                          <tr key={item.id || idx}>
                            <td className="py-3 pr-4 font-medium text-[#202124]">
                              {item.description || "Untitled item"}
                            </td>
                            <td className="py-3 px-3 text-right text-[#777777]">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-3 text-right text-[#777777]">
                              {currency}{Number(item.rate).toFixed(2)}
                            </td>
                            <td className="py-3 pl-3 text-right font-semibold text-[#202124]">
                              {currency}{rowTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary calculation totals */}
                <div className="flex flex-col sm:flex-row sm:justify-end border-t border-white/80 pt-4 mb-8">
                  <div className="w-full sm:w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-[#777777]">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-[#202124]">{currency}{subtotal.toFixed(2)}</span>
                    </div>

                    {discountRate > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount ({discountRate}%):</span>
                        <span>-{currency}{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {taxRate > 0 && (
                      <div className="flex justify-between text-[#777777]">
                        <span>Tax ({taxRate}%):</span>
                        <span>{currency}{taxAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-bold text-[#202124] border-t border-white/80 pt-2">
                      <span>Total Due:</span>
                      <span className="text-[#F04452]">{currency}{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Notes */}
                {paymentNotes && (
                  <div className="border-t border-white/60 pt-6">
                    <p className="text-[11px] font-bold text-[#777777] uppercase tracking-wider mb-1">
                      Payment Terms & Instructions
                    </p>
                    <p className="text-xs text-[#777777] leading-relaxed whitespace-pre-line">
                      {paymentNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
