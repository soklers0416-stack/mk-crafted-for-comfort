// Хранение выбранной ткани для товара (продакт-локальный выбор + корзина)
const KEY = "mk-product-fabric-v1";

type Store = Record<string, string>; // productId -> fabricId

function read(): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function write(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function getSelectedFabric(productId: string): string | null {
  return read()[productId] ?? null;
}

export function setSelectedFabric(productId: string, fabricId: string | null) {
  const s = read();
  if (fabricId) s[productId] = fabricId; else delete s[productId];
  write(s);
  window.dispatchEvent(new CustomEvent("mk-fabric-change", { detail: { productId, fabricId } }));
}

export function subscribeFabric(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener("mk-fabric-change", h);
  return () => window.removeEventListener("mk-fabric-change", h);
}
