import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from "lucide-react";
import type { Transaction, TransactionType } from "@/features/transaction/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  TransactionType,
  {
    label: string;
    Icon: React.ElementType;
    amountColor: string;
    badgeCls: string;
    glowCls: string;
    prefix: string;
  }
> = {
  income: {
    label: "Income",
    Icon: ArrowDownLeft,
    amountColor: "text-emerald-400",
    badgeCls:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    glowCls: "from-emerald-500/8 to-transparent",
    prefix: "+",
  },
  expense: {
    label: "Expense",
    Icon: ArrowUpRight,
    amountColor: "text-rose-400",
    badgeCls: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    glowCls: "from-rose-500/8 to-transparent",
    prefix: "-",
  },
  transfer: {
    label: "Transfer",
    Icon: ArrowLeftRight,
    amountColor: "text-primary",
    badgeCls: "border-primary/30 bg-primary/10 text-primary",
    glowCls: "from-primary/8 to-transparent",
    prefix: "",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  posted: {
    label: "Posted",
    cls: "border-emerald-500/30 bg-emerald-500/8 text-emerald-400",
    dot: "bg-emerald-400",
  },
  pending: {
    label: "Pending",
    cls: "border-amber-500/30 bg-amber-500/8 text-amber-400",
    dot: "bg-amber-400",
  },
  voided: {
    label: "Voided",
    cls: "border-muted/50 bg-muted/20 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAmount(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return raw;
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

type TxDetailHeaderProps = {
  transaction: Transaction;
  currencyCode?: string;
};

export function TxDetailHeader({
  transaction,
  currencyCode,
}: TxDetailHeaderProps) {
  const type = transaction.type as TransactionType;
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.expense;
  const status = transaction.status ?? "posted";
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.posted;
  const Icon = cfg.Icon;

  return (
    <div className="relative overflow-hidden px-6 pb-6 pt-7">
      {/* Ambient gradient */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${cfg.glowCls}`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        {/* Left: icon + amount */}
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${cfg.badgeCls}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {cfg.label}
            </p>
            <p className={`text-3xl font-bold tabular-nums leading-none ${cfg.amountColor}`}>
              {cfg.prefix}
              {currencyCode && (
                <span className="mr-0.5 text-lg font-semibold opacity-70">
                  {currencyCode}
                </span>
              )}
              {formatAmount(transaction.amount)}
            </p>
          </div>
        </div>

        {/* Right: status */}
        <span
          className={`inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:mt-1 ${statusCfg.cls}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Description */}
      {transaction.description?.trim() ? (
        <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
          {transaction.description}
        </p>
      ) : null}
    </div>
  );
}