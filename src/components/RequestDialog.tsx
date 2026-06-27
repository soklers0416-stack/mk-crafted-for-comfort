import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DynamicForm, useFormConfig } from "@/components/DynamicForm";
import { toast } from "sonner";

// Универсальный диалог заявки. Настройки берутся из таблицы form_configs по `source` (formKey).
export function RequestDialog({
  open, onOpenChange, source, title, description, extraData,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  source: string;
  title?: string;
  description?: string;
  fields?: unknown;
  submitLabel?: string;
  extraData?: Record<string, unknown>;
}) {
  const { data: config } = useFormConfig(source);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title ?? config?.title ?? "Заявка"}</DialogTitle>
          {(description ?? config?.description) && (
            <DialogDescription>{description ?? config?.description}</DialogDescription>
          )}
        </DialogHeader>
        <DynamicForm
          formKey={source}
          extraData={extraData}
          onSent={() => {
            toast.success("Заявка отправлена. Мы скоро свяжемся с вами.");
            setTimeout(() => onOpenChange(false), 1800);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
