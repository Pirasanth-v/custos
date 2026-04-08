import { useMemo, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import Modal from "@/components/ui/modal";
import StatusMessage from "@/components/StatusMessage";
import type { Account } from "@/features/account/types";
import type {
  Transaction,
  TransactionType,
  UpdateTransactionRequest,
} from "@/features/transaction/types";

type TransactionEditModalProps = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  accounts: Account[];
  onSubmit: (payload: {
    tranId: string;
    fromAccountId: string;
    data: UpdateTransactionRequest;
  }) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
};

function Field({
  label,
  helperText,
  children,
  required = false,
}: {
  label: string;
  helperText?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
      {helperText ? (
        <p className="text-xs leading-5 text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export default function TransactionEditModal({
  open,
  onClose,
  transaction,
  accounts,
  onSubmit,
  loading = false,
  errorMessage,
}: TransactionEditModalProps) {
  // Set initial values straight from the transaction prop
  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "income"
  );
  const [amount, setAmount] = useState<string>(
    transaction ? String(transaction.amount ?? "0") : "0"
  );
  const [description, setDescription] = useState<string>(
    transaction?.description ?? ""
  );
  const [categoryId, setCategoryId] = useState<string>(
    transaction?.category_id ?? ""
  );
  const [toAccountId, setToAccountId] = useState<string | null>(
    transaction?.to_account_id ?? null
  );
  const [localError, setLocalError] = useState("");

  const version = transaction?.version ?? 0;

  // Keep transfer target consistent with type.
  const effectiveToAccountId = type === "transfer" ? toAccountId : null;
  const isTransfer = type === "transfer";

  const parsedAmount = useMemo(() => Number(amount), [amount]);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const toAccountValid = !isTransfer || (toAccountId?.trim().length ?? 0) > 0;
  const canSubmitRequiredFields = !!transaction && amountValid && toAccountValid;

  const hasChanged = useMemo(() => {
    if (!transaction) return false;

    const normalizedTo = type === "transfer" ? toAccountId ?? null : null;
    const originalTo = transaction.to_account_id ?? null;

    return (
      transaction.type !== type ||
      (String(transaction.amount ?? "")) !== amount.trim() ||
      (transaction.description ?? "") !== description.trim() ||
      (transaction.category_id ?? "") !== categoryId.trim() ||
      originalTo !== normalizedTo
    );
  }, [transaction, type, amount, description, categoryId, toAccountId]);

  const canSubmit = canSubmitRequiredFields && hasChanged && !loading;

  const transferOptions = useMemo(() => {
    if (!transaction) return [];
    return accounts.filter((a) => a.id !== transaction.from_account_id);
  }, [accounts, transaction]);

  const handleSubmit = async () => {
    setLocalError("");
    if (!transaction) return;

    if (!amountValid) {
      setLocalError("Amount must be a number greater than 0.");
      return;
    }
    if (isTransfer && (!toAccountId || !toAccountId.trim())) {
      setLocalError("Destination account is required for transfer transactions.");
      return;
    }

    await onSubmit({
      tranId: transaction.id,
      fromAccountId: transaction.from_account_id,
      data: {
        from_account_id: transaction.from_account_id,
        to_account_id: isTransfer ? (effectiveToAccountId as string) : null,
        type,
        amount: amount.trim(),
        description: description.trim(),
        category_id: categoryId.trim(),
        version,
      },
    });
  };

  if (!open || !transaction) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-6 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Pencil className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">
              Edit Transaction
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Update transaction fields. Version is required to avoid conflicting
              edits.
            </p>
          </div>
        </div>

        <StatusMessage
          type="error"
          message={localError || errorMessage}
          compact
          onClose={() => setLocalError("")}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Field label="From account" required helperText="Locked for safety (transaction identity).">
            <input
              type="text"
              value={transaction.from_account_id}
              disabled
              className="h-11 w-full cursor-not-allowed rounded-xl border border-input bg-background px-3 text-sm text-muted-foreground"
            />
          </Field>

          <Field label="Version" required helperText="Used for optimistic concurrency.">
            <input
              type="number"
              value={version}
              disabled
              className="h-11 w-full cursor-not-allowed rounded-xl border border-input bg-background px-3 text-sm text-muted-foreground"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Type" required>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <option value="income">income</option>
                <option value="expense">expense</option>
                <option value="transfer">transfer</option>
              </select>
            </Field>

            <Field label="Amount" required helperText="Must be greater than 0.">
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              />
            </Field>
          </div>

          <Field label="Category ID" required helperText="Use the category id string used by your backend.">
            <input
              type="text"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="e.g. cat_123"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </Field>

          <Field label="Description" helperText="Optional but recommended for audit clarity.">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short note..."
              className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </Field>

          {isTransfer ? (
            <Field label="To account" required helperText="Required for transfers.">
              <select
                value={toAccountId ?? ""}
                onChange={(e) => setToAccountId(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <option value="" disabled>
                  Select destination account
                </option>
                {transferOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency_code})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Transfer fields hidden
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                When the transaction type is not `transfer`, `to_account_id` is not
                required.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

