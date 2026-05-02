// Re-export the SSR-aware browser client as the default supabase instance.
// This ensures all pages share the same auth session.
export { supabase } from "./supabase/client";
