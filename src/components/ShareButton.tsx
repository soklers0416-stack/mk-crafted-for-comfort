import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ title, className = "" }: { title?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = title ?? "Посмотрите этот товар в МК Мебель";

  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  const vk = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
  // MAX (max.ru) — share via universal link
  const max = `https://max.ru/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Ссылка скопирована");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Не удалось скопировать");
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium transition hover:border-primary hover:text-primary"
      >
        <Share2 className="h-4 w-4" /> Поделиться
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-lg">
            <a href={tg} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface-muted">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#229ED9] text-white text-xs font-bold">TG</span>
              Telegram
            </a>
            <a href={vk} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface-muted">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0077FF] text-white text-xs font-bold">VK</span>
              ВКонтакте
            </a>
            <a href={max} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface-muted">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background text-xs font-bold">MAX</span>
              MAX
            </a>
            <button onClick={copy} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-surface-muted">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-surface-muted">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </span>
              Скопировать ссылку
            </button>
          </div>
        </>
      )}
    </div>
  );
}
