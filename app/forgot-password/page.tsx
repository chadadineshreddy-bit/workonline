import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { SupabaseStatusBanner } from "@/components/auth/supabase-status-banner";
import { FloatingRedElements } from "@/components/ui/floating-red-elements";

export const metadata: Metadata = {
  title: "Forgot Password — WorkOnline",
  description: "Reset your WorkOnline account password securely.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[85vh] apple-canvas-bg relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#202124]">
      <FloatingRedElements variant="subtle" />

      <div className="max-w-md mx-auto w-full mb-6 relative z-10">
        <SupabaseStatusBanner />
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
