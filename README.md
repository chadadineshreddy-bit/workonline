# WorkNest — One platform. Every task. Simplified.

> **WorkNest** is an enterprise-grade, all-in-one SaaS productivity platform built for students, freelancers, IT professionals, and enterprise knowledge workers. It unifies client-side PDF processing, online document editors, academic grade calculators, workplace utilities, and Google Gemini AI assistants into a single modern web application.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Postgres-3ecf8e?logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8e75ff?logo=google)](https://aistudio.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Key Modules & Feature Highlights

### 1. 📄 Functional PDF Processing Engine
- **Client-Side Privacy**: Runs locally in browser memory using `pdf-lib` and `pdfjs-dist`. Zero permanent cloud storage of private files.
- **Merge PDF** (`/tools/merge-pdf`): Multi-file drag-and-drop merging with sequence controls.
- **Split PDF** (`/tools/split-pdf`): Thumbnail preview, custom range syntax (`1-3, 5`), or burst to ZIP archive.
- **Compress PDF** (`/tools/compress-pdf`): Object stream compression with real percentage reduction reporting.
- **PDF to JPG & JPG to PDF** (`/tools/pdf-to-jpg`, `/tools/jpg-to-pdf`): High-DPI canvas rendering and batch downloads.
- **Page Operations**: Rotate, delete, extract, and reorder PDF pages visually with instant preview.
- **PDF Page Preview Reader** (`/tools/pdf-preview`): Zoom (50%-250%), sidebar thumbnails drawer, and page jumps.

### 2. 📝 Document Studio & Creators
- **Online Word Editor** (`/documents/editor`): Rich-text editing with bold, italic, headings, lists, tables, and alignment.
- **DOCX Import & Export**: Converts DOCX to HTML via `mammoth` and compiles documents to native Word format via `docx`.
- **ATS-Friendly Resume Builder** (`/documents/resume-builder`): Real-time preview, multiple layouts, and clean PDF export.
- **Invoice Generator** (`/documents/invoice-generator`): Multi-currency support, auto-tax calculations, and professional invoices.
- **Cover Letter & Business Letter Generators** (`/documents/cover-letter`, `/documents/letter-generator`): Pre-built executive templates.
- **Quick Notes & Drafts** (`/documents/notes`): Client-cached markdown and rich notes.

### 3. 🎓 Student Productivity Hub (`/student-zone`)
- **CGPA & SGPA Calculators**: Supports 10-point and 4.0 scales, AICTE/CBSE (×9.5), VTU Karnataka, and Mumbai University conversion formulas.
- **Attendance & Bunk Margin Tracker**: Calculates safe bunkable classes or required attendances to reach target percentages (e.g., 75%, 80%, 85%).
- **Revision Study Planner**: Generates personalized weekly timetables based on daily available hours.
- **Assignment Tracker**: Priority-based assignment deadlines and completion status.
- **Active-Recall Flashcards & Quiz Generator**: Spaced-repetition card decks and self-assessment test suites.
- **Focus Pomodoro Timer & Exam Countdown**: Interval study timer and countdown tracker.

### 4. 💼 Employee & Workplace Hub (`/work-zone`)
- **Professional Email Drafter** (`/work-zone/email-writer`): Generates workplace emails with adjustable tone (Formal, Persuasive, Concise).
- **Meeting Minutes Generator** (`/work-zone/meeting-minutes`): Converts agendas, attendees, and discussions into action-item minutes.
- **Excel & Spreadsheet Assistant** (`/work-zone/excel-tools`): Formula library covering XLOOKUP, INDEX/MATCH, SUMIFS, IFS with syntax and examples.
- **CSV & Data Utilities** (`/work-zone/csv-tools`): Format, preview, filter, and convert CSV files.
- **Daily Work Planner & Task Board** (`/work-zone/task-manager`, `/work-zone/work-planner`): Kanban boards and daily schedule blocks.
- **Digital Signature Tool** (`/work-zone/signature`): Draw or type transparent PNG digital signatures for document signing.
- **QR Code Generator** (`/work-zone/qr-generator`): High-resolution QR codes with color customization and PNG/SVG download.

### 5. 🤖 AI Workspace (`/ai-workspace`)
- **Independent Provider Architecture**: Modular backend powered by Google Gemini (`gemini-1.5-flash`), with pluggable providers.
- **AI PDF Assistant** (`/ai-workspace/pdf-assistant`): Ask questions about uploaded PDFs using grounded context and page citations.
- **AI Document Summarizer** (`/ai-workspace/summarizer`): TL;DR, key takeaways, and action items from lengthy text.
- **AI Notes & Study Guide Generator** (`/ai-workspace/notes-generator`): Structured revision guides from raw lecture notes.
- **AI Quiz & Flashcard Makers** (`/ai-workspace/quiz-generator`, `/ai-workspace/flashcard-generator`): Generates structured assessment decks.
- **AI Resume Assistant** (`/ai-workspace/resume-assistant`): ATS score analysis, bullet-point enhancers, and tailored job recommendations.
- **AI Grammar Checker & Text Rewriter** (`/ai-workspace/grammar-checker`, `/ai-workspace/text-rewriter`): Real-time sentence polish and tone transformation.

### 6. 🔐 Authentication, Supabase Backend & Workspace (`/workspace`)
- **Supabase Authentication**: Secure session cookies via `@supabase/ssr` with server-side validation.
- **Protected Routes**: Next.js middleware guards `/workspace`, `/profile`, and `/settings`.
- **PostgreSQL Database with Row Level Security (RLS)**: 7 tables with strict user isolation (`auth.uid() = user_id`).
- **Private Cloud Storage**: Bucket `worknest-user-files` with folder-isolated RLS (`auth.uid() = foldername`).
- **Personal Workspace Dashboard**: Starred favorites, document history, quick launchers, and profile management.
- **Dual-Mode Persistence**: Fully functional offline with `localStorage` for guests; seamlessly syncs with Supabase when signed in.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14.2](https://nextjs.org/) (App Router, Server Actions, Route Handlers) |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) (Strict type checking) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) with custom design system tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **PDF Manipulation** | [`pdf-lib`](https://pdf-lib.js.org/) & [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) |
| **Document Processing** | [`docx`](https://docx.js.org/) & [`mammoth`](https://github.com/mwilliamson/mammoth.js) |
| **Spreadsheets & Zip** | [`xlsx`](https://sheetjs.com/) & [`jszip`](https://stuk.github.io/jszip/) |
| **Authentication & Database** | [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`) |
| **AI Intelligence** | [Google Gemini API](https://aistudio.google.com/) (`@google/generative-ai`) |
| **QR Code Engine** | [`qrcode`](https://github.com/soldair/node-qrcode) |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.18+ (Node.js 20 or 22 recommended)
- npm, pnpm, or yarn

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/worknest.git
cd worknest
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the required credentials in `.env.local`:
```env
# Google Gemini AI Key (Get free key at: https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
AI_MODEL=gemini-1.5-flash

# Supabase Configuration (Get free project at: https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note**: WorkNest functions out of the box even without API keys! All PDF tools, document creators, and student/work utilities run locally in the browser. AI and cloud sync activate automatically once credentials are supplied.

### 5. Run Database Migrations (Supabase)
In your Supabase project dashboard:
1. Navigate to the **SQL Editor**.
2. Open and execute the migration file:
   [`supabase/migrations/20261114_worknest_schema.sql`](supabase/migrations/20261114_worknest_schema.sql)
3. This sets up all 7 tables, Row Level Security policies, user signup triggers, and the private storage bucket.

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing, Quality & Production Builds

### Code Quality & Linting
Run the ESLint suite:
```bash
npm run lint
```

### Production Build Verification
Compile and optimize all 113 routes:
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

---

## 🔒 Security Architecture

1. **Client-Side Document Isolation**: File uploads for PDF and document manipulation never leave the client's browser memory unless explicitly saved to Supabase by an authenticated user.
2. **File Signature Validation**: Binary magic number checking (`%PDF-`, `PK\x03\x04`) protects against extension spoofing and corrupted uploads.
3. **Row Level Security (RLS)**: Enforced across all PostgreSQL tables. Users cannot read, write, or query any records outside their `auth.uid()`.
4. **Credential Isolation**: Service keys and AI API keys are processed server-side only. `GEMINI_API_KEY` is never bundled into client JavaScript.
5. **No Private Indexing**: Public pages include complete meta/sitemaps; private workspaces (`/workspace`, `/profile`, `/settings`, `/api/`) are explicitly excluded via `robots.ts`.

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables in the Vercel project settings:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (Set to your Vercel deployment URL)
4. Click **Deploy**. Vercel will build and launch your instance with edge caching and serverless API execution.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
