/**
 * Checks whether Supabase environment variables are properly configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes("your-project.supabase.co") || anonKey.includes("your-anon-key")) return false;
  if (url.trim().length === 0 || anonKey.trim().length === 0) return false;

  return true;
}
