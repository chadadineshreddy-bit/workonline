"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Check, AlertCircle, ArrowRight, ArrowLeft, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";

export function ForgotPasswordForm() {
  const { isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isConfigured) {
      setError("Supabase authentication is not configured in your server environment.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Could not initialize authentication client.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 relative z-10 text-[#202124]">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 relative shrink-0 group-hover:scale-105 transition-transform drop-shadow-[0_0_16px_rgba(220,38,38,0.5)]">
            <Image
              src="/logo.png"
              alt="WorkOnline Logo"
              width={44}
              height={44}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            Work<span className="text-[#DC2626]">Online</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">Reset your password</h1>
        <p className="text-xs sm:text-sm text-[#777777]">
          Enter your registered email and we&apos;ll send you a secure link to reset your password.
        </p>
      </div>

      <div className="floating-glass-canvas p-6 sm:p-8 space-y-5 shadow-xl">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#D72638] text-xs sm:text-sm flex items-start gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 text-[#F04452] shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#202124] text-xs sm:text-sm flex items-start gap-3">
              <Check className="w-5 h-5 text-[#F04452] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                We sent a password reset link to <strong className="text-[#202124]">{email}</strong>. Please check your inbox and follow the link to set a new password.
              </div>
            </div>
            <Link
              href="/login"
              className="w-full py-3 liquid-btn-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#777777] mb-1">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl liquid-glass-input focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 text-[#202124] placeholder-[#777777] font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 liquid-btn-primary font-bold text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-[#777777]">
        Remember your password?{" "}
        <Link href="/login" className="text-[#F04452] hover:underline font-bold">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
