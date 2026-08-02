import { useState } from "react";
import { TriangleAlert, Loader2, Tags } from "lucide-react";
import Modal from "./ui/modal";
import StatusMessage from "./StatusMessage";
import { useDeleteCategory } from "@/features/category/hooks/useDeleteCategory";
import type { Category } from "@/features/category/types";
import useOrgStore from "@/store/orgStore";
import axios from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
  category: Category | null;
};

export default function DeleteCategoryModal({
  open,
  onClose,
  category,
}: Props) {
  const [confirmationText, setConfirmationText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id || "";

  const { mutateAsync: deleteCategory, isPending } = useDeleteCategory(orgId);

  const canRemove =
    confirmationText.trim() === "DELETE" && !!category && !isPending;

  const handleConfirm = async () => {
    if (!category) return;
    setError(null);
    try {
      await deleteCategory(category.id);
      onClose();
    } catch (err) {
      let message = "Something went wrong. Try again later.";
      if (axios.isAxiosError(err)) {
        message = err?.response?.data?.error || message;
      }
      setError(message);
    }
  };

  if (!open || !category) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 p-4 text-white sm:space-y-6 sm:p-6">
        <div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive sm:h-10 sm:w-10">
              <Tags size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                Delete Category
              </h2>
            </div>
          </div>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This action cannot be undone. This will permanently delete the
            category{" "}
            <span className="break-words font-semibold text-foreground">
              {category.name}
            </span>{" "}
            from your organization.
          </p>
        </div>

        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="min-w-0">
              <p className="font-semibold text-destructive">
                Warning: Permanent Action
              </p>
              <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>
                    You cannot delete a category if it is currently assigned to
                    any transactions.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>All category configurations will be removed.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <StatusMessage
          type="error"
          message={error || undefined}
          compact
          onClose={() => setError(null)}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Type{" "}
            <span className="font-bold tracking-wide text-destructive">
              DELETE
            </span>{" "}
            to confirm
          </label>

          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type DELETE"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canRemove}
            onClick={handleConfirm}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-sm font-medium text-white transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Category"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
