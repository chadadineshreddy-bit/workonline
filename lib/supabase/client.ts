import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "./status";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Creates or retrieves a singleton Supabase browser client for client components.
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}
