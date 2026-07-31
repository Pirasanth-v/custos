import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/ui/modal";
import StatusMessage from "@/components/StatusMessage";
import type { Transaction } from "@/features/transaction/types";

type TransactionDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirm: (payload: {
    tranId: string;
    fromAccountId: string;
  }) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
};

function formatSignedAmount(type: Transaction["type"], amount: string) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  const signed = type === "income" ? n : -n;
  return `${signed >= 0 ? "+" : ""}${signed}`;
}

export default function TransactionDeleteModal({
  open,
  onClose,
  transaction,
  onConfirm,
  loading = false,
  errorMessage,
}: TransactionDeleteModalProps) {
  const [confirmationText, setConfirmationText] = useState("");

  if (!open || !transaction) return null;

  const canDelete =
    confirmationText.trim() === "DELETE" && !loading;
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive ring-1 ring-destructive/20 sm:h-11 sm:w-11 sm:rounded-2xl">
            <Trash2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Delete Transaction</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:mt-2">
              This transaction will be marked as deleted and balances will be reversed.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/70 p-3 sm:p-4">
          <p className="text-lg font-semibold text-foreground">
            {transaction.type.replace(/_/g, " ")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span className="max-w-full break-words rounded-xl border border-border px-3 py-1 font-mono sm:rounded-full">
              {(transaction.description && transaction.description.length > 60)
                ? transaction.description.slice(0, 30) + "…"
                : (transaction.description ?? "No description provided")}

            </span>
            <span className="whitespace-nowrap rounded-full border border-border px-3 py-1">
              Amount: {formatSignedAmount(transaction.type, transaction.amount)}
            </span>
          </div>
        </div>

        <StatusMessage
          type="error"
          message={errorMessage ?? null}
          compact
          onClose={() => { }}
        />

        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 sm:p-4">
          <p className="font-semibold text-destructive">Please review before deletion</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>Reverses net balance impact for the transaction</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>Transaction will be marked as deleted</span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0">•</span>
              <span>Any attached bills will also be deleted from this transaction</span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Type <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-destructive">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={"Type DELETE"}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canDelete}
            onClick={() => onConfirm({
              tranId: transaction.id,
              fromAccountId: transaction.from_account_id
            })}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-sm font-medium text-white transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Transaction
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

