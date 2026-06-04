import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

type Field = { name: string; label: string; type?: string; required?: boolean };

export function RequestDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  submitLabel = "Отправить",
  source,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  fields: Field[];
  submitLabel?: string;
  source: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required !== false && !(values[f.name] ?? "").trim()) {
        toast.error(`Заполните: ${f.label}`);
        return;
      }
    }
    // TODO: подключить отправку заявок { source, ...values }
    setSent(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setTimeout(() => { setSent(false); setValues({}); }, 200);
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-md">
        {sent ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary text-2xl">✓</div>
            <h3 className="font-display text-xl font-semibold">Спасибо!</h3>
            <p className="mt-2 text-sm text-muted-foreground">Менеджер свяжется с вами в ближайшее время.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <form onSubmit={submit} className="mt-2 space-y-3" data-source={source}>
              {fields.map((f) => (
                <input
                  key={f.name}
                  type={f.type || "text"}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  placeholder={f.label}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              ))}
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                {submitLabel}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
