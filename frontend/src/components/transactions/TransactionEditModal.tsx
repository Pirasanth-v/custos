import { useMemo, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import Modal from "@/components/ui/modal";
import StatusMessage from "@/components/StatusMessage";
import type { Account } from "@/features/account/types";
import type { Category } from "@/features/category/types";
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
  categories: Category[];
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
  categories,
  onSubmit,
  loading = false,
  errorMessage,
}: TransactionEditModalProps) {

  accounts = Array.isArray(accounts) ? accounts : [];
  categories = Array.isArray(categories) ? categories : [];

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
  const formattedDate = useMemo(() => {
    if (!transaction?.created_at) return "";
    const parsedDate = new Date(transaction.created_at);
    if (Number.isNaN(parsedDate.getTime())) return "";
    return parsedDate.toLocaleDateString("en-GB");
  }, [transaction?.created_at]);

  // Get the currently selected "from" account object for filtering transfers
  const fromAccount = useMemo(
    () => accounts.find(a => a.id === fromAccountId) ?? null,
    [accounts, fromAccountId]
  );

  const isTransfer = type === "transfer";

  const effectiveCategoryId = useMemo(() => {
    if (categoryId && categories.some((c) => c.id === categoryId)) {
      return categoryId;
    }
    return categories[0]?.id ?? "";
  }, [categoryId, categories]);

  const parsedAmount = useMemo(() => Number(amount), [amount]);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const fromAccountValid = !!accounts.find(a => a.id === fromAccountId);
  const categoryValid = effectiveCategoryId.trim().length > 0;

  const toAccountValid =
    !isTransfer ||
    ((toAccountId?.trim().length ?? 0) > 0 &&
      toAccountId !== fromAccountId &&
      !!accounts.find(a => a.id === toAccountId));
  const canSubmitRequiredFields =
    !!transaction && amountValid && fromAccountValid && categoryValid && toAccountValid;

  const effectiveToAccountId =
    isTransfer &&
    accounts.find((a) => a.id === toAccountId)?.currency_code === fromAccount?.currency_code
      ? toAccountId
      : "";

  const hasChanged = useMemo(() => {
    if (!transaction) return false;

    const normalizedTo = type === "transfer" ? (toAccountId || null) : null;
    const originalTo = transaction.to_account_id ?? null;
    return (
      transaction.type !== type ||
      String(transaction.amount ?? "") !== amount.trim() ||
      (transaction.description ?? "") !== description.trim() ||
      (transaction.category_id ?? "") !== effectiveCategoryId.trim() ||
      (transaction.from_account_id ?? "") !== fromAccountId ||
      originalTo !== normalizedTo
    );
  }, [transaction, type, amount, description, effectiveCategoryId, fromAccountId, toAccountId]);

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
        to_account_id: effectiveToAccountId,
        type,
        amount: amount.trim(),
        description: description.trim(),
        category_id: effectiveCategoryId.trim(),
        version,
      },
    });
  };

  if (!open || !transaction) return null;

  return (
    <Modal open={open} onClose={onClose}>
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/25 text-primary">
              <Pencil className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold leading-none text-foreground">
                Edit transaction
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {transaction.description?.trim() || "No description"}{" "}
                {formattedDate ? `- ${formattedDate}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <StatusMessage
            type="error"
            message={localError || errorMessage}
            compact
            onClose={() => setLocalError("")}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Type" required>
              <div className="grid grid-cols-3 gap-2">
                {(["income", "expense", "transfer"] as TransactionType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setType(option);
                      if (option !== "transfer") setToAccountId("");
                    }}
                    className={`h-11 rounded-xl border text-sm font-medium capitalize transition ${
                      type === option
                        ? "border-primary bg-primary/25 text-primary"
                        : "border-input bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Amount" required>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-background pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                />
              </div>
            </Field>
          </div>

          <div className={`grid grid-cols-1 gap-5 ${isTransfer ? "sm:grid-cols-2" : ""}`}>
            <Field label="From account" required>
              <select
                value={fromAccountId}
                onChange={e => {
                  setFromAccountId(e.target.value);
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

            {isTransfer ? (
              <Field label="To account" required>
                <select
                  value={effectiveToAccountId}
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
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Date" required>
              <input
                type="text"
                value={formattedDate}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-xl border border-input bg-background px-3 text-sm text-muted-foreground"
              />
            </Field>

            <Field label="Category" required>
              <select
                value={effectiveCategoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short note..."
              className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </Field>

          <div className="rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground">
            Editing will update the account balance and create an audit log entry.
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                Save changes
              </>
            )}
          </button>
        </div>
    </Modal>
  );
}

