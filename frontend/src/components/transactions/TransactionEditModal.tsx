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
  const [fromAccountId, setFromAccountId] = useState<string>(
    transaction?.from_account_id ?? (accounts.length > 0 ? accounts[0].id : "")
  );
  // Make sure this is always a string, not null
  const [toAccountId, setToAccountId] = useState<string>(
    transaction?.to_account_id ?? ""
  );
  const [localError, setLocalError] = useState("");

  const version = transaction?.version ?? 0;

  // Get the currently selected "from" account object for filtering transfers
  const fromAccount = useMemo(
    () => accounts.find(a => a.id === fromAccountId) ?? null,
    [accounts, fromAccountId]
  );

  const isTransfer = type === "transfer";

  const parsedAmount = useMemo(() => Number(amount), [amount]);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const fromAccountValid = !!accounts.find(a => a.id === fromAccountId);

  const toAccountValid =
    !isTransfer ||
    ((toAccountId?.trim().length ?? 0) > 0 &&
      toAccountId !== fromAccountId &&
      !!accounts.find(a => a.id === toAccountId));
  const canSubmitRequiredFields = !!transaction && amountValid && fromAccountValid && toAccountValid;

  // Only use toAccountId if transfer, else null. 
  // However: Also make sure the currency of the destination matches fromAccount
  const effectiveToAccountId =
    isTransfer &&
    accounts.find((a) => a.id === toAccountId)?.currency_code === fromAccount?.currency_code
      ? toAccountId
      : null;

  const hasChanged = useMemo(() => {
    if (!transaction) return false;

    const normalizedTo = type === "transfer" ? (toAccountId || null) : null;
    const originalTo = transaction.to_account_id ?? null;
    return (
      transaction.type !== type ||
      String(transaction.amount ?? "") !== amount.trim() ||
      (transaction.description ?? "") !== description.trim() ||
      (transaction.category_id ?? "") !== categoryId.trim() ||
      (transaction.from_account_id ?? "") !== fromAccountId ||
      originalTo !== normalizedTo
    );
  }, [transaction, type, amount, description, categoryId, fromAccountId, toAccountId]);

  const canSubmit = canSubmitRequiredFields && hasChanged && !loading;

  // Create transfer options for the destination, filtering by active "from" account
  const transferOptions = useMemo(() => {
    if (!fromAccount) return [];
    // To account cannot be the same as the from account, and must match currency
    return accounts.filter(
      a =>
        a.id !== fromAccountId &&
        a.currency_code === fromAccount.currency_code
    );
  }, [accounts, fromAccount, fromAccountId]);

  const handleSubmit = async () => {
    setLocalError("");
    if (!transaction) return;

    if (!amountValid) {
      setLocalError("Amount must be a number greater than 0.");
      return;
    }
    if (!fromAccountValid) {
      setLocalError("Please choose a valid account for 'From account'.");
      return;
    }
    if (isTransfer && (!toAccountId || !toAccountId.trim())) {
      setLocalError("Destination account is required for transfer transactions.");
      return;
    }
    if (
      isTransfer &&
      fromAccountId === toAccountId
    ) {
      setLocalError("Destination account cannot be the same as the source account.");
      return;
    }

    await onSubmit({
      tranId: transaction.id,
      fromAccountId: fromAccountId,
      data: {
        from_account_id: fromAccountId,
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
          <Field label="From account" required helperText="Choose the source account.">
            <select
              value={fromAccountId}
              onChange={e => {
                setFromAccountId(e.target.value);
                // Important: When changing the source account, clear the destination!
                setToAccountId("");
              }}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              disabled={loading || accounts.length < 1}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency_code})
                </option>
              ))}
            </select>
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
                onChange={(e) => {
                  setType(e.target.value as TransactionType);
                  // If switching away from transfer, clear toAccountId
                  if (e.target.value !== "transfer") setToAccountId("");
                }}
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
                disabled={transferOptions.length < 1}
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
                When the transaction type is not <code>transfer</code>, <code>to_account_id</code> is not
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

