// Избранное в localStorage + лайк-счётчик в БД через RPC increment_product_stat.
import { supabase } from "@/integrations/supabase/client";

const KEY = "mk-favorites-v1";
const EVT = "mk-favorites-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(EVT));
  } catch {}
}

export function getFavorites(): string[] {
  return read();
}

export function isFavorite(id: string): boolean {
  return read().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const arr = read();
  const i = arr.indexOf(id);
  const sb = supabase as any;
  if (i >= 0) {
    arr.splice(i, 1);
    write(arr);
    sb.rpc("increment_product_stat", { p_id: id, p_field: "likes", p_delta: -1 });
    return false;
  }
  arr.push(id);
  write(arr);
  sb.rpc("increment_product_stat", { p_id: id, p_field: "likes", p_delta: 1 });
  return true;
}

export function subscribeFavorites(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function incrementStat(id: string, field: "views" | "likes" | "cart_adds", delta = 1) {
  try {
    (supabase as any).rpc("increment_product_stat", { p_id: id, p_field: field, p_delta: delta });
  } catch {}
}
