import { useMemo, useState } from "react";
import {
  Wallet,
  Landmark,
  CreditCard,
  PiggyBank,
  Loader2,
  Plus,
  MoreHorizontal,
  WalletCards,
} from "lucide-react";
import Modal from "./ui/modal";
import StatusMessage from "./StatusMessage";
import type { Currency } from "@/features/currency/types";
import type { AccountType, CreateAccount } from "@/features/account/types";

type CreateAccountModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccount) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
  currencies: Currency[];
};

const accountTypes: {
  value: AccountType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "cash",
    label: "Cash",
    description: "Physical cash, petty cash, tills",
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    value: "bank",
    label: "Bank",
    description: "Business checking and bank accounts",
    icon: <Landmark className="h-5 w-5" />,
  },
  {
    value: "credit",
    label: "Credit",
    description: "Credit cards and credit liabilities",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    value: "savings",
    label: "Savings",
    description: "Reserved or savings accounts",
    icon: <PiggyBank className="h-5 w-5" />,
  },
  {
    value: "wallet",
    label: "Wallet",
    description: "Digital or physical wallets",
    icon: <WalletCards className="h-5 w-5" />,
  },
  {
    value: "other",
    label: "Other",
    description: "Miscellaneous accounts",
    icon: <MoreHorizontal className="h-5 w-5" />,
  },
];

export default function CreateAccountModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  errorMessage,
  currencies,
}: CreateAccountModalProps) {
  if (!open) return null;
  const currencyList = Array.isArray(currencies) ? currencies : [];

  return (
    <CreateAccountModalContent
      key={String(open)}
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
      errorMessage={errorMessage}
      currencies={currencyList}
    />
  );
}

function CreateAccountModalContent({
  open,
  onClose,
  onSubmit,
  loading,
  errorMessage,
  currencies,
}: CreateAccountModalProps) {
  const [form, setForm] = useState<CreateAccount>({
    name: "",
    type: "cash",
    currency_id: currencies?.[0]?.id ?? "",
    initial_balance: "",
    description: "",
  });

  const [localError, setLocalError] = useState("");

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.id === form.currency_id),
    [currencies, form.currency_id],
  );

  const canSubmit =
    form.name.trim().length >= 2 &&
    form.type &&
    form.currency_id &&
    form.initial_balance.trim() !== "" &&
    !loading;

  const handleChange = (field: keyof CreateAccount, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLocalError("");

    if (form.name.trim().length < 2) {
      setLocalError("Account name must be at least 2 characters.");
      return;
    }

    if (!form.currency_id) {
      setLocalError("Please select a currency.");
      return;
    }

    if (form.initial_balance.trim() === "") {
      setLocalError("Initial balance is required.");
      return;
    }

    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        initial_balance: form.initial_balance.trim(),
        description: form.description?.trim() || undefined,
      });
    } catch {
      // parent error handling can populate errorMessage
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-4xl">
      <div className="space-y-6 p-6 text-white">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Plus className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">
              Create Account
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add a new account to track balances, transactions, and reporting
              accurately across your organization.
            </p>
          </div>
        </div>

        {/* Error slot */}
        <StatusMessage
          type="error"
          message={localError || errorMessage}
          compact
          onClose={() => {}}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <FormField label="Account Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Main Bank Account"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              />
            </FormField>

            <FormField label="Currency" required>
              <select
                value={form.currency_id}
                onChange={(e) => handleChange("currency_id", e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                {currencies?.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} ({currency.symbol}) — {currency.name}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Account Type <span className="text-destructive">*</span>
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {accountTypes.map((type) => {
                  const active = form.type === type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange("type", type.value)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card/50 hover:border-primary/40 hover:bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-10 w-12 items-center justify-center rounded-xl ${
                            active
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {type.icon}
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {type.label}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col h-full gap-4">
            <FormField
              label="Initial Balance"
              required
              helperText="Use negative values if needed for liabilities or credit-style accounts."
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {selectedCurrency?.symbol ?? "$"}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={form.initial_balance}
                  onChange={(e) =>
                    handleChange("initial_balance", e.target.value)
                  }
                  placeholder="0.00"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                />
              </div>
            </FormField>

            <FormField
              label="Description"
              helperText="Optional. Add a short note to help identify this account later."
            >
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="e.g. Used for operational banking and vendor payments"
                rows={4}
                className="w-full rounded-xl border border-input bg-background px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              />
            </FormField>

            <div className="rounded-2xl border border-border bg-card/60 p-4">
              <p className="text-sm font-medium text-foreground">
                Quick guidance
              </p>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted-foreground">
                <li>
                  • Choose the type carefully to preserve reporting accuracy
                </li>
                <li>• Currency cannot usually be changed casually later</li>
                <li>
                  • Initial balance is your opening value for this account
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            disabled={!canSubmit}
            onClick={handleSubmit}
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
                Create Account
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function FormField({
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
