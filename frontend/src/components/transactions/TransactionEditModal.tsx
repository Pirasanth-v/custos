import { useMemo, useState, useRef, useCallback } from "react";
import {
  Loader2,
  Pencil,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Paperclip,
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Modal from "@/components/ui/modal";
import StatusMessage from "@/components/StatusMessage";
import type { Account } from "@/features/account/types";
import type { Category } from "@/features/category/types";
import type { Bill } from "@/features/bills/types";
import type {
  Transaction,
  TransactionType,
  UpdateTransactionRequest,
} from "@/features/transaction/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "details" | "attachments";

type PendingFile = {
  localId: string;
  file: File;
  previewUrl?: string;
};

type TransactionEditModalProps = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  accounts: Account[];
  categories: Category[];
  existingBills?: Bill[];
  onSubmit: (payload: {
    tranId: string;
    fromAccountId: string;
    data: UpdateTransactionRequest;
    filesToAdd: File[];
    billIdsToDelete: string[];
  }) => Promise<void> | void;
  loading?: boolean;
  deleting?: boolean;
  errorMessage?: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  income: {
    label: "Income",
    icon: ArrowDownLeft,
    active:
      "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_1px_0_rgba(52,211,153,0.1)]",
    dot: "bg-emerald-400",
  },
  expense: {
    label: "Expense",
    icon: ArrowUpRight,
    active:
      "border-rose-500/50 bg-rose-500/10 text-rose-400 shadow-[inset_0_1px_0_rgba(244,63,94,0.1)]",
    dot: "bg-rose-400",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    active:
      "border-primary/50 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(99,102,241,0.1)]",
    dot: "bg-primary",
  },
} as const;

// ─── Small helpers ────────────────────────────────────────────────────────────

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function getFileType(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

function FileTypeIcon({ mime, className = "" }: { mime: string; className?: string }) {
  const t = getFileType(mime);
  if (t === "image") return <Image className={`text-sky-400 ${className}`} />;
  if (t === "pdf") return <FileText className={`text-orange-400 ${className}`} />;
  return <File className={`text-muted-foreground ${className}`} />;
}

// ─── Shared input classes ─────────────────────────────────────────────────────

const inputCls =
  "h-10 w-full rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground " +
  "placeholder:text-muted-foreground/50 transition focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60";

// ─── Field wrapper ────────────────────────────────────────────────────────────

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
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Type selector ────────────────────────────────────────────────────────────

function TypeSelector({
  value,
  onChange,
}: {
  value: TransactionType;
  onChange: (t: TransactionType) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {(["income", "expense", "transfer"] as TransactionType[]).map((t) => {
        const cfg = TYPE_CONFIG[t];
        const Icon = cfg.icon;
        const active = value === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-all duration-200 ${active
              ? cfg.active
              : "border-border/60 bg-background/40 text-muted-foreground hover:border-border hover:bg-background/80 hover:text-foreground"
              }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}


// ─── Existing bill item ───────────────────────────────────────────────────────

function ExistingBillItem({
  bill,
  markedForDelete,
  onToggleDelete,
}: {
  bill: Bill;
  markedForDelete: boolean;
  onToggleDelete: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const isImage = getFileType(bill.mime_type) === "image";

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${markedForDelete
        ? "border-destructive/40 bg-destructive/5 opacity-60"
        : "border-border/60 bg-background/40 hover:border-border hover:bg-background/70"
        }`}
    >
      {/* Thumbnail */}
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
        {isImage && !imgErr ? (
          <img
            src={bill.view_url}
            alt={bill.file_name}
            onError={() => setImgErr(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileTypeIcon mime={bill.mime_type} className="h-4 w-4" />
          </div>
        )}
        {markedForDelete && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
            <X className="h-4 w-4 text-destructive" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p
          className={`truncate text-[13px] font-medium transition-colors ${markedForDelete ? "line-through text-muted-foreground" : "text-foreground"
            }`}
          title={bill.file_name}
        >
          {bill.file_name}
        </p>
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {humanSize(bill.file_size_bytes)}
        </p>
      </div>

      {/* Delete toggle */}
      <button
        type="button"
        onClick={onToggleDelete}
        title={markedForDelete ? "Restore" : "Remove on save"}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all ${markedForDelete
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          : "border-border/60 bg-background text-muted-foreground opacity-0 group-hover:opacity-100 hover:border-destructive/40 hover:bg-destructive/8 hover:text-destructive"
          }`}
      >
        {markedForDelete ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

// ─── Pending file item ────────────────────────────────────────────────────────

function PendingFileItem({
  pending,
  onRemove,
}: {
  pending: PendingFile;
  onRemove: () => void;
}) {
  const isImage = pending.file.type.startsWith("image/");

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/30">
        {isImage && pending.previewUrl ? (
          <img
            src={pending.previewUrl}
            alt={pending.file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileTypeIcon mime={pending.file.type} className="h-4 w-4" />
          </div>
        )}
        {/* "New" indicator */}
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-white ring-1 ring-background">
          +
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p
          className="truncate text-[13px] font-medium text-foreground"
          title={pending.file.name}
        >
          {pending.file.name}
        </p>
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {humanSize(pending.file.size)} · New
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/8 hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.size < 10 * 1024 * 1024,
      );
      if (files.length) onFiles(files);
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-4 transition-all duration-200 ${dragging
        ? "border-primary bg-primary/8 scale-[1.01]"
        : "border-border/50 bg-background/20 hover:border-primary/40 hover:bg-background/40"
        }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${dragging ? "bg-primary/20 text-primary" : "bg-muted/60 text-muted-foreground"
          }`}
      >
        <Upload className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">
          Drop files or click to upload
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
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${active
        ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
        : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none ${active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
            }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TransactionEditModal({
  open,
  onClose,
  transaction,
  accounts,
  categories,
  existingBills,
  onSubmit,
  loading = false,
  deleting = false,
  errorMessage,
}: TransactionEditModalProps) {
  accounts = Array.isArray(accounts) ? accounts : [];
  categories = Array.isArray(categories) ? categories : [];
  existingBills = Array.isArray(existingBills) ? existingBills : [];

  // Tab
  const [tab, setTab] = useState<Tab>("details");

  // Form state
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "expense");
  const [amount, setAmount] = useState<string>(
    transaction ? String(transaction.amount ?? "") : "",
  );
  const [description, setDescription] = useState<string>(
    transaction?.description ?? "",
  );
  const [categoryId, setCategoryId] = useState<string>(
    transaction?.category_id ?? "",
  );
  const [fromAccountId, setFromAccountId] = useState<string>(
    transaction?.from_account_id ?? (accounts[0]?.id ?? ""),
  );
  const [toAccountId, setToAccountId] = useState<string>(
    transaction?.to_account_id ?? "",
  );
  const [localError, setLocalError] = useState("");

  // Bills state
  const [billsToDelete, setBillsToDelete] = useState<Set<string>>(new Set());
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const version = transaction?.version ?? 0;

  const formattedDate = useMemo(() => {
    if (!transaction?.updated_at && !transaction?.created_at) return "";
    const raw = transaction.updated_at ?? transaction.created_at;
    const d = new Date(raw!);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [transaction]);

  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === fromAccountId) ?? null,
    [accounts, fromAccountId],
  );

  const currencySymbol = fromAccount?.currency_code ?? "$";

  const transferOptions = useMemo(() => {
    if (!fromAccount) return [];
    return accounts.filter(
      (a) => a.id !== fromAccountId && a.currency_code === fromAccount.currency_code,
    );
  }, [accounts, fromAccount, fromAccountId]);

  const effectiveCategoryId = useMemo(() => {
    if (categoryId && categories.some((c) => c.id === categoryId)) return categoryId;
    return categories[0]?.id ?? "";
  }, [categoryId, categories]);

  const effectiveToAccountId = useMemo(() => {
    if (type !== "transfer") return "";
    if (
      toAccountId &&
      transferOptions.some((a) => a.id === toAccountId)
    )
      return toAccountId;
    return transferOptions[0]?.id ?? "";
  }, [type, toAccountId, transferOptions]);

  // Validation
  const parsedAmount = parseFloat(amount);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const fromValid = !!accounts.find((a) => a.id === fromAccountId);
  const categoryValid = effectiveCategoryId.trim().length > 0;
  const toValid =
    type !== "transfer" ||
    (effectiveToAccountId.trim().length > 0 &&
      effectiveToAccountId !== fromAccountId);
  const needsScroll = existingBills.length > 4;
  const needsPendingScroll = pendingFiles.length > 3;

  const hasDetailsChanged = useMemo(() => {
    if (!transaction) return false;
    const normalizedTo = type === "transfer" ? effectiveToAccountId || null : null;
    return (
      transaction.type !== type ||
      String(transaction.amount ?? "") !== amount.trim() ||
      (transaction.description ?? "") !== description.trim() ||
      (transaction.category_id ?? "") !== effectiveCategoryId ||
      (transaction.from_account_id ?? "") !== fromAccountId ||
      (transaction.to_account_id ?? null) !== normalizedTo
    );
  }, [
    transaction,
    type,
    amount,
    description,
    effectiveCategoryId,
    fromAccountId,
    effectiveToAccountId,
  ]);

  const hasBillChanges = billsToDelete.size > 0 || pendingFiles.length > 0;
  const hasChanged = hasDetailsChanged || hasBillChanges;

  const canSubmit =
    !loading &&
    !deleting &&
    !!transaction &&
    amountValid &&
    fromValid &&
    categoryValid &&
    toValid &&
    hasChanged;

  // Bills handlers
  function toggleDelete(billId: string) {
    setBillsToDelete((prev) => {
      const next = new Set(prev);
      if (next.has(billId)) next.delete(billId);
      else next.add(billId);
      return next;
    });
  }

  function addFiles(files: File[]) {
    const next: PendingFile[] = files.map((file) => ({
      localId: crypto.randomUUID(),
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));
    setPendingFiles((prev) => [...prev, ...next]);
  }

  function removePending(localId: string) {
    setPendingFiles((prev) => {
      const f = prev.find((x) => x.localId === localId);
      if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((x) => x.localId !== localId);
    });
  }

  // Submit
  async function handleSubmit() {
    setLocalError("");
    if (!transaction) return;
    if (!amountValid) {
      setLocalError("Amount must be a number greater than 0.");
      setTab("details");
      return;
    }
    if (type === "transfer" && !effectiveToAccountId) {
      setLocalError("Destination account is required for transfers.");
      setTab("details");
      return;
    }
    await onSubmit({
      tranId: transaction.id,
      fromAccountId,
      data: {
        from_account_id: fromAccountId,
        to_account_id: type === "transfer" ? effectiveToAccountId || null : null,
        type,
        amount: parsedAmount.toFixed(2),
        description: description?.trim() || "",
        category_id: effectiveCategoryId,
        version,
      },
      filesToAdd: pendingFiles.map((p) => p.file),
      billIdsToDelete: Array.from(billsToDelete),
    });
  }

  if (!open || !transaction) return null;

  // Bill counts for tab badge
  const activeBillCount =
    existingBills.filter((b) => !billsToDelete.has(b.id)).length +
    pendingFiles.length;
  const attachmentBadge =
    hasBillChanges ? activeBillCount : existingBills.length;

  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="flex flex-col">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Edit Transaction
              </h2>
              <p className="mt-0.5 max-w-[200px] truncate text-xs text-muted-foreground sm:max-w-xs">
                {transaction.description?.trim() || "No description"}
                {formattedDate ? (
                  <span className="text-border"> · </span>
                ) : null}
                {formattedDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-border/60 bg-muted/20 px-4 py-2 sm:px-5">
          <TabBtn active={tab === "details"} onClick={() => setTab("details")}>
            <Pencil className="h-3 w-3" />
            Details
          </TabBtn>
          <TabBtn
            active={tab === "attachments"}
            onClick={() => setTab("attachments")}
            badge={attachmentBadge}
          >
            <Paperclip className="h-3 w-3" />
            Attachments
            {hasBillChanges && (
              <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}
          </TabBtn>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {(localError || errorMessage) && (
          <div className="px-4 pt-4 sm:px-5">
            <StatusMessage
              type="error"
              message={localError || errorMessage}
              compact
              onClose={() => setLocalError("")}
            />
          </div>
        )}

        {/* ── Details tab ───────────────────────────────────────────────── */}
        {tab === "details" && (
          <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
            {/* Type */}
            <Field label="Type" required>
              <TypeSelector
                value={type}
                onChange={(t) => {
                  setType(t);
                  if (t !== "transfer") setToAccountId("");
                }}
              />
            </Field>

            {/* Amount + Category */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Amount" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`${inputCls} pl-8 text-right font-mono font-semibold`}
                  />
                </div>
              </Field>

              <Field label="Category" required>
                <Select
                  value={effectiveCategoryId || ""}
                  onValueChange={setCategoryId}
                >
                  <SelectTrigger
                    className={`${inputCls} bg-transparent! hover:bg-transparent! focus:bg-transparent! data-[state=open]:bg-transparent!`}
                  >
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>

                  <SelectContent position="popper" className="z-[60]">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* From + To */}
            <div
              className={`grid grid-cols-1 gap-3 ${type === "transfer" ? "sm:grid-cols-2" : ""
                }`}
            >
              <Field label="From account" required>
                <Select
                  value={fromAccountId || ""}
                  onValueChange={(value) => {
                    setFromAccountId(value);
                    setToAccountId("");
                  }}
                  disabled={accounts.length < 1}
                >
                  <SelectTrigger
                    className={`${inputCls} bg-transparent! hover:bg-transparent! focus:bg-transparent! data-[state=open]:bg-transparent!`}
                  >
                    <SelectValue placeholder="Select account…" />
                  </SelectTrigger>

                  <SelectContent position="popper" className="z-[60]">
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} · {account.currency_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {type === "transfer" && (
                <Field label="To account" required>
                  {transferOptions.length === 0 ? (
                    <div className="flex h-10 items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="text-xs text-amber-400">
                        No matching accounts
                      </span>
                    </div>
                  ) : (
                    <Select
                      value={effectiveToAccountId || ""}
                      onValueChange={setToAccountId}
                    >
                      <SelectTrigger
                        className={`${inputCls} bg-transparent! hover:bg-transparent! focus:bg-transparent! data-[state=open]:bg-transparent!`}
                      >
                        <SelectValue placeholder="Select destination account…" />
                      </SelectTrigger>

                      <SelectContent position="popper" className="z-[60]">
                        {transferOptions.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} · {account.currency_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              )}
            </div>

            {/* Date (read-only) */}
            <Field label="Transaction date">
              <input
                type="text"
                value={formattedDate || "—"}
                disabled
                className={`${inputCls} cursor-not-allowed opacity-60`}
              />
            </Field>

            {/* Description */}
            <Field label="Description">
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note…"
                className={`${inputCls} h-auto resize-none py-2.5 leading-relaxed`}
              />
            </Field>

            {/* Audit notice */}
            <div className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background/40 px-3.5 py-3">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Saving will recalculate account balances and append an entry to
                the audit log.
              </p>
            </div>
          </div>
        )}

        {/* ── Attachments tab ────────────────────────────────────────────── */}
        {tab === "attachments" && (
          <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">

            <div
              className={
                needsScroll
                  ? "max-h-56 overflow-y-auto flex flex-col gap-2 scrollbar-thin sm:max-h-72"
                  : "flex flex-col gap-2"
              }
            >
              {/* Existing bills */}
              {existingBills.length > 0 ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Attached ({existingBills.length})
                  </p>
                  <div className="space-y-2">
                    {existingBills.map((bill) => (
                      <ExistingBillItem
                        key={bill.id}
                        bill={bill}
                        markedForDelete={billsToDelete.has(bill.id)}
                        onToggleDelete={() => toggleDelete(bill.id)}
                      />
                    ))}
                  </div>
                  {billsToDelete.size > 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-400">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      {billsToDelete.size} file
                      {billsToDelete.size > 1 ? "s" : ""} will be permanently
                      removed on save.
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/50 bg-background/20 px-4 py-5 text-center">
                  <Paperclip className="mx-auto h-6 w-6 text-muted-foreground/40" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    No files attached yet.
                  </p>
                </div>
              )}
            </div>

            {/* Pending new files */}
            {pendingFiles.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Adding ({pendingFiles.length})
                </p>

                <div
                  className={
                    needsPendingScroll
                      ? "max-h-44 overflow-y-auto flex flex-col gap-2 scrollbar-thin sm:max-h-55"
                      : "flex flex-col gap-2"
                  }
                >

                  <div className="space-y-2">
                    {pendingFiles.map((p) => (
                      <PendingFileItem
                        key={p.localId}
                        pending={p}
                        onRemove={() => removePending(p.localId)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Drop zone */}
            <DropZone onFiles={addFiles} />

            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              New files are uploaded after the transaction is saved.
            </p>
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 border-t border-border/60 bg-background/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          {/* Change summary pill */}
          <div className="flex min-w-0 items-center gap-2 text-[11px] text-muted-foreground">
            {hasChanged ? (
              <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/8 px-2.5 py-1 text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full border border-border/50 bg-background/40 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                No changes
              </span>
            )}
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-transparent px-4 text-xs font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-white shadow-sm shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:min-w-[110px] sm:flex-none sm:px-5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : deleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Save changes
                </>
              )}

            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

