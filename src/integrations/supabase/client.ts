// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Fail fast with clear errors if env vars are missing
if (!url) throw new Error("VITE_SUPABASE_URL is not set");
if (!anon) throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY is not set");

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
