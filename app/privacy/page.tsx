import React from "react";
import { ShieldCheck } from "lucide-react";
import { FloatingRedElements } from "@/components/ui/floating-red-elements";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen apple-canvas-bg relative overflow-hidden text-[#202124] pb-20">
      <div className="pt-8 pb-6 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative floating-glass-canvas p-8 sm:p-10 overflow-hidden">
            <FloatingRedElements variant="subtle" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/90 text-[#F04452] border border-red-200/80 mb-3 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F04452]" />
                <span>Privacy Policy</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#202124] tracking-tight leading-tight">
                WorkOnline Privacy & Security Standards
              </h1>
              <p className="mt-2 text-sm text-[#777777]">
                Last updated: November 2026 • Effective immediately
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        <div className="floating-glass-canvas p-8 sm:p-10 space-y-8 text-sm text-[#777777] leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#202124]">
              1. Client-Side Browser Processing
            </h2>
            <p>
              WorkOnline prioritizes on-device and in-browser execution. Whenever you use our client-side tools (such as PDF Merge, Image Compressor, CGPA Calculator, and Attendance Tracker), the calculation and document manipulation take place entirely within your browser&apos;s sandboxed memory.
            </p>
            <p>
              Your documents, images, grades, and personal data are not uploaded, copied, or stored on external servers for these operations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#202124]">
              2. Data We Do Not Collect
            </h2>
            <p>
              We do not inspect or extract content from files processed on WorkOnline. We never train generative AI models on your uploaded coursework, proprietary contracts, resumes, or financial invoices without your explicit written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#202124]">
              3. Cloud Services & Supabase Integration
            </h2>
            <p>
              When optional user authentication or cloud storage is enabled by connecting your Supabase project, all credentials and database sessions follow industry standard end-to-end HTTPS encryption, JWT token verification, and strict Row Level Security (RLS) policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#202124]">
              4. Contact Regarding Privacy
            </h2>
            <p>
              For any questions, data subject access inquiries, or compliance questions, please contact our security team at{" "}
              <a href="mailto:privacy@workonline.app" className="text-[#F04452] hover:underline font-bold">
                privacy@workonline.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
