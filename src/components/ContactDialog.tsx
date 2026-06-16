import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DynamicForm, useFormConfig } from "@/components/DynamicForm";

export function ContactDialog({
  open,
  onOpenChange,
  formKey = "callback",
  extraData,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formKey?: string;
  extraData?: Record<string, unknown>;
}) {
  const { data: config } = useFormConfig(formKey);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{config?.title ?? "Оставить заявку"}</DialogTitle>
          {config?.description && <DialogDescription>{config.description}</DialogDescription>}
        </DialogHeader>
        <DynamicForm formKey={formKey} extraData={extraData} />
      </DialogContent>
    </Dialog>
  );
}
