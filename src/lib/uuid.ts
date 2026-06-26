// Safe UUID v4 generator. `crypto.randomUUID` only exists in secure contexts
// (HTTPS or localhost). On plain HTTP (e.g. http://<ip>) it is undefined and
// throws "crypto.randomUUID is not a function", which breaks file uploads.
export function uuid(): string {
  const c: Crypto | undefined = typeof crypto !== "undefined" ? crypto : undefined;
  if (c && typeof (c as Crypto & { randomUUID?: () => string }).randomUUID === "function") {
    return (c as Crypto & { randomUUID: () => string }).randomUUID();
  }
  // RFC4122 v4 fallback using getRandomValues when available, else Math.random.
  const bytes = new Uint8Array(16);
  if (c && typeof c.getRandomValues === "function") {
    c.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
}
