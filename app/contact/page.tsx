"use client";

import React, { useState } from "react";
import { MessageSquare, ShieldCheck, Zap, Mail, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-[#171114] border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-[#DC2626]/30 text-[#FB7185] text-xs font-semibold mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>WorkOnline Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight leading-tight">
            How Can We Assist{" "}
            <span className="bg-gradient-to-r from-[#DC2626] via-[#F43F5E] to-[#FB7185] bg-clip-text text-transparent">
              Your Workspace?
            </span>
          </h1>
          <p className="mt-3 text-sm text-[#E2D4D6] leading-relaxed max-w-2xl">
            Have questions about document processing, academic tools, or want to suggest an addition to WorkOnline? Send us a message and our team will get back to you promptly.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-[#9E8E93]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#DC2626]" />
              Zero Third-Party Telemetry
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#DC2626]" />
              Average Response &lt; 24h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#DC2626]" />
              support@workonline.app
            </span>
          </div>
        </div>
      </section>

      {/* Contact Form & Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-2 relative p-6 sm:p-8 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-heading text-white">
                Message Sent Successfully
              </h3>
              <p className="text-xs sm:text-sm text-[#E2D4D6] max-w-md mx-auto">
                Thank you for reaching out. We have received your inquiry and will reply to your email address within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-white hover:border-[#DC2626]/40"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#E2D4D6]">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-white text-xs sm:text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#E2D4D6]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-white text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#E2D4D6]">
                    Inquiry Topic
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-white text-xs sm:text-sm focus:outline-none bg-[#171114]"
                  >
                    <option value="support" className="bg-[#171114] text-white">General Support</option>
                    <option value="feature" className="bg-[#171114] text-white">Tool / Feature Suggestion</option>
                    <option value="bug" className="bg-[#171114] text-white">Bug Report</option>
                    <option value="partnership" className="bg-[#171114] text-white">Partnership / Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#E2D4D6]">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry"
                    className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-white text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#E2D4D6]">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question, request, or feedback in detail..."
                  className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-white text-xs sm:text-sm focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto liquid-btn-glass-crimson px-8 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
              </button>
            </form>
          )}
        </div>

        {/* Support Sidebar Info */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/12 shadow-xl space-y-3">
            <h3 className="text-sm font-bold font-heading text-white">Direct Communication</h3>
            <p className="text-xs text-[#9E8E93] leading-relaxed">
              Prefer writing an email directly? Reach out anytime at our official inbox.
            </p>
            <a
              href="mailto:support@workonline.app"
              className="inline-block text-xs font-bold text-[#FB7185] hover:underline"
            >
              support@workonline.app →
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.045] backdrop-blur-2xl border border-white/12 shadow-xl space-y-3">
            <h3 className="text-sm font-bold font-heading text-white">Client-Side Privacy</h3>
            <p className="text-xs text-[#9E8E93] leading-relaxed">
              WorkOnline processes documents directly in your browser. We never retain your PDF files, calculations, or uploaded assets on servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
