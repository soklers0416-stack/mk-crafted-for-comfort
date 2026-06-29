import { createFileRoute } from "@tanstack/react-router";

// Публичный endpoint: возвращает тип backend и безопасные поля Supabase-конфига.
// НИКОГДА не возвращает service role key, db password, publishable key целиком.
export const Route = createFileRoute("/api/public/backend-info")({
  server: {
    handlers: {
      GET: async () => {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
        const projectId =
          process.env.SUPABASE_PROJECT_ID ||
          process.env.VITE_SUPABASE_PROJECT_ID ||
          (supabaseUrl.match(/^https?:\/\/([^.]+)\./)?.[1] ?? "");

        const publishableKey =
          process.env.SUPABASE_PUBLISHABLE_KEY ||
          process.env.SUPABASE_ANON_KEY ||
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          "";

        // Маска для публикабельного ключа: первые 6 и последние 4 символа.
        const maskKey = (k: string) =>
          k ? `${k.slice(0, 6)}...${k.slice(-4)} (len=${k.length})` : null;

        // Признак Lovable Cloud: наличие LOVABLE_API_KEY и SUPABASE_DB_URL в окружении.
        const isLovableCloud =
          !!process.env.LOVABLE_API_KEY || !!process.env.SUPABASE_DB_URL;

        return Response.json(
          {
            backend: isLovableCloud ? "lovable-cloud" : "external-supabase",
            managed: isLovableCloud,
            supabase: {
              url: supabaseUrl || null,
              projectId: projectId || null,
              publishableKeyMasked: maskKey(publishableKey),
              hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
              hasDbUrl: !!process.env.SUPABASE_DB_URL,
            },
            notes: {
              organization:
                "Недоступно для Lovable Cloud — управляется платформой Lovable.",
              region: "Недоступно для Lovable Cloud — управляется платформой Lovable.",
              owner: isLovableCloud
                ? "Lovable Cloud workspace (не личный Supabase аккаунт)."
                : "Внешний Supabase проект.",
            },
            checkedAt: new Date().toISOString(),
          },
          {
            headers: {
              "cache-control": "no-store",
              "content-type": "application/json; charset=utf-8",
            },
          },
        );
      },
    },
  },
});
