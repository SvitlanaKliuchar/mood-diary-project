import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// automatically create anonymous session if none exists
(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Anonymous session creation failed:", error.message);
    } else {
      console.log("Anonymous session created");
    }
  } else {
    console.log("Supabase session active");
  }
})();
