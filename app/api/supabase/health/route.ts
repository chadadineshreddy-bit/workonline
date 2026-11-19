import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/status";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        status: "unconfigured",
        message:
          "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are either commented out or contain placeholder values in .env.local",
      },
      { status: 200 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    // 1. Safe Auth API Health Check
    const authHealthRes = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        apikey: anonKey,
      },
      cache: "no-store",
    });

    if (!authHealthRes.ok) {
      return NextResponse.json(
        {
          configured: true,
          status: "auth_health_failed",
          statusCode: authHealthRes.status,
          message:
            "Could not reach Supabase Auth endpoint. Please check if your Project URL and Publishable/Anon Key are valid.",
        },
        { status: 502 }
      );
    }

    // 2. Safe Database Query Check
    const supabase = createServerSupabaseClient();
    let databaseStatus = "unknown";
    let databaseMessage = "";

    if (supabase) {
      const { error: dbError } = await supabase
        .from("profiles")
        .select("id")
        .limit(1);

      if (!dbError) {
        databaseStatus = "connected";
        databaseMessage = "Database schema (profiles table) verified successfully.";
      } else if (dbError.code === "PGRST204" || dbError.code === "PGRST205" || dbError.code === "42P01") {
        // Table not found in schema cache
        databaseStatus = "schema_pending";
        databaseMessage =
          "Supabase connected successfully, but database tables (profiles) have not been created yet. Run 'supabase/migrations/20261114_worknest_schema.sql' in the Supabase SQL Editor.";
      } else {
        databaseStatus = "connected_with_notice";
        databaseMessage = dbError.message;
      }
    }

    return NextResponse.json({
      configured: true,
      status: "connected",
      projectUrl: supabaseUrl.replace(/^(https?:\/\/[a-z0-9-]+)\..*$/i, "$1.supabase.co"),
      authService: "healthy",
      database: {
        status: databaseStatus,
        message: databaseMessage,
      },
      message: "Supabase connection test succeeded.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        configured: true,
        status: "network_error",
        message: error.message || "Failed to connect to Supabase host.",
      },
      { status: 500 }
    );
  }
}
