import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

export function ContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Укажите имя и телефон");
      return;
    }
    // TODO: подключить Google Таблицы — отправлять { name, phone, comment, source: "contact" }
    setSent(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTimeout(() => setSent(false), 200); }}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        {sent ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary text-2xl">✓</div>
            <h3 className="font-display text-xl font-semibold">Спасибо!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Наш менеджер свяжется с вами в ближайшее время.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Оставить заявку</DialogTitle>
              <DialogDescription>Перезвоним в течение 15 минут в рабочее время.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="mt-2 space-y-3">
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Имя"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон"
                type="tel"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <textarea
                value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="Комментарий"
                rows={3}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Отправить заявку
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
