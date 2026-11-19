"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  Plus,
  Trash2,
  Printer,
  Download,
  Building,
  User,
  Calendar,
  DollarSign
} from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-001");
  const [invoiceDate, setInvoiceDate] = useState("2026-11-14");
  const [dueDate, setDueDate] = useState("2026-11-28");
  const [currency, setCurrency] = useState("$");

  // Sender info
  const [sender, setSender] = useState({
    name: "Alex Rivera Studios",
    email: "billing@alexrivera.dev",
    address: "742 Market Street, Suite 400\nSan Francisco, CA 94102",
  });

  // Client info
  const [client, setClient] = useState({
    name: "Acme Corporation",
    email: "accounts@acmecorp.com",
    address: "100 Enterprise Way\nNew York, NY 10001",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "1",
      description: "Frontend Next.js SaaS Architecture & Design System",
      quantity: 40,
      rate: 85,
    },
    {
      id: "2",
      description: "PDF & Document Processing Engine Implementation",
      quantity: 25,
      rate: 85,
    },
    {
      id: "3",
      description: "Cloud Deployment & Vercel Performance Optimization",
      quantity: 10,
      rate: 85,
    },
  ]);

  const [taxRate, setTaxRate] = useState<number>(8);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState("Payment is due within 14 days of invoice date. Bank transfer details: Routing #021000021, Account #889210492.");

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "New Item / Service",
        quantity: 1,
        rate: 50,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculations
  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
      0
    );
    const disc = Number(discount) || 0;
    const discountedSub = Math.max(0, sub - disc);
    const tax = (discountedSub * (Number(taxRate) || 0)) / 100;
    const finalTotal = discountedSub + tax;

    return {
      subtotal: sub,
      taxAmount: tax,
      total: finalTotal,
    };
  }, [items, taxRate, discount]);

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Interactive Invoice Generator
            </h3>
            <p className="text-xs text-slate-400">
              Live calculated invoice ready for print or PDF download
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Invoice Document Preview & Interactive Form */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-200 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-200">
          <div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              INVOICE
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Invoice #:</span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="text-xs font-bold px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
              />
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Issue Date:</span>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="px-2 py-1 bg-slate-50 rounded border border-slate-200 font-medium print:border-none print:bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Payment Due:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-2 py-1 bg-slate-50 rounded border border-slate-200 font-medium print:border-none print:bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sender & Client Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200">
          {/* From */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Billed From:
            </span>
            <input
              type="text"
              value={sender.name}
              onChange={(e) => setSender({ ...sender, name: e.target.value })}
              className="w-full text-sm font-bold text-slate-900 px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
            />
            <input
              type="email"
              value={sender.email}
              onChange={(e) => setSender({ ...sender, email: e.target.value })}
              className="w-full text-xs text-slate-600 px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
            />
            <textarea
              rows={2}
              value={sender.address}
              onChange={(e) => setSender({ ...sender, address: e.target.value })}
              className="w-full text-xs text-slate-600 px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
            />
          </div>

          {/* To */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Billed To:
            </span>
            <input
              type="text"
              value={client.name}
              onChange={(e) => setClient({ ...client, name: e.target.value })}
              className="w-full text-sm font-bold text-slate-900 px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
            />
            <input
              type="email"
              value={client.email}
              onChange={(e) => setClient({ ...client, email: e.target.value })}
              className="w-full text-xs text-slate-600 px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
            />
            <textarea
              rows={2}
              value={client.address}
              onChange={(e) => setClient({ ...client, address: e.target.value })}
              className="w-full text-xs text-slate-600 px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
            />
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <div className="grid grid-cols-12 gap-3 pb-3 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty / Hrs</div>
            <div className="col-span-2 text-right">Rate ({currency})</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          <div className="divide-y divide-slate-100 py-2">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 py-3 items-center">
                <div className="col-span-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-slate-300 hover:text-rose-500 print:hidden p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
                  />
                </div>
                <div className="col-span-2 text-right">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                    className="w-20 text-right text-xs px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
                  />
                </div>
                <div className="col-span-2 text-right">
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", Number(e.target.value))}
                    className="w-20 text-right text-xs px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
                  />
                </div>
                <div className="col-span-2 text-right text-xs font-bold text-slate-900">
                  {currency}{(item.quantity * item.rate).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 print:hidden"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add line item</span>
          </button>
        </div>

        {/* Totals Summary */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between gap-6">
          <div className="sm:max-w-xs space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400">Notes & Payment Instructions:</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs text-slate-600 px-2 py-1 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
            />
          </div>

          <div className="sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{currency}{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <span>Tax Rate:</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-12 text-center text-xs px-1 py-0.5 bg-slate-50 rounded border border-slate-200 print:border-none print:bg-transparent"
                />
                <span>%</span>
              </span>
              <span className="font-semibold text-slate-900">
                {currency}{taxAmount.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Due:</span>
              <span className="text-base text-blue-600">{currency}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
