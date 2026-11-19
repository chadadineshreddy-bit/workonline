import { createClient } from "./supabase/client";
import { isSupabaseConfigured } from "./supabase/status";

const LOCAL_STORAGE_KEY = "workonline_tool_history";

export interface ActivityItem {
  id: string;
  tool_slug: string;
  tool_name: string;
  used_at: string;
  status: string;
}

/**
 * Records a tool usage event into Supabase tool_history (or localStorage for guests).
 */
export async function logActivity(
  toolSlug: string,
  toolName: string,
  userId?: string | null,
  status: string = "completed"
): Promise<void> {
  if (typeof window === "undefined") return;

  const newItem: ActivityItem = {
    id: "act-" + Date.now(),
    tool_slug: toolSlug,
    tool_name: toolName,
    used_at: new Date().toISOString(),
    status,
  };

  // 1. Cache locally
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const history: ActivityItem[] = raw ? JSON.parse(raw) : [];
    const updated = [newItem, ...history.filter((h) => h.tool_slug !== toolSlug)].slice(0, 25);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  // 2. Persist to Supabase if authenticated
  if (userId && isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("tool_history").insert({
          user_id: userId,
          tool_slug: toolSlug,
          tool_name: toolName,
          status,
          used_at: newItem.used_at,
        });
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Retrieves the recent tool usage activities.
 */
export async function getRecentActivities(
  userId?: string | null,
  limit: number = 10
): Promise<ActivityItem[]> {
  if (typeof window === "undefined") return [];

  if (userId && isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("tool_history")
          .select("id, tool_slug, tool_name, used_at, status")
          .eq("user_id", userId)
          .order("used_at", { ascending: false })
          .limit(limit);

        if (!error && data && data.length > 0) {
          return data as ActivityItem[];
        }
      } catch {
        // fallback to local
      }
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw).slice(0, limit) : [];
  } catch {
    return [];
  }
}

/**
 * Clears activity history.
 */
export async function clearActivities(userId?: string | null): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }

  if (userId && isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("tool_history").delete().eq("user_id", userId);
      } catch {
        // ignore
      }
    }
  }
}
