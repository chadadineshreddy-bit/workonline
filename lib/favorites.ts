import { createClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/status";

const LOCAL_STORAGE_KEY = "workonline_favorites";

/**
 * Retrieves the user's favorite tool slugs from Supabase (or localStorage for guests).
 */
export async function getFavorites(userId?: string | null): Promise<string[]> {
  if (typeof window === "undefined") return [];

  if (userId && isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("tool_slug")
          .eq("user_id", userId);

        if (!error && data) {
          const cloudSlugs = (data as Array<{ tool_slug: string }>).map((r) => r.tool_slug);
          // Sync cloud slugs to local cache
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudSlugs));
          return cloudSlugs;
        }
      } catch {
        // Fallback to local
      }
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Toggles a tool slug as favorite (adds if absent, removes if present).
 * Returns true if the tool is now favorited, false if unfavorited.
 */
export async function toggleFavorite(
  toolSlug: string,
  userId?: string | null
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  let currentFavs: string[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    currentFavs = raw ? JSON.parse(raw) : [];
  } catch {
    currentFavs = [];
  }

  const isFav = currentFavs.includes(toolSlug);
  const updated = isFav
    ? currentFavs.filter((s) => s !== toolSlug)
    : [...currentFavs, toolSlug];

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  if (userId && isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        if (isFav) {
          await supabase
            .from("favorites")
            .delete()
            .eq("user_id", userId)
            .eq("tool_slug", toolSlug);
        } else {
          await supabase
            .from("favorites")
            .insert({ user_id: userId, tool_slug: toolSlug });
        }
      } catch {
        // ignore
      }
    }
  }

  return !isFav;
}
