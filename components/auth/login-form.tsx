"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";

function SearchParamsListener({
  onParams,
}: {
  onParams: (redirectTo: string, errorMsg: string | null) => void;
}) {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const next = searchParams.get("redirectTo") || "/workspace";
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    let err: string | null = null;
    if (errorDescription) {
      err = decodeURIComponent(errorDescription);
    } else if (errorParam) {
      err = `Authentication notice: ${errorParam}`;
    }
    onParams(next, err);
  }, [searchParams, onParams]);

  return null;
}

export function LoginForm() {
  const router = useRouter();
  const { isConfigured } = useAuth();

  const [redirectTo, setRedirectTo] = useState("/workspace");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const handleParams = React.useCallback((next: string, err: string | null) => {
    if (next) setRedirectTo(next);
    if (err) setError(err);
  }, []);

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError("Please enter your email address to resend confirmation.");
      return;
    }

    setIsResending(true);
    setResendSuccess(null);

    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/workspace`,
        },
      });

      if (resendErr) {
        setError(resendErr.message);
      } else {
        setResendSuccess(`Confirmation link resent to ${email.trim()}! Please check your inbox and spam folder.`);
      }
    } catch (err: any) {
      setError("Failed to resend confirmation email: " + (err.message || String(err)));
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!isConfigured) {
      setError("Supabase authentication is not configured in your server environment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file to enable genuine user sign-in.");
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("email not confirmed")) {
          setIsUnconfirmed(true);
          setError("Your email address has not been confirmed yet. Please verify your email before logging in.");
        } else {
          setIsUnconfirmed(false);
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        window.location.href = redirectTo;
      }
    } catch (err: any) {
      setError("Sign in failed: " + (err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 relative z-10 text-white">
      <React.Suspense fallback={null}>
        <SearchParamsListener onParams={handleParams} />
      </React.Suspense>

      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 relative shrink-0 group-hover:scale-105 transition-transform drop-shadow-[0_0_18px_rgba(220,38,38,0.5)]">
            <Image
              src="/logo.png"
              alt="WorkOnline Logo"
              width={44}
              height={44}
              priority
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">
            Work<span className="text-[#DC2626]">Online</span>
          </span>
        </Link>
        <h1 className="text-2xl font-black text-white tracking-tight">Welcome back</h1>
        <p className="text-xs sm:text-sm text-[#9E8E93]">
          Sign in to access your personal workspace, saved documents, and favorites.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="liquid-glass-form-card p-6 sm:p-8 space-y-5">
        {/* Specular Light Reflection */}
        <div className="liquid-glass-specular" />

        {/* Resend Success Alert */}
        {resendSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5 font-medium relative z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">{resendSuccess}</div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[#FB7185] text-xs sm:text-sm space-y-2 font-medium relative z-10">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
            {isUnconfirmed && (
              <div className="pt-1 border-t border-red-500/20">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  className="text-xs text-white hover:text-[#FB7185] underline font-semibold transition-colors disabled:opacity-50"
                >
                  {isResending ? "Resending confirmation email..." : "Resend confirmation email →"}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm liquid-glass-input-premium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#E2D4D6]">Password</label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#FB7185] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm liquid-glass-input-premium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[#9E8E93] hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-[#DC2626] focus:ring-[#DC2626] cursor-pointer accent-[#DC2626]"
            />
            <label htmlFor="remember" className="text-xs text-[#9E8E93] cursor-pointer font-medium">
              Keep me signed in on this device
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 liquid-btn-glass-crimson text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer link to Register */}
      <div className="text-center text-xs text-[#9E8E93]">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="text-[#FB7185] hover:underline font-semibold">
          Create an account
        </Link>
      </div>
    </div>
  );
}
