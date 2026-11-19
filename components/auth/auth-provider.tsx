"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/status";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  workspace_preference: "student" | "professional" | "both";
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateWorkspacePreference: (preference: "student" | "professional" | "both") => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isConfigured: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  updateWorkspacePreference: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else if (error && error.code === "PGRST116") {
        // Profile row doesn't exist yet, fallback to user metadata
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const fallbackProfile: UserProfile = {
            id: userId,
            full_name: userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0] || null,
            avatar_url: userData.user.user_metadata?.avatar_url || null,
            workspace_preference: (userData.user.user_metadata?.workspace_preference as any) || "both",
          };
          setProfile(fallbackProfile);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (!configured) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then((response: { data: { session: Session | null } }) => {
      const currentSession = response?.data?.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, newSession: Session | null) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    window.location.href = "/login";
  };

  const updateWorkspacePreference = async (preference: "student" | "professional" | "both") => {
    if (!user) return;
    const supabase = createClient();
    if (!supabase) return;

    try {
      await supabase
        .from("profiles")
        .update({ workspace_preference: preference, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      setProfile((prev) => (prev ? { ...prev, workspace_preference: preference } : null));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured,
        signOut,
        refreshProfile,
        updateWorkspacePreference,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
