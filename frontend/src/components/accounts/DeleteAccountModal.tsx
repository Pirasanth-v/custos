import { useState } from "react";
import { Trash2, TriangleAlert, Loader2 } from "lucide-react";
import Modal from "../ui/modal";
import StatusMessage from "../StatusMessage";
import type { Account } from "@/features/account/types";

type DeleteAccountModalProps = {
  open: boolean;
  onClose: () => void;
  account: Account | null;
  onConfirm: (account: Account) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function DeleteAccountModal(props: DeleteAccountModalProps) {
  const { open, account } = props;

  if (!open || !account) return null;

  return (
    <DeleteAccountModalContent
      key={`${account.id}-${open}`}
      {...props}
      account={account}
    />
  );
}

function DeleteAccountModalContent({
  open,
  onClose,
  account,
  onConfirm,
  loading = false,
  errorMessage,
}: {
  open: boolean;
  onClose: () => void;
  account: Account;
  onConfirm: (account: Account) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
}) {
  const [confirmationText, setConfirmationText] = useState("");
  const canDelete =
    confirmationText.trim() === account.name && !loading;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 p-4 text-white sm:space-y-6 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive ring-1 ring-destructive/20 sm:h-11 sm:w-11 sm:rounded-2xl">
            <Trash2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Delete Account
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:mt-2">
              This permanently deletes the account from active use. This action
              should only be done if the account is no longer needed.
            </p>
          </div>
        </div>

        {/* Account summary */}
        <div className="rounded-2xl border border-border bg-card/70 p-3 sm:p-4">
          <p className="break-words text-base font-semibold text-foreground sm:text-lg">{account.name}</p>
          <div className="mt-2 flex max-w-full flex-wrap gap-1.5 text-xs text-muted-foreground sm:gap-2 sm:text-sm">
            <span className="rounded-full border border-border px-3 py-1 capitalize">
              {account.type}
            </span>
            {account.currency_code ? (
              <span className="rounded-full border border-border px-3 py-1">
                {account.currency_code}
              </span>
            ) : null}
            <span className="max-w-full break-all rounded-xl border border-border px-2.5 py-1 sm:rounded-full sm:px-3">
              Opening: {account.currency_symbol || ""}{String(account.initial_balance)}
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">
                Please review before deletion
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>This action cannot be undone from the interface</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>Historical references may be preserved, but the account will no longer be active</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>Delete only if the account is unused or intentionally retired</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <StatusMessage type="error" message={errorMessage} compact onClose={() => { }} />

        {/* Confirmation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Type{" "}
            <span className="inline break-all rounded bg-muted px-1.5 py-0.5 font-mono text-destructive">
              {account.name}
            </span>{" "}
            to confirm
          </label>

          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={account.name}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            autoComplete="off"
            spellCheck={false}
          />
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
            disabled={!canDelete}
            onClick={() => onConfirm(account)}
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
                Delete Account
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}