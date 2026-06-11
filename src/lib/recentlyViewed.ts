const KEY = "mk-recent-v1";
const EVT = "mk-recent-changed";
const MAX = 12;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function write(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); window.dispatchEvent(new Event(EVT)); } catch {}
}

export function getRecentlyViewed(): string[] { return read(); }

export function pushRecentlyViewed(id: string) {
  const arr = read().filter((x) => x !== id);
  arr.unshift(id);
  write(arr.slice(0, MAX));
}

export function subscribeRecent(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}
