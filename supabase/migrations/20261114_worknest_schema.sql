-- ==============================================================================
-- WORKNEST SAAS PLATFORM — COMPLETE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Module: User Authentication, Cloud Storage, & Personal Workspace
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLE: profiles
-- Stores user profile metadata linked to Supabase auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  workspace_preference TEXT DEFAULT 'both' CHECK (workspace_preference IN ('student', 'professional', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- TABLE: saved_files
-- Tracks uploaded and saved documents stored in Supabase Storage bucket 'worknest-user-files'
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- TABLE: favorites
-- Stores user's starred/bookmarked tools across the platform
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_tool_favorite UNIQUE(user_id, tool_slug)
);

-- ==============================================================================
-- TABLE: tool_history
-- Records chronological tool usage and document actions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tool_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- TABLE: saved_documents
-- Stores rich document content (Word docs, Resumes, Notes, Invoices, Letters)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.saved_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('word', 'resume', 'cover_letter', 'letter', 'invoice', 'notes', 'report')),
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- TABLE: user_preferences
-- Stores settings, theme preference, and workspace configuration
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  workspace_preference TEXT DEFAULT 'both' CHECK (workspace_preference IN ('student', 'professional', 'both')),
  settings JSONB DEFAULT '{}'::jsonb NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- TABLE: ai_usage
-- Tracks user AI tool request counts for rate limiting and billing analytics
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  request_count INT DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_saved_files_user ON public.saved_files(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_history_user ON public.tool_history(user_id, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_documents_user ON public.saved_documents(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON public.ai_usage(user_id, created_at DESC);

-- ==============================================================================
-- TRIGGER & FUNCTION: Automatically create profile on signup
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, workspace_preference)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'workspace_preference', 'both')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id, workspace_preference)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'workspace_preference', 'both')
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation: Users can only read, insert, update, or delete their own data.
-- ==============================================================================

-- 1. profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. saved_files RLS
ALTER TABLE public.saved_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_files_select_own"
  ON public.saved_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_files_insert_own"
  ON public.saved_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_files_update_own"
  ON public.saved_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "saved_files_delete_own"
  ON public.saved_files FOR DELETE
  USING (auth.uid() = user_id);

-- 3. favorites RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 4. tool_history RLS
ALTER TABLE public.tool_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tool_history_select_own"
  ON public.tool_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tool_history_insert_own"
  ON public.tool_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tool_history_delete_own"
  ON public.tool_history FOR DELETE
  USING (auth.uid() = user_id);

-- 5. saved_documents RLS
ALTER TABLE public.saved_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_documents_select_own"
  ON public.saved_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_documents_insert_own"
  ON public.saved_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_documents_update_own"
  ON public.saved_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "saved_documents_delete_own"
  ON public.saved_documents FOR DELETE
  USING (auth.uid() = user_id);

-- 6. user_preferences RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. ai_usage RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_select_own"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ai_usage_insert_own"
  ON public.ai_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION & POLICIES
-- Bucket: worknest-user-files (Private, user-isolated by folder path: <user_id>/<file>)
-- ==============================================================================

-- Create bucket if not exists (execute via Supabase dashboard or storage extension)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'worknest-user-files',
  'worknest-user-files',
  FALSE,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can only upload files to their own folder (<auth.uid()>/...)
CREATE POLICY "storage_user_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'worknest-user-files' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can only read/download files in their own folder
CREATE POLICY "storage_user_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'worknest-user-files' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Users can only delete files in their own folder
CREATE POLICY "storage_user_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'worknest-user-files' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
