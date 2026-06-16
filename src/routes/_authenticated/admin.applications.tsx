import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUS_LABELS, STATUS_OPTIONS, STATUS_COLORS,
  formTypeLabel, fieldLabel, type ApplicationStatus,
} from "@/lib/forms";
import { exportToSheets } from "@/lib/applications.functions";
import { toast } from "sonner";
import { Download, Trash2, ChevronDown, ChevronRight, Cloud } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  component: AdminApplications,
});

type AppRow = {
  id: string;
  form_key: string;
  title: string;
  name: string;
  phone: string;
  email: string;
  data: Record<string, any>;
  status: string;
  created_at: string;
  origin: "request" | "partner";
};

function AdminApplications() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["all_applications"],
    queryFn: async (): Promise<AppRow[]> => {
      const { data, error } = await (supabase as any)
        .from("all_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const types = useMemo(
    () => Array.from(new Set(rows.map((r) => r.form_key))).sort(),
    [rows],
  );

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterType && r.form_key !== filterType) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterPhone && !(r.phone || "").toLowerCase().includes(filterPhone.toLowerCase())) return false;
      if (dateFrom && new Date(r.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.created_at) > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [rows, filterType, filterStatus, filterPhone, dateFrom, dateTo]);

  const setStatus = useMutation({
    mutationFn: async ({ row, status }: { row: AppRow; status: ApplicationStatus }) => {
      const table = row.origin === "partner" ? "partner_applications" : "requests";
      const { error } = await (supabase as any).from(table).update({ status }).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all_applications"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (row: AppRow) => {
      const table = row.origin === "partner" ? "partner_applications" : "requests";
      const { error } = await (supabase as any).from(table).delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all_applications"] }),
  });

  const exportFn = useServerFn(exportToSheets);
  const pushSheets = useMutation({
    mutationFn: () => exportFn(),
    onSuccess: (r: any) => toast.success(`Отправлено в таблицу: ${r.count} заявок`),
    onError: (e: any) => toast.error(e.message),
  });

  function downloadCsv() {
    const headers = ["Дата", "Тип заявки", "Имя", "Телефон", "Email", "Статус", "Данные"];
    const lines = [headers.join(";")];
    for (const r of filtered) {
      const dataText = Object.entries(r.data || {})
        .filter(([k]) => !["name", "phone", "email"].includes(k))
        .map(([k, v]) => `${fieldLabel(k)}: ${formatValue(v)}`)
        .join(" | ");
      lines.push([
        new Date(r.created_at).toLocaleString("ru-RU"),
        formTypeLabel(r.form_key),
        r.name,
        r.phone,
        r.email,
        STATUS_LABELS[(r.status as ApplicationStatus) ?? "new"] ?? r.status,
        dataText,
      ].map(csvCell).join(";"));
    }
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `zayavki-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Заявки</h1>
          <p className="mt-1 text-sm text-muted-foreground">Всего: {rows.length} · Показано: {filtered.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadCsv} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium hover:bg-surface-muted">
            <Download className="h-4 w-4" /> CSV
          </button>
          <button onClick={() => pushSheets.mutate()} disabled={pushSheets.isPending}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">
            <Cloud className="h-4 w-4" /> {pushSheets.isPending ? "Отправка…" : "Экспорт в Google таблицу"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-border/60 bg-card p-4 sm:grid-cols-5">
        <Select label="Тип заявки" value={filterType} onChange={setFilterType}
          options={[["", "Все типы"], ...types.map((t) => [t, formTypeLabel(t)] as [string, string])]} />
        <Select label="Статус" value={filterStatus} onChange={setFilterStatus}
          options={[["", "Все статусы"], ...STATUS_OPTIONS.map((s) => [s, STATUS_LABELS[s]] as [string, string])]} />
        <FInput label="Телефон" value={filterPhone} onChange={setFilterPhone} placeholder="Поиск…" />
        <FInput label="С даты" type="date" value={dateFrom} onChange={setDateFrom} />
        <FInput label="По дату" type="date" value={dateTo} onChange={setDateTo} />
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((r) => (
          <Row key={r.id} row={r}
            onStatus={(s) => setStatus.mutate({ row: r, status: s })}
            onDelete={() => { if (confirm("Удалить заявку?")) del.mutate(r); }} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">Заявок нет.</p>
        )}
      </div>
    </div>
  );
}

function Row({ row, onStatus, onDelete }: { row: AppRow; onStatus: (s: ApplicationStatus) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const status = (row.status as ApplicationStatus) || "new";
  const d = row.data ?? {};
  const button = d.button as string | undefined;
  const section = d.section as string | undefined;
  const productName = d.product_name as string | undefined;
  const productPrice = d.product_price as string | undefined;
  const productCategory = d.product_category as string | undefined;
  // Поля, уже вынесенные в шапку, в детальный список не дублируем.
  const detailEntries = Object.entries(d).filter(
    ([k]) => !["name", "phone", "email", "button", "section", "page_url"].includes(k),
  );
  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <div className="flex flex-wrap items-start gap-3 p-4">
        <button onClick={() => setOpen((v) => !v)} className="mt-1 rounded p-0.5 hover:bg-surface-muted">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">{formTypeLabel(row.form_key)}</span>
            {button && (
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-medium text-emerald-700">Кнопка: {button}</span>
            )}
            {section && (
              <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-700">Раздел: {section}</span>
            )}
            <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? ""}`}>{STATUS_LABELS[status] ?? row.status}</span>
            <span className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString("ru-RU")}</span>
          </div>
          <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            <Cell label="Имя" value={row.name} />
            <Cell label="Телефон" value={row.phone} />
            <Cell label="Email" value={row.email} />
          </div>
          {productName && (
            <div className="mt-2 rounded-xl bg-surface-muted/60 px-3 py-2 text-sm">
              <span className="font-semibold">Товар:</span> {productName}
              {productCategory && <span className="text-muted-foreground"> · {productCategory}</span>}
              {productPrice && <span className="text-muted-foreground"> · {productPrice}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => onStatus(e.target.value as ApplicationStatus)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <button onClick={onDelete} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-surface-muted/40 px-4 py-3">
          <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {detailEntries.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="min-w-[140px] text-muted-foreground">{fieldLabel(k)}:</dt>
                <dd className="font-medium whitespace-pre-wrap break-words">{formatValue(v)}</dd>
              </div>
            ))}
            {d.page_url && (
              <div className="flex gap-2 sm:col-span-2">
                <dt className="min-w-[140px] text-muted-foreground">{fieldLabel("page_url")}:</dt>
                <dd className="font-medium break-all">
                  <a href={String(d.page_url)} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {String(d.page_url)}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}


function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate">{value || "—"}</span>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}

function FInput({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
    </label>
  );
}

function formatValue(v: unknown): string {
  if (v == null || v === "") return "—";
  if (Array.isArray(v)) {
    return v.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join("\n");
  }
  if (typeof v === "object") {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${fieldLabel(k)}: ${val}`).join("\n");
  }
  return String(v);
}

function csvCell(v: string): string {
  const s = String(v ?? "");
  if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
