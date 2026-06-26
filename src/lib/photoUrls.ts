const PHOTO_PROXY_PREFIX = "/api/public/photo/";

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

export function getStoragePathFromPhotoUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw || raw.startsWith("data:")) return null;

  if (raw.startsWith(PHOTO_PROXY_PREFIX)) {
    return decodeURIComponent(raw.slice(PHOTO_PROXY_PREFIX.length).split(/[?#]/)[0]);
  }

  const storageMatch = raw.match(/\/storage\/v1\/object\/(?:public\/|authenticated\/|sign\/)?product-photos\/([^?#]+)/);
  if (storageMatch?.[1]) {
    return decodeURIComponent(storageMatch[1]);
  }

  if (!raw.startsWith("http") && !raw.startsWith("/") && /\.(jpe?g|png|webp|gif|svg)$/i.test(raw)) {
    return raw;
  }

  return null;
}

export function normalizePhotoUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;
  if (raw.startsWith(PHOTO_PROXY_PREFIX) || raw.startsWith("/assets/") || raw.startsWith("/seed/") || raw.startsWith("data:")) {
    return raw;
  }

  const path = getStoragePathFromPhotoUrl(raw);
  if (path) return `${PHOTO_PROXY_PREFIX}${encodePath(path)}`;
  return raw;
}