import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import type { Bill } from "@/features/bills/types";

interface BillDeleteDialogProps {
  bill: Bill | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BillDeleteDialog({
  bill,
  isDeleting,
  onConfirm,
  onCancel,
}: BillDeleteDialogProps) {
  if (!bill) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl">
        {/* Top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-destructive/60 to-transparent" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Delete bill
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  {bill.file_name}
                </span>{" "}
                will be permanently removed from storage. This cannot be undone.
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-transparent px-3.5 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex h-8 min-w-[90px] items-center justify-center gap-1.5 rounded-lg bg-destructive px-3.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}