// Хранение выбранной ткани и цвета для товара
const KEY = "mk-product-fabric-v1";
const COLOR_KEY = "mk-product-fabric-color-v1";

type Store = Record<string, string>;

function read(key: string): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function write(key: string, s: Store) {
  try { localStorage.setItem(key, JSON.stringify(s)); } catch {}
}

export function getSelectedFabric(productId: string): string | null {
  return read(KEY)[productId] ?? null;
}

export function setSelectedFabric(productId: string, fabricId: string | null, colorId: string | null = null) {
  const s = read(KEY);
  if (fabricId) s[productId] = fabricId; else delete s[productId];
  write(KEY, s);
  // Сбрасываем/обновляем цвет вместе с тканью
  const c = read(COLOR_KEY);
  if (fabricId && colorId) c[productId] = colorId; else delete c[productId];
  write(COLOR_KEY, c);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mk-fabric-change", { detail: { productId, fabricId, colorId } }));
  }
}

export function getSelectedFabricColor(productId: string): string | null {
  return read(COLOR_KEY)[productId] ?? null;
}

export function setSelectedFabricColor(productId: string, colorId: string | null) {
  const c = read(COLOR_KEY);
  if (colorId) c[productId] = colorId; else delete c[productId];
  write(COLOR_KEY, c);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mk-fabric-change", { detail: { productId, colorId } }));
  }
}

export function subscribeFabric(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const h = () => cb();
  window.addEventListener("mk-fabric-change", h);
  return () => window.removeEventListener("mk-fabric-change", h);
}
