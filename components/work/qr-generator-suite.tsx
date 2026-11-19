"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  QrCode,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Globe,
  Mail,
  Phone,
  Wifi,
  FileText,
  Sliders,
  CheckCircle2
} from "lucide-react";
import QRCode from "qrcode";
import { triggerBlobDownload } from "@/lib/pdf/pdf-utils";

type QrType = "url" | "text" | "email" | "phone" | "wifi";

export function QrGeneratorSuite() {
  const [qrType, setQrType] = useState<QrType>("url");

  // Content inputs
  const [url, setUrl] = useState("https://workonline.com");
  const [plainText, setPlainText] = useState("One platform. Every task. Simplified.");
  const [emailTo, setEmailTo] = useState("contact@company.com");
  const [emailSubject, setEmailSubject] = useState("Inquiry regarding enterprise workspace");
  const [emailBody, setEmailBody] = useState("Hello, I would like to learn more about WorkOnline.");
  const [phoneNumber, setPhoneNumber] = useState("+15550192834");
  const [wifiSsid, setWifiSsid] = useState("Office_Guest_5G");
  const [wifiPassword, setWifiPassword] = useState("WorkOnline2026!");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");

  // Styling inputs
  const [darkColor, setDarkColor] = useState("#0f172a");
  const [lightColor, setLightColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState<number>(300);

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrSvgString, setQrSvgString] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Compute final encoded text payload
  const encodedPayload = useMemo(() => {
    switch (qrType) {
      case "url":
        return url.startsWith("http") ? url : `https://${url}`;
      case "text":
        return plainText;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "phone":
        return `tel:${phoneNumber}`;
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      default:
        return url;
    }
  }, [
    qrType,
    url,
    plainText,
    emailTo,
    emailSubject,
    emailBody,
    phoneNumber,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
  ]);

  // Generate QR Code on canvas and SVG
  useEffect(() => {
    let isMounted = true;

    async function generate() {
      try {
        const dataUrl = await QRCode.toDataURL(encodedPayload || "https://workonline.com", {
          width: qrSize,
          margin: 2,
          color: {
            dark: darkColor,
            light: lightColor,
          },
        });

        const svgStr = await QRCode.toString(encodedPayload || "https://workonline.com", {
          type: "svg",
          width: qrSize,
          margin: 2,
          color: {
            dark: darkColor,
            light: lightColor,
          },
        });

        if (isMounted) {
          setQrDataUrl(dataUrl);
          setQrSvgString(svgStr);
        }
      } catch (err) {
        console.error("QR Generation error:", err);
      }
    }

    generate();

    return () => {
      isMounted = false;
    };
  }, [encodedPayload, darkColor, lightColor, qrSize]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `workonline-qrcode-${qrType}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml;charset=utf-8" });
    triggerBlobDownload(blob, `workonline-qrcode-${qrType}.svg`);
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(encodedPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy payload.");
    }
  };

  return (
    <div className="text-white space-y-8">
      {/* Top Banner */}
      <div className="liquid-glass-pill p-3 px-6 mb-6 flex items-center justify-between print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/work-zone"
              className="text-xs font-semibold text-[#F04452] hover:text-[#D72638] flex items-center gap-1"
            >
              Work Zone <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center text-[#F04452]">
                <QrCode className="w-4 h-4" />
              </div>
              <h1 className="text-base font-bold text-[#202124] hidden sm:block">
                Professional QR Code Generator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSvg}
              className="px-3 py-1.5 rounded-lg border border-white/80 text-xs font-medium text-[#202124] hover:bg-white/30 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#777777]" />
              <span>Download SVG</span>
            </button>
            <button
              onClick={handleDownloadPng}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white text-xs font-semibold hover:from-[#FF5B66] hover:to-[#F04452] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
            Custom High-Resolution QR Codes
          </h2>
          <p className="text-xs sm:text-sm text-[#777777] mt-1 max-w-3xl">
            Generate print-ready QR codes for websites, plain text, direct email composition, phone dials, and Wi-Fi network credentials.
          </p>
        </div>

        {/* QR Type Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "url", label: "Website URL", icon: Globe },
            { id: "text", label: "Plain Text", icon: FileText },
            { id: "email", label: "Email Message", icon: Mail },
            { id: "phone", label: "Phone Dial", icon: Phone },
            { id: "wifi", label: "Wi-Fi Network", icon: Wifi },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = qrType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setQrType(item.id as QrType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-gradient-to-tr from-[#F04452] to-[#D72638] text-white shadow-xs"
                    : "liquid-glass-card text-[#202124] hover:bg-white/30"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Composer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Form Inputs */}
          <div className="md:col-span-7 space-y-5">
            <div className="liquid-glass-card rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#F04452]" /> Content & Data Payload
              </h3>

              {qrType === "url" && (
                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Website Address (URL)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 font-mono text-[#F04452] focus:outline-none focus:ring-1 focus:ring-[#F04452]/30"
                  />
                </div>
              )}

              {qrType === "text" && (
                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Plain Text Content
                  </label>
                  <textarea
                    rows={4}
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    placeholder="Enter any text, code, or instructions..."
                    className="w-full text-xs p-3 rounded-lg border border-white/80 focus:outline-none focus:ring-1 focus:ring-[#F04452]/30 resize-none"
                  />
                </div>
              )}

              {qrType === "email" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#202124] block mb-1">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="support@company.com"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#202124] block mb-1">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Inquiry Subject"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#202124] block mb-1">
                      Default Body Text
                    </label>
                    <textarea
                      rows={3}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-white/80 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {qrType === "phone" && (
                <div>
                  <label className="text-xs font-medium text-[#202124] block mb-1">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 font-mono focus:outline-none"
                  />
                </div>
              )}

              {qrType === "wifi" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[#202124] block mb-1">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="Office_Network_5G"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#202124] block mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="Network Password"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#202124] block mb-1">
                      Security Type
                    </label>
                    <select
                      value={wifiEncryption}
                      onChange={(e) => setWifiEncryption(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-white/80 bg-white"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                      <option value="WEP">WEP (Legacy)</option>
                      <option value="nopass">No Password (Open)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Visual Styling Card */}
            <div className="liquid-glass-card rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                Color & Dimensions Customization
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Module / Foreground Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="w-8 h-8 rounded border border-white/80 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="flex-1 text-xs px-2 py-1.5 rounded border border-white/80 font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#777777] block mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="w-8 h-8 rounded border border-white/80 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="flex-1 text-xs px-2 py-1.5 rounded border border-white/80 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#777777] block mb-1">
                  Export Dimension: <strong className="text-[#202124]">{qrSize} × {qrSize} px</strong>
                </label>
                <input
                  type="range"
                  min="200"
                  max="800"
                  step="50"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Live Preview Card */}
          <div className="md:col-span-5 space-y-4">
            <div className="liquid-glass-card rounded-2xl p-8 shadow-sm text-center space-y-6 sticky top-24">
              <span className="text-[11px] font-bold text-[#777777] uppercase tracking-wider block">
                Live High-Res Preview
              </span>

              {/* Rendered Image */}
              <div className="inline-block p-4 rounded-2xl border border-white/60 shadow-sm bg-white/20">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="WorkOnline Generated QR Code"
                    className="w-56 h-56 mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-xs text-[#777777]">
                    Generating...
                  </div>
                )}
              </div>

              <div className="text-xs text-[#777777] break-all font-mono p-3 bg-white/20 rounded-xl border border-white/60 max-h-24 overflow-y-auto">
                <span className="text-[10px] uppercase font-bold text-[#777777] block mb-0.5">
                  Payload string:
                </span>
                {encodedPayload}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadPng}
                  className="py-2.5 px-3 rounded-xl liquid-btn-primary text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> PNG Image
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Vector SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
