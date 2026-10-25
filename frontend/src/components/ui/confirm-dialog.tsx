import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const confirmationDialogContentClass = "gap-5 rounded-2xl bg-popover p-5 text-popover-foreground sm:max-w-md sm:p-6"
const confirmationDialogTitleClass = "text-xl font-semibold leading-tight text-foreground sm:text-2xl"
const confirmationDialogDescriptionClass = "text-sm leading-relaxed text-muted-foreground sm:text-base"
const confirmationDialogFooterClass = "border-border bg-muted sm:items-center"
const confirmationDialogButtonClass = "h-10 px-4 text-sm sm:text-base"
const confirmationDialogDetailClass = "rounded-xl border border-border bg-muted p-4 text-sm text-foreground sm:text-base"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  loading?: boolean
  onConfirm: () => void
}

function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirm Action",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !loading && onOpenChange(nextOpen)}>
      <DialogContent className={confirmationDialogContentClass} showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle className={confirmationDialogTitleClass}>{title}</DialogTitle>
          <DialogDescription className={confirmationDialogDescriptionClass}>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className={confirmationDialogFooterClass}>
          <Button
            variant="outline"
            className={confirmationDialogButtonClass}
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            className={confirmationDialogButtonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmDialog }
export { confirmationDialogButtonClass, confirmationDialogContentClass, confirmationDialogDescriptionClass, confirmationDialogDetailClass, confirmationDialogFooterClass, confirmationDialogTitleClass }
export type { ConfirmDialogProps }
