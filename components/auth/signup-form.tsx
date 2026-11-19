"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Layers,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";

export function SignupForm() {
  const router = useRouter();
  const { isConfigured } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [workspacePreference, setWorkspacePreference] = useState<"student" | "professional" | "both">("both");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the Terms of Service to create an account.");
      return;
    }

    if (!isConfigured) {
      setError("Supabase authentication is not configured in your server environment. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.");
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
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            workspace_preference: workspacePreference,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/workspace`,
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        window.location.href = "/workspace";
      } else {
        setSuccessMessage(
          `Account created successfully! We sent a confirmation link to ${email}. Please check your inbox and verify your email to log in.`
        );
      }
    } catch (err: any) {
      setError("Registration failed: " + (err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 relative z-10 text-white">
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
        <h1 className="text-2xl font-black text-white tracking-tight">Create your account</h1>
        <p className="text-xs sm:text-sm text-[#9E8E93]">
          Start organizing documents, studies, and workplace tasks in one unified space.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="liquid-glass-form-card p-6 sm:p-8 space-y-5">
        {/* Specular Light Reflection */}
        <div className="liquid-glass-specular" />

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-[#FB7185] text-xs sm:text-sm flex items-start gap-2.5 font-medium relative z-10">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage ? (
          <div className="space-y-4 relative z-10">
            <div className="p-4 rounded-xl bg-red-500/10 border border-[#DC2626]/30 text-white text-xs sm:text-sm flex items-start gap-3">
              <Check className="w-5 h-5 text-[#FB7185] shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[#E2D4D6]">{successMessage}</div>
            </div>
            <Link
              href="/login"
              className="w-full py-2.5 liquid-btn-glass-crimson text-xs sm:text-sm flex items-center justify-center gap-1.5"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Harrison"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm liquid-glass-input-premium"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">Email Address</label>
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

            {/* Workspace Preference Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">
                Primary Workspace Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "student", label: "Student" },
                  { id: "professional", label: "Professional" },
                  { id: "both", label: "Both" },
                ].map((pref) => (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => setWorkspacePreference(pref.id as any)}
                    className={`py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      workspacePreference === pref.id
                        ? "bg-[#DC2626] border-[#DC2626] text-white shadow-sm shadow-[#DC2626]/30"
                        : "bg-white/[0.045] border-white/10 text-[#9E8E93] hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {pref.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[#9E8E93] font-medium">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-[#FB7185]">{strengthLabels[passwordStrength]}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all ${
                          passwordStrength >= step ? "bg-[#DC2626]" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#E2D4D6] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm liquid-glass-input-premium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-[#9E8E93] hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-white/5 text-[#DC2626] focus:ring-[#DC2626] cursor-pointer accent-[#DC2626]"
              />
              <label htmlFor="terms" className="text-xs text-[#9E8E93] leading-snug cursor-pointer font-medium">
                I agree to the{" "}
                <Link href="/terms" className="text-[#FB7185] hover:underline font-semibold">
                  Terms of Service
                </Link>{" "}
                and acknowledge the{" "}
                <Link href="/privacy" className="text-[#FB7185] hover:underline font-semibold">
                  Privacy Policy
                </Link>
                .
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create WorkOnline Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer link to Login */}
      <div className="text-center text-xs text-[#9E8E93]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#FB7185] hover:underline font-semibold">
          Sign In here
        </Link>
      </div>
    </div>
  );
}
