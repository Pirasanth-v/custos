import { useState } from "react";
import { Pencil, Landmark, Wallet, CreditCard, PiggyBank, Loader2, MoreHorizontal, WalletCards } from "lucide-react";
import Modal from "../ui/modal";
import StatusMessage from "../StatusMessage";
import type { Account, AccountType } from "@/features/account/types";

export type UpdateAccountRequest = {
  name: string;
  description?: string;
};

type EditAccountModalProps = {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onSubmit: (data: UpdateAccountRequest) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function EditAccountModal(props: EditAccountModalProps) {
  const { open, account } = props;

  if (!open || !account) return null;

  return (
    <EditAccountModalContent
      key={`${account.id}-${open}`}
      {...props}
      account={account}
    />
  );
}

function EditAccountModalContent({
  open,
  onClose,
  account,
  onSubmit,
  loading = false,
  errorMessage,
}: {
  open: boolean;
  onClose: () => void;
  account: Account;
  onSubmit: (data: UpdateAccountRequest) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
}) {
  const [name, setName] = useState(account.name);
  const [description, setDescription] = useState(account.description ?? "");
  const [localError, setLocalError] = useState("");

  const hasChanged =
    name.trim() !== account.name ||
    (description.trim() || "") !== (account.description ?? "");

  const canSubmit = name.trim().length >= 2 && hasChanged && !loading;

  const handleSubmit = async () => {
    setLocalError("");

    if (name.trim().length < 2) {
      setLocalError("Account name must be at least 2 characters.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 p-4 text-white sm:space-y-6 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20 sm:h-11 sm:w-11 sm:rounded-2xl">
            <Pencil className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Edit Account
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:mt-2">
              Update account details. Only the name and description can be changed
              to preserve financial consistency.
            </p>
          </div>
        </div>

        <StatusMessage type="error" message={localError || errorMessage} compact onClose={() => setLocalError("")} />

        {/* Read-only summary */}
        <div className="rounded-2xl border border-border bg-card/70 p-3 sm:p-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12 sm:rounded-2xl">
              <AccountTypeIcon type={account.type} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="break-words text-base font-semibold text-foreground sm:text-lg">
                {account.name}
              </p>
              <div className="mt-2 flex max-w-full flex-wrap gap-1.5 text-xs text-muted-foreground sm:gap-2 sm:text-sm">
                <span className="rounded-full border border-border px-3 py-1 capitalize">
                  {account.type}
                </span>
                <span className="rounded-full border border-border px-3 py-1">
                  {account.currency_code || account.currency_id}
                </span>
                <span className="max-w-full break-all rounded-xl border border-border px-2.5 py-1 sm:rounded-full sm:px-3">
                  Opening: {account.currency_symbol || ""}{String(account.initial_balance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          <Field label="Account Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Account name"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </Field>

          <Field
            label="Description"
            helperText="Optional. Use this to clarify the purpose of the account."
          >
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description for this account"
              className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </Field>
        </div>

        {/* Locked fields notice */}
        <div className="rounded-2xl border border-border bg-background/40 p-3 sm:p-4">
          <p className="text-sm font-medium text-foreground">Locked fields</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Account type, currency, and opening balance cannot be edited here to
            avoid affecting reporting and historical transaction integrity.
          </p>
        </div>

        {/* Footer */}
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
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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

function Field({
  label,
  required = false,
  helperText,
  children,
}: {
  label: string;
  required?: boolean;
  helperText?: string;
  children: React.ReactNode;
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

function AccountTypeIcon({ type }: { type: AccountType }) {
  switch (type) {
    case "cash":
      return <Wallet className="h-5 w-5" />;
    case "bank":
      return <Landmark className="h-5 w-5" />;
    case "credit":
      return <CreditCard className="h-5 w-5" />;
    case "savings":
      return <PiggyBank className="h-5 w-5" />;
    case "wallet":
      return <WalletCards className="h-5 w-5" />;
    case "other":
      return <MoreHorizontal className="h-5 w-5" />;
    default:
      return <Wallet className="h-5 w-5" />;
  }
}