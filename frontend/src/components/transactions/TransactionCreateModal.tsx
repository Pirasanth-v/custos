import { useMemo, useState, useRef, useCallback } from "react";
import {
  Loader2,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Upload,
  X,
  FileText,
  Image,
  Receipt,
  Info,
} from "lucide-react";
import Modal from "@/components/ui/modal";
import StatusMessage from "@/components/StatusMessage";
import type { Account } from "@/features/account/types";
import type { Category } from "@/features/category/types";
import type {
  CreateTransactionRequest,
  TransactionType,
} from "@/features/transaction/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";

// ─── Local types ──────────────────────────────────────────────────────────────

type PendingBill = {
  localId: string;
  file: File;
  previewUrl?: string;
};

//type TransactionStatus = "pending" | "posted";

type TransactionCreateModalProps = {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  onSubmit: (payload: {
    fromAccountId: string;
    data: CreateTransactionRequest;
    files: File[];
  }) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function formatAmount(raw: string, symbol: string): string {
  const n = parseFloat(raw);
  if (!raw || isNaN(n)) return `${symbol}0`;
  return `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fileIcon(file: File) {
  if (file.type.startsWith("image/"))
    return <Image className="h-4 w-4 text-primary" />;
  return <FileText className="h-4 w-4 text-muted-foreground" />;
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  required = false,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground " +
  "placeholder:text-muted-foreground/50 transition focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60";

const selectCls =
  "h-10 w-full rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground " +
  "transition focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 appearance-none";

// ─── Type Selector ────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  income: {
    label: "Income",
    icon: ArrowDownLeft,
    activeClass:
      "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.15)]",
    dotClass: "bg-emerald-400",
  },
  expense: {
    label: "Expense",
    icon: ArrowUpRight,
    activeClass:
      "bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    dotClass: "bg-rose-400",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    activeClass:
      "bg-primary/15 text-primary border-primary/40 shadow-[0_0_12px_rgba(99,102,241,0.15)]",
    dotClass: "bg-primary",
  },
} as const;

function TypeSelector({
  value,
  onChange,
}: {
  value: TransactionType;
  onChange: (t: TransactionType) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {(["income", "expense", "transfer"] as TransactionType[]).map((t) => {
        const cfg = TYPE_CONFIG[t];
        const Icon = cfg.icon;
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`group flex min-w-0 items-center justify-center gap-1 rounded-xl border px-1 py-2 text-xs font-medium transition-all duration-200 sm:gap-2 sm:px-2 sm:py-2.5 sm:text-sm ${active
              ? cfg.activeClass
              : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:bg-background/80 hover:text-foreground"
              }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <span className="min-w-0 truncate">{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function BillsZone({
  bills,
  onAdd,
  onRemove,
}: {
  bills: PendingBill[];
  onAdd: (files: File[]) => void;
  onRemove: (localId: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.size < 10 * 1024 * 1024, // 10 MB cap
      );
      if (files.length) onAdd(files);
    },
    [onAdd],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Drop area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-all duration-200 ${dragging
          ? "border-primary bg-primary/8 scale-[1.01]"
          : "border-border/60 bg-background/30 hover:border-primary/50 hover:bg-background/50"
          }`}
      >
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${dragging ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground"
            }`}
        >
          <Upload className="h-4 w-4" />
        </div>
        <div className="text-center">
          <p className="text-xs font-medium text-foreground">
            Drop receipts here
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            PNG, JPG, PDF · max 10 MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onAdd(files);
            e.target.value = "";
          }}
        />
      </div>

      {/* File list */}
      {bills.length > 0 && (
        <ul className="space-y-1.5">
          {bills.map((b) => (
            <li
              key={b.localId}
              className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
            >
              {b.previewUrl ? (
                <img
                  src={b.previewUrl}
                  alt=""
                  className="h-8 w-8 rounded-md object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60">
                  {fileIcon(b.file)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-foreground">
                  {b.file.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {humanSize(b.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(b.localId)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Amount Input ─────────────────────────────────────────────────────────────

function AmountInput({
  value,
  onChange,
  symbol,
}: {
  value: string;
  onChange: (v: string) => void;
  symbol: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
        {symbol}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className={`${inputCls} pl-8 text-right font-mono font-semibold tracking-tight text-foreground`}
      />
    </div>
  );
}

// ─── Summary pill ─────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium text-foreground text-right max-w-[140px]">
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TransactionCreateModal({
  open,
  onClose,
  accounts,
  categories,
  onSubmit,
  loading = false,
  errorMessage,
}: TransactionCreateModalProps) {
  // Normalize
  accounts = Array.isArray(accounts) ? accounts : [];
  categories = Array.isArray(categories) ? categories : [];

  // Form state
  const [type, setType] = useState<TransactionType>("expense");
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(today());
  // const [status, setStatus] = useState<TransactionStatus>("posted");
  // const [tags, setTags] = useState<string[]>([]);
  const [bills, setBills] = useState<PendingBill[]>([]);
  const [localError, setLocalError] = useState("");

  // Derived values
  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === fromAccountId) ?? accounts[0] ?? null,
    [accounts, fromAccountId],
  );

  const effectiveFromId = fromAccount?.id ?? "";

  const toAccountOptions = useMemo(
    () =>
      accounts.filter(
        (a) =>
          a.id !== effectiveFromId &&
          a.currency_code === fromAccount?.currency_code,
      ),
    [accounts, effectiveFromId, fromAccount],
  );

  const effectiveToId = useMemo(() => {
    if (type !== "transfer") return "";
    if (toAccountId && toAccountOptions.some((a) => a.id === toAccountId))
      return toAccountId;
    return toAccountOptions[0]?.id ?? "";
  }, [type, toAccountId, toAccountOptions]);

  const effectiveCategoryId = useMemo(() => {
    if (categoryId && categories.some((c) => c.id === categoryId))
      return categoryId;
    return categories[0]?.id ?? "";
  }, [categoryId, categories]);

  const currencySymbol = fromAccount?.currency_code ?? "¤";

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const amountNum = parseFloat(amount);
  const amountValid =
    amount.trim().length > 0 && Number.isFinite(amountNum) && amountNum > 0;
  const toValid = type !== "transfer" || effectiveToId.trim().length > 0;
  const canSubmit =
    !loading && !!effectiveFromId && amountValid && !!effectiveCategoryId && toValid;

  // Bills handlers
  function addFiles(files: File[]) {
    const next: PendingBill[] = files.map((file) => {
      const localId = crypto.randomUUID();
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;
      return { localId, file, previewUrl };
    });
    setBills((prev) => [...prev, ...next]);
  }

  function removeBill(localId: string) {
    setBills((prev) => {
      const b = prev.find((x) => x.localId === localId);
      if (b?.previewUrl) URL.revokeObjectURL(b.previewUrl);
      return prev.filter((x) => x.localId !== localId);
    });
  }

  async function handleSubmit() {
    setLocalError("");
    if (!canSubmit) return;
    try {
      await onSubmit({
        fromAccountId: effectiveFromId,
        data: {
          type,
          amount: amountNum.toFixed(2),
          description: description.trim() || null,
          category_id: effectiveCategoryId,
          to_account_id: type === "transfer" ? effectiveToId || null : null,
          transaction_date: transactionDate,
          status,
          //tags: tags.length > 0 ? tags : undefined,
        } as CreateTransactionRequest,
        files: bills.map((b) => b.file),
      });
    } catch (e: unknown) {
      if (e instanceof Error) setLocalError(e.message);
    }
  }

  if (!open) return null;

  const typeCfg = TYPE_CONFIG[type];

  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-3xl">
      <div className="flex flex-col">
        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-t-2xl border-b border-border/60 bg-background/80 px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
          {/* Ambient glow behind type */}
          <div
            className={`pointer-events-none absolute inset-x-0 -top-10 h-28 opacity-30 blur-3xl transition-all duration-500 ${type === "income"
              ? "bg-emerald-500"
              : type === "expense"
                ? "bg-rose-500"
                : "bg-primary"
              }`}
          />
          <div className="relative flex min-w-0 items-start justify-between gap-3 sm:items-center sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${typeCfg.activeClass}`}
              >
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  New Transaction
                </h2>
                <p className="text-xs text-muted-foreground">
                  {type === "transfer"
                    ? "Move funds between accounts"
                    : type === "income"
                      ? "Record money coming in"
                      : "Record money going out"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center shrink-0 justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative mt-4">
            <TypeSelector value={type} onChange={setType} />
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col gap-0 lg:flex-row">
          {/* Left: Core fields */}
          <div className="min-w-0 flex-1 space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            {/* Error */}
            <StatusMessage
              type="error"
              message={localError || errorMessage}
              compact
              onClose={() => setLocalError("")}
            />

            {/* Account row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="From account" required>
                <div className="relative">
                  <Select
                    value={effectiveFromId || undefined}
                    onValueChange={setFromAccountId}
                  >
                    <SelectTrigger className={`${selectCls} bg-transparent!`}>
                      <SelectValue placeholder="Select account..." />
                    </SelectTrigger>

                    <SelectContent position="popper">
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} · {account.currency_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>
              </Field>

              {type === "transfer" ? (
                <Field label="To account" required>
                  <div className="relative">
                    {toAccountOptions.length === 0 ? (
                      <div className="flex h-10 items-center rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 text-xs text-amber-400">
                        No matching accounts
                      </div>
                    ) : (
                      <>
                        <Select
                          value={effectiveToId || undefined}
                          onValueChange={setToAccountId}
                        >
                          <SelectTrigger className={`${selectCls} bg-transparent!`}>
                            <SelectValue placeholder="Select destination account..." />
                          </SelectTrigger>

                          <SelectContent position="popper">
                            {toAccountOptions.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} · {account.currency_code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                      </>
                    )}
                  </div>
                </Field>
              ) : (
                <Field label="Category" required>
                  <div className="relative">
                    <Select
                      value={effectiveCategoryId || undefined}
                      onValueChange={setCategoryId}
                    >
                      <SelectTrigger className={`${selectCls} bg-transparent!`}>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>

                      <SelectContent position="popper">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>
                </Field>
              )}
            </div>

            {/* Category for transfer (moved below) */}
            {type === "transfer" && (
              <Field label="Category" required>
                <div className="relative">
                  <select
                    value={effectiveCategoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={selectCls}
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            )}

            {/* Amount + Date */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Amount" required>
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  symbol={currencySymbol}
                />
              </Field>
              <Field label="Date" required>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`${inputCls} flex items-center justify-between text-left font-normal`}
                    >
                      <span className={transactionDate ? "text-foreground" : "text-muted-foreground"}>
                        {transactionDate
                          ? format(parseISO(transactionDate), "MMM d, yyyy")
                          : "Select date"}
                      </span>

                      <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    className="z-[60] w-auto p-0"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        transactionDate ? parseISO(transactionDate) : undefined
                      }
                      onSelect={(date) => {
                        if (!date) return;

                        setTransactionDate(format(date, "yyyy-MM-dd"));
                        setDatePickerOpen(false);
                      }}
                      disabled={{ after: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>

            </div>

            {/* Description */}
            <Field label="Description">
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note…"
                className={`${inputCls} h-auto resize-none py-2.5 leading-relaxed`}
              />
            </Field>

          </div>

          {/* Divider */}
          <div className="hidden w-px bg-border/60 lg:block" />
          <div className="h-px bg-border/60 lg:hidden" />

          {/* Right: Bills + summary */}
          <div className="flex w-full min-w-0 flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:w-64 lg:shrink-0">
            {/* Bills */}
            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Receipts & Bills
                </label>
                {bills.length > 0 && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {bills.length}
                  </span>
                )}
              </div>
              <BillsZone bills={bills} onAdd={addFiles} onRemove={removeBill} />
              <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                Files upload after the transaction is created.
              </p>
            </div>

            {/* Summary */}
            {(amountValid || effectiveFromId) && (
              <div className="rounded-xl border border-border/60 bg-background/40 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Summary
                </p>
                <div className="space-y-1.5">
                  <SummaryRow
                    label="Type"
                    value={
                      type.charAt(0).toUpperCase() + type.slice(1)
                    }
                  />
                  <SummaryRow
                    label="From"
                    value={fromAccount?.name ?? "—"}
                  />
                  {type === "transfer" && effectiveToId && (
                    <SummaryRow
                      label="To"
                      value={
                        accounts.find((a) => a.id === effectiveToId)?.name ??
                        "—"
                      }
                    />
                  )}
                  <SummaryRow
                    label="Amount"
                    value={
                      amountValid
                        ? formatAmount(amount, currencySymbol)
                        : "—"
                    }
                  />
                  <SummaryRow label="Date" value={transactionDate} />
                  {bills.length > 0 && (
                    <SummaryRow
                      label="Attachments"
                      value={`${bills.length} file${bills.length > 1 ? "s" : ""}`}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex flex-col-reverse gap-2.5 border-t border-border/60 bg-background/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-transparent px-4 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`inline-flex h-10 w-full min-w-[120px] items-center sm:h-9 sm:w-auto justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${type === "income"
              ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20"
              : type === "expense"
                ? "bg-rose-500 hover:bg-rose-400 shadow-rose-500/20"
                : "bg-primary hover:opacity-90 shadow-primary/20"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create{bills.length > 0 ? ` · ${bills.length} file${bills.length > 1 ? "s" : ""}` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

