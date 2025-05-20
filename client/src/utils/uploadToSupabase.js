import { supabase } from "./supabaseClient.js";

export async function uploadToSupabase(blob, path) {
  const { error } = await supabase.storage.from("mood-art").upload(path, blob, {
    upsert: true,
    contentType: blob.type,
    cacheControl: "3600",
  });

  if (error) throw error;

  // always returns a string; never undefined
  return supabase.storage.from("mood-art").getPublicUrl(path).data.publicUrl;
}
