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

export const Route = createFileRoute("/api/public/photo/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = cleanStoragePath((params as { _splat?: string })._splat ?? "");
        if (!path) {
          return new Response("Bad path", { status: 400 });
        }
        const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const keys = [
          publishableKey,
          // Some self-hosted setups use new non-JWT service keys. Storage's
          // object endpoint rejects those as Bearer tokens with HTTP 400, so
          // only use a service key here when it is an old JWT-shaped key.
          serviceKey && serviceKey.split(".").length === 3 ? serviceKey : null,
        ].filter((key): key is string => Boolean(key));
        if (!url || keys.length === 0) {
          return new Response("Storage env not configured", { status: 500 });
        }

        try {
          const storageUrl = `${url.replace(/\/$/, "")}/storage/v1/object/product-photos/${encodeStoragePath(path)}`;
          let lastStatus = 502;
          let lastBody = "Storage request failed";

          for (const key of keys) {
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
              lastBody = storageResponse.status === 404 ? "Not found" : `Storage error ${storageResponse.status}`;
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
