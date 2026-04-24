import type { TransactionType } from "@/features/transaction/types";

export default function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const styles: Record<TransactionType, string> = {
    income: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expense: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    transfer: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize",
        styles[type],
      ].join(" ")}
    >
      {type}
    </span>
  );
}

