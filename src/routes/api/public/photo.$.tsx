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
        const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) {
          return new Response("Storage env not configured", { status: 500 });
        }

        try {
          // Private buckets cannot be used directly in <img>. Proxy through the
          // app and authenticate this storage request with the publishable key.
          const storageUrl = `${url.replace(/\/$/, "")}/storage/v1/object/product-photos/${encodeStoragePath(path)}`;
          const storageResponse = await fetch(storageUrl, {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
            },
          });

          if (!storageResponse.ok) {
            const message = storageResponse.status === 404 ? "Not found" : `Storage error ${storageResponse.status}`;
            return new Response(message, { status: storageResponse.status });
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
        } catch (error) {
          console.error("Photo proxy failed", error);
          return new Response("Photo proxy failed", { status: 502 });
        }
      },
    },
  },
});
