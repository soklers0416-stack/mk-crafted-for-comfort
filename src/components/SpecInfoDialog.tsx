import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type SpecInfo = {
  name: string;
  description?: string | null;
  photo?: string | null;
  recommendations?: string | null;
};

export function SpecInfoDialog({
  open,
  onOpenChange,
  spec,
  title,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  spec: SpecInfo | null;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title}</DialogTitle>
        </DialogHeader>
        {!spec ? (
          <p className="text-sm text-muted-foreground">Информация скоро появится.</p>
        ) : (
          <div className="space-y-4">
            <div className="text-base font-semibold">{spec.name}</div>
            {spec.photo && (
              <img
                src={spec.photo}
                alt={spec.name}
                className="w-full rounded-2xl bg-surface-muted object-contain"
                style={{ maxHeight: 280 }}
              />
            )}
            {spec.description && (
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {spec.description}
              </p>
            )}
            {spec.recommendations && (
              <div className="rounded-2xl bg-primary/5 p-4 text-sm">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
                  Рекомендации
                </div>
                <p className="whitespace-pre-line text-muted-foreground">{spec.recommendations}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
