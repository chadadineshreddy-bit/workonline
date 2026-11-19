"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Check, AlertCircle, ArrowRight, Layers } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Authentication client not initialized.");
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
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
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">Set new password</h1>
        <p className="text-xs sm:text-sm text-[#777777]">
          Enter and confirm your new secure password.
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
                Password updated successfully! Redirecting you to sign in...
              </div>
            </div>
            <Link
              href="/login"
              className="w-full py-3 liquid-btn-primary text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#777777] mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl liquid-glass-input focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 text-[#202124] placeholder-[#777777] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#777777] hover:text-[#202124] absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#777777] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl liquid-glass-input focus:outline-none focus:ring-2 focus:ring-[#F04452]/30 text-[#202124] placeholder-[#777777] font-medium"
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
