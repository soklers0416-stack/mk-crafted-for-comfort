import { supabase } from "@/integrations/supabase/client";

const ALLOWED = ["jpg", "jpeg", "png", "webp"];

export async function uploadPhoto(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  if (!ALLOWED.includes(ext)) {
    throw new Error(`Поддерживаются: ${ALLOWED.join(", ")}`);
  }
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-photos")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return `/api/public/photo/${path}`;
}
