import { getSupabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "media";

export async function uploadImage(file, userId) {
  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteImage(path) {
  const supabase = getSupabaseAdmin();
  await supabase.storage.from(BUCKET).remove([path]);
}