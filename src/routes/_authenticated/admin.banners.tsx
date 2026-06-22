import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Upload, X, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadPhoto } from "@/lib/uploadPhoto";
import {
  BANNER_REGISTRY,
  findBannerRow,
  siteBannersQuery,
  type BannerPlacement,
  type BannerRow,
  type BannerSettings,
} from "@/lib/siteBanners";
import { SiteBanner } from "@/components/SiteBanner";

const sb = supabase as any;

export const Route = createFileRoute("/_authenticated/admin/banners")({
  component: BannersAdmin,
});

type Draft = {
  title: string;
  subtitle: string;
  body: string;
  image_url: string | null;
  button_text: string;
  button_link: string;
  is_visible: boolean;
  settings: BannerSettings;
};

function rowToDraft(p: BannerPlacement, row?: BannerRow): Draft {
  const d = p.defaults;
  return {
    title: row?.title ?? d.title ?? "",
    subtitle: row?.subtitle ?? d.eyebrow ?? "",
    body: row?.body ?? d.body ?? "",
    image_url: row?.image_url ?? null,
    button_text: row?.button_text ?? d.button_text ?? "",
    button_link: row?.button_link ?? d.button_link ?? "",
    is_visible: row?.is_visible ?? true,
    settings: {
      text_align: row?.settings.text_align ?? d.text_align ?? "left",
      overlay: row?.settings.overlay ?? (row?.image_url ? 0.35 : 0),
      bg_color: row?.settings.bg_color ?? d.bg_color ?? "",
      button_enabled:
        row?.settings.button_enabled ?? d.button_enabled ?? Boolean(d.button_text && d.button_link),
    },
  };
}

function BannersAdmin() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery(siteBannersQuery);
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(() => {
    const byPage = new Map<string, BannerPlacement[]>();
    for (const p of BANNER_REGISTRY) {
      if (!byPage.has(p.page_key)) byPage.set(p.page_key, []);
      byPage.get(p.page_key)!.push(p);
    }
    return Array.from(byPage.entries());
  }, []);

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-bold">Баннеры сайта</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Здесь автоматически отображаются все баннеры, которые используются на страницах сайта. Можно загрузить фон,
          изменить тексты и кнопку, настроить выравнивание и затемнение. Изменения сразу видны на сайте.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {groups.map(([pageKey, items]) => (
          <section key={pageKey} className="rounded-2xl border border-border/60 bg-card">
            <header className="border-b border-border/60 px-5 py-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {items[0].page_label} <span className="font-normal lowercase text-muted-foreground/70">/{pageKey}</span>
              </h2>
            </header>
            <div className="divide-y divide-border/60">
              {items.map((p) => {
                const row = findBannerRow(rows, p);
                const open = openId === p.id;
                return (
                  <BannerCard
                    key={p.id}
                    placement={p}
                    row={row}
                    open={open}
                    onToggle={() => setOpenId(open ? null : p.id)}
                    onSaved={() => qc.invalidateQueries({ queryKey: ["site_banners"] })}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function BannerCard({
  placement,
  row,
  open,
  onToggle,
  onSaved,
}: {
  placement: BannerPlacement;
  row?: BannerRow;
  open: boolean;
  onToggle: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => rowToDraft(placement, row));
  const [uploading, setUploading] = useState(false);
  useEffect(() => setDraft(rowToDraft(placement, row)), [row, placement]);

  const upsert = useMutation({
    mutationFn: async (next: Draft) => {
      const payload = {
        page_key: placement.page_key,
        system_ref: placement.ref,
        kind: "hero-banner",
        title: next.title || null,
        subtitle: next.subtitle || null,
        body: next.body || null,
        image_url: next.image_url || null,
        button_text: next.button_text || null,
        button_link: next.button_link || null,
        is_visible: next.is_visible,
        settings: next.settings,
      };
      if (row) {
        const { error } = await sb.from("page_blocks").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("page_blocks").insert({ ...payload, sort_order: 0 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Сохранено");
      onSaved();
    },
    onError: (e: any) => toast.error(e.message ?? "Ошибка"),
  });

  const toggleVisible = () => {
    const next = { ...draft, is_visible: !draft.is_visible };
    setDraft(next);
    upsert.mutate(next);
  };

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(f);
      const next = { ...draft, image_url: url };
      setDraft(next);
      upsert.mutate(next);
    } catch (err: any) {
      toast.error(err.message ?? "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  }

  function patchSettings(p: Partial<BannerSettings>) {
    setDraft((d) => ({ ...d, settings: { ...d.settings, ...p } }));
  }

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <div>
            <div className="font-medium">{placement.placement_label}</div>
            <div className="text-xs text-muted-foreground">{draft.title || "(без заголовка)"}</div>
          </div>
        </button>
        {!row && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">по умолчанию</span>}
        <button
          onClick={toggleVisible}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs"
        >
          {draft.is_visible ? (
            <>
              <Eye className="h-3.5 w-3.5" /> Виден
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" /> Скрыт
            </>
          )}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            <div className="grid gap-2 md:grid-cols-2">
              <Field label="Заголовок">
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </Field>
              <Field label="Подзаголовок (eyebrow)">
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={draft.subtitle}
                  onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Описание">
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                rows={3}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
            </Field>

            <Field label="Фоновое изображение">
              <div className="flex items-center gap-3">
                {draft.image_url ? (
                  <div className="relative h-20 w-32 overflow-hidden rounded-lg bg-surface-muted">
                    <img src={draft.image_url} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => setDraft({ ...draft, image_url: null })}
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="grid h-20 w-32 place-items-center rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground">
                    нет фото
                  </div>
                )}
                <label className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 text-xs">
                  <Upload className="h-3.5 w-3.5" /> {uploading ? "..." : "Загрузить"}
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Изображение растягивается по баннеру с центрированием — не обрезается по краям. Подойдёт горизонтальное
                фото 2000×800 и больше.
              </p>
            </Field>

            <div className="grid gap-2 md:grid-cols-2">
              <Field label="Текст кнопки">
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={draft.button_text}
                  onChange={(e) => setDraft({ ...draft, button_text: e.target.value })}
                />
              </Field>
              <Field label="Ссылка кнопки">
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="/catalog или https://..."
                  value={draft.button_link}
                  onChange={(e) => setDraft({ ...draft, button_link: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Кнопка">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(draft.settings.button_enabled)}
                  onChange={(e) => patchSettings({ button_enabled: e.target.checked })}
                />
                Показывать кнопку
              </label>
            </Field>

            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Выравнивание текста">
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => patchSettings({ text_align: a })}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs ${
                        (draft.settings.text_align ?? "left") === a
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      {a === "left" ? "Слева" : a === "center" ? "Центр" : "Справа"}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={`Затемнение фото: ${Math.round((draft.settings.overlay ?? 0) * 100)}%`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={draft.settings.overlay ?? 0}
                  onChange={(e) => patchSettings({ overlay: Number(e.target.value) })}
                  className="w-full"
                />
              </Field>
              <Field label="Фон без картинки (CSS)">
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="напр. linear-gradient(...)"
                  value={draft.settings.bg_color ?? ""}
                  onChange={(e) => patchSettings({ bg_color: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => upsert.mutate(draft)}
                disabled={upsert.isPending}
                className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {upsert.isPending ? "Сохранение…" : "Сохранить"}
              </button>
              <button
                onClick={() => setDraft(rowToDraft(placement, row))}
                className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm"
              >
                Отмена
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Предпросмотр
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              {/* Локальный предпросмотр: рендерим SiteBanner с теми же данными через временный override */}
              <PreviewBanner draft={draft} placement={placement} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

/** Лёгкий предпросмотр, не зависит от данных в БД. */
function PreviewBanner({ draft, placement }: { draft: Draft; placement: BannerPlacement }) {
  // Подменяем SiteBanner простым inline-рендером с теми же стилями, чтобы не дожидаться записи.
  void placement;
  const align = draft.settings.text_align ?? "left";
  const alignText = align === "center" ? "text-center items-center" : align === "right" ? "text-right items-end" : "text-left items-start";
  const alignWrap = align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
  const hasImage = Boolean(draft.image_url);
  const overlay = draft.settings.overlay ?? (hasImage ? 0.35 : 0);
  const bgStyle: React.CSSProperties = hasImage
    ? { backgroundImage: `url("${draft.image_url}")`, backgroundSize: "cover", backgroundPosition: "center" }
    : draft.settings.bg_color
      ? { background: draft.settings.bg_color }
      : {};
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${!hasImage && !draft.settings.bg_color ? "bg-gradient-to-br from-primary/10 via-primary/5 to-background" : ""}`}
      style={bgStyle}
    >
      {hasImage && overlay > 0 && <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} />}
      <div className={`relative z-10 flex ${alignWrap} min-h-[180px] px-5 py-6`}>
        <div className={`flex flex-col gap-2 ${alignText} ${hasImage ? "text-white" : ""}`}>
          {draft.subtitle && <p className={`text-[10px] font-medium uppercase tracking-wider ${hasImage ? "text-white/90" : "text-primary"}`}>{draft.subtitle}</p>}
          {draft.title && <h3 className="font-display text-xl font-bold">{draft.title}</h3>}
          {draft.body && <p className={`text-xs ${hasImage ? "text-white/90" : "text-muted-foreground"}`}>{draft.body}</p>}
          {draft.settings.button_enabled && draft.button_text && (
            <span className={`mt-1 inline-flex h-8 items-center rounded-full px-3 text-xs font-medium ${hasImage ? "bg-white text-foreground" : "bg-primary text-primary-foreground"}`}>
              {draft.button_text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Чтобы линтер не ругался на неиспользуемый импорт (компонент SiteBanner упоминается в JSDoc и используется типизацией):
void SiteBanner;
