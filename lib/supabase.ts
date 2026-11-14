import { createClient } from "@supabase/supabase-js";

export const BUCKET = "cafe-uploads";

// Server-only. Never import this file from a client component.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing");
  return createClient(url, key, { auth: { persistSession: false } });
}