import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/photo/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Bad path", { status: 400 });
        }
        // Use publishable key client — bucket has an anon SELECT policy,
        // so service role is not required (and may be unavailable on VPS).
        const { createClient } = await import("@supabase/supabase-js");
        const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) {
          return new Response("Supabase env not configured", { status: 500 });
        }
        const client = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });
        const { data, error } = await client.storage
          .from("product-photos")
          .download(path);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }
        const ext = path.split(".").pop()?.toLowerCase() ?? "";
        const mime =
          ext === "png" ? "image/png" :
          ext === "webp" ? "image/webp" :
          ext === "gif" ? "image/gif" :
          ext === "svg" ? "image/svg+xml" :
          "image/jpeg";
        const buf = await data.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
