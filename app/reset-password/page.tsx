import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { FloatingRedElements } from "@/components/ui/floating-red-elements";

export const metadata: Metadata = {
  title: "Set New Password — WorkOnline",
  description: "Set a new password for your WorkOnline account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[85vh] apple-canvas-bg relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#202124]">
      <FloatingRedElements variant="subtle" />

      <ResetPasswordForm />
    </div>
  );
}
