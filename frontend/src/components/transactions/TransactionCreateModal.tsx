import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import Modal from "@/components/ui/modal";
import StatusMessage from "@/components/StatusMessage";
import type { Account } from "@/features/account/types";
import type {
  CreateTransactionRequest,
  TransactionType,
} from "@/features/transaction/types";

type TransactionCreateModalProps = {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onSubmit: (payload: {
    fromAccountId: string;
    data: CreateTransactionRequest;
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

export default function TransactionCreateModal({
  open,
  onClose,
  accounts,
  onSubmit,
  loading = false,
  errorMessage,
}: TransactionCreateModalProps) {
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState<string>("0");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");

  accounts = Array.isArray(accounts) ? accounts : [];


  const derivedFromAccountId = useMemo(() => {
    if (fromAccountId && accounts.some(a => a.id === fromAccountId)) {
      return fromAccountId;
    }
    return accounts[0]?.id ?? "";
  }, [fromAccountId, accounts]);

  const fromAccount = useMemo(
    () => (accounts ? accounts.find((a) => a.id === derivedFromAccountId) ?? null : null),
    [accounts, derivedFromAccountId],
  );

  const toAccountOptions = useMemo(() => {
    if (!fromAccount) return [];
    return accounts.filter(
      (a) =>
        a.id !== derivedFromAccountId &&
        a.currency_code === fromAccount.currency_code,
    );
  }, [accounts, fromAccount]);

  const effectiveToAccountId =
    type !== "transfer"
      ? null
      : (() => {
          // Return toAccountId if valid and matches currency with fromAccount
          const to = accounts.find(
            (a) => a.id === toAccountId && a.currency_code === fromAccount?.currency_code && a.id !== fromAccount?.id,
          );
          if (to) return toAccountId;
          // Otherwise, default: first account (not fromAccount) with same currency
          const def = accounts.find(
            (a) => a.id !== fromAccount?.id && a.currency_code === fromAccount?.currency_code,
          );
          return def?.id ?? null;
        })();


  const amountTrimmed = amount.trim();
  const isIntegerString = /^\d+$/.test(amountTrimmed);
  const amountInt = Number(amountTrimmed);
  const amountValid = isIntegerString && Number.isFinite(amountInt) && amountInt > 0;

  const categoryValid = categoryId.trim().length > 0;
  const toValid = type !== "transfer" || (effectiveToAccountId ?? "").trim().length > 0;

  const canSubmit =
    !loading &&
    !!derivedFromAccountId &&
    amountValid &&
    categoryValid &&
    toValid;

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-4xl">
      <div className="space-y-6 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Plus className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">
              Create Transaction
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add a new transaction to your feed. Transfer transactions require
              destination accounts with the same currency.
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
          <Field
            label="From account"
            required
            helperText="Select the source account used by the backend."
          >
            <select
              value={derivedFromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency_code})
                </option>
              ))}
            </select>
          </Field>

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

          <Field
            label="Amount"
            required
            helperText="Backend expects an integer string (e.g. 100)."
          >
            <input
              type="number"
              inputMode="numeric"
              step="1"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </Field>

          <Field
            label="Category ID"
            required
            helperText="Use your backend category_id string."
          >
            <input
              type="text"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="e.g. cat_123"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {type === "transfer" ? (
            <Field
              label="To account"
              required
              helperText={
                fromAccount?.currency_code
                  ? `Same currency as ${fromAccount.currency_code}.`
                  : "Same currency as source account."
              }
            >
              <select
                value={effectiveToAccountId ?? ""}
                onChange={(e) =>
                  setToAccountId(e.target.value ? e.target.value : null)
                }
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                {toAccountOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency_code})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Destination account hidden
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                It is required only for transfer type transactions.
              </p>
            </div>
          )}

          <Field label="Description">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short note..."
              className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </Field>
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
            onClick={async () => {
              setLocalError("");
              if (!canSubmit) return;

              await onSubmit({
                fromAccountId: derivedFromAccountId,
                data: {
                  type,
                  amount: amountTrimmed,
                  description: description.trim() ? description.trim() : null,
                  category_id: categoryId.trim(),
                  to_account_id:
                    type === "transfer" ? (effectiveToAccountId ?? null) : null,
                },
              });
            }}
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

