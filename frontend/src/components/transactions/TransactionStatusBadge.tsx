import type { TransactionStatus } from "@/features/transaction/types";

export default function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus;
}) {
  const styles: Record<TransactionStatus, string> = {
    posted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    deleted: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize",
        styles[status],
      ].join(" ")}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

