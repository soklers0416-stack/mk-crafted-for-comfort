import { createFileRoute } from "@tanstack/react-router";

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

function cleanStoragePath(path: string) {
  const clean = path.trim().replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes("\\") || /[\u0000-\u001f]/.test(clean)) {
    return null;
  }
  return clean;
}

function encodeStoragePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function unique<T>(items: Array<T | null | undefined | false>): T[] {
  return Array.from(new Set(items.filter(Boolean) as T[]));
}

function getStorageTargets() {
  // In production the browser uploads with VITE_* values baked into the client
  // bundle. The photo proxy is a server route, so process.env.VITE_* can be
  // missing in the final Docker runtime image. Read import.meta.env first so the
  // server bundle uses the exact same Supabase project/key pair as the browser.
  // Otherwise upload succeeds, the path is saved in products, but the proxy reads
  // from a different Supabase project and Storage returns 400 (usually bucket not
  // found), making every old and new product image look broken.
  const urls = unique([
    import.meta.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_URL,
  ]).map((url) => url.replace(/\/$/, ""));

  const keys = unique([
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_ANON_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ]);

  return urls.flatMap((url) => keys.map((key) => ({ url, key })));
}

export const Route = createFileRoute("/api/public/photo/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = cleanStoragePath((params as { _splat?: string })._splat ?? "");
        if (!path) {
          return new Response("Bad path", { status: 400 });
        }
        const targets = getStorageTargets();
        if (targets.length === 0) {
          return new Response("Storage env not configured", { status: 500 });
        }

        try {
          const encodedPath = encodeStoragePath(path);
          let lastStatus = 502;
          let lastBody = "Storage request failed";

          for (const { url, key } of targets) {
            const storageUrl = `${url}/storage/v1/object/product-photos/${encodedPath}`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            let storageResponse: Response;
            try {
              storageResponse = await fetch(storageUrl, {
                headers: {
                  apikey: key,
                  Authorization: `Bearer ${key}`,
                },
                signal: controller.signal,
              });
            } finally {
              clearTimeout(timeout);
            }

            if (!storageResponse.ok) {
              lastStatus = storageResponse.status;
              const details = await storageResponse.text().catch(() => "");
              lastBody = storageResponse.status === 404 ? "Not found" : `Storage error ${storageResponse.status}`;
              console.warn("Product photo storage read failed", {
                status: storageResponse.status,
                supabaseHost: (() => { try { return new URL(url).host; } catch { return "invalid-url"; } })(),
                path,
                details: details.slice(0, 300),
              });
              continue;
            }

            const ext = path.split(".").pop()?.toLowerCase() ?? "";
            const mime = storageResponse.headers.get("content-type") || IMAGE_MIME_BY_EXT[ext] || "application/octet-stream";
            const body = await storageResponse.arrayBuffer();
            return new Response(body, {
              status: 200,
              headers: {
                "Content-Type": mime,
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          }

          return new Response(lastBody, { status: lastStatus });
        } catch (error) {
          console.error("Photo proxy failed", error);
          return new Response("Photo proxy failed", { status: 502 });
        }
      },
    },
  },
});
