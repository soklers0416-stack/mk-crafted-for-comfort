// Простое локальное избранное (localStorage). Структура подготовлена для будущего
// подключения к БД: при появлении таблицы favorites достаточно подменить get/toggle/subscribe.

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
  if (i >= 0) {
    arr.splice(i, 1);
    write(arr);
    return false;
  }
  arr.push(id);
  write(arr);
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
