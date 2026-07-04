// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

let rawUrl = process.env.SUPABASE_URL || "";

// Defensively clean the URL to prevent "Invalid path specified in request" errors:
rawUrl = rawUrl.replace(/\/+$/, "");        // 1. Strip any trailing slashes (e.g. .co/ -> .co)
rawUrl = rawUrl.replace(/\/rest\/v1$/, ""); // 2. Strip /rest/v1 if accidentally copied

export const supabase = createClient(
  rawUrl,
  process.env.SUPABASE_ANON_KEY
);
