import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://workonline.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#FFFFFF" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WorkOnline — Everything You Need to Work Smarter, 100% Free.",
    template: "%s | WorkOnline",
  },
  description:
    "Convert, edit, compress, organize, and manage your documents with powerful online tools — all in one place.",
  keywords: [
    "WorkOnline",
    "productivity platform",
    "PDF tools",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "online document editor",
    "CGPA calculator",
    "attendance calculator",
    "study timetable planner",
    "resume builder",
    "invoice generator",
    "meeting minutes generator",
    "AI PDF assistant",
    "student productivity",
    "work productivity"
  ],
  authors: [{ name: "WorkOnline Team", url: siteUrl }],
  creator: "WorkOnline",
  publisher: "WorkOnline Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "WorkOnline",
    title: "WorkOnline — Everything You Need to Work Smarter, 100% Free.",
    description:
      "Convert, edit, compress, organize, and manage your documents with powerful online tools — all in one place.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WorkOnline — Universal Productivity Workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkOnline — Everything You Need to Work Smarter, 100% Free.",
    description:
      "Convert, edit, compress, organize, and manage your documents with powerful online tools — all in one place.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: siteUrl,
  },
};

// JSON-LD Structured Data Schema for Organization and WebSite
const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "WorkOnline",
      description: "Everything You Need to Work Smarter, 100% Free.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/tools?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "WorkOnline Inc.",
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
      sameAs: [
        "https://github.com/workonline",
        "https://twitter.com/workonlineapp",
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "WorkOnline Productivity Suite",
      operatingSystem: "Web-based (Universal)",
      applicationCategory: "ProductivityApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${manrope.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('workonline-theme');
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="saas-canvas-bg min-h-screen flex flex-col font-sans antialiased selection:bg-[#DC2626] selection:text-white">
        {/* Accessible Skip-to-Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#DC2626] focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <ThemeProvider>
            <AppShell>
              {children}
            </AppShell>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
