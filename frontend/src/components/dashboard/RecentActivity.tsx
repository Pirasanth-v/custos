import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecentTransaction {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: string;
  description: string | null;
  transaction_date: string;
  status: "pending" | "posted" | "voided";
  category_name?: string | null;
}

interface RecentActivityProps {
  data: RecentTransaction[];
  orgId: string;
  loading?: boolean;
}

const TYPE_CONFIG = {
  income: {
    icon: ArrowDownLeft,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    amountColor: "text-success",
    prefix: "+",
  },
  expense: {
    icon: ArrowUpRight,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    amountColor: "text-destructive",
    prefix: "-",
  },
  transfer: {
    icon: ArrowLeftRight,
    iconBg: "bg-chart-1/10",
    iconColor: "text-chart-1",
    amountColor: "text-foreground",
    prefix: "",
  },
};

const STATUS_CONFIG = {
  pending: "bg-warning/15 text-warning",
  posted: "bg-success/15 text-success",
  voided: "bg-muted text-muted-foreground",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAmount(amount: string) {
  const n = parseFloat(amount);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
  return n.toFixed(2);
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-xl bg-muted-foreground/10 animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-3 w-32 rounded bg-muted-foreground/10 animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-muted/60 animate-pulse" />
      </div>
      <div className="h-3 w-16 rounded bg-muted-foreground/10 animate-pulse" />
    </div>
  );
}

export function RecentActivity({ data, orgId, loading = false }: RecentActivityProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-border bg-card backdrop-blur-sm p-6 flex flex-col gap-4 shadow-sm group/card transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground group-hover/card:text-primary transition-colors">Recent Activity</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Latest transactions</p>
        </div>
        <button
          onClick={() => navigate(`/org/${orgId}/transactions`)}
          className="text-[11px] font-medium text-chart-1 hover:text-chart-1/80 transition-colors"
        >
          View all →
        </button>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          : data.length === 0
          ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-muted/20" />
              <p className="text-[13px] text-muted-foreground/50">No transactions yet</p>
            </div>
          )
          : data.map((tx) => {
              const cfg = TYPE_CONFIG[tx.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3 group/item cursor-pointer hover:bg-accent/50 -mx-2 px-2 rounded-lg transition-colors"
                  onClick={() => navigate(`/org/${orgId}/transactions`)}
                >
                  {/* icon */}
                  <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover/item:scale-105 ${cfg.iconBg}`}>
                    <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground/90 truncate group-hover/item:text-foreground transition-colors">
                      {tx.description ?? `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} transaction`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{formatDate(tx.transaction_date)}</span>
                      {tx.category_name && (
                        <>
                          <span className="text-border">·</span>
                          <span className="text-[11px] text-muted-foreground truncate">{tx.category_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* amount + status */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[13px] font-bold ${cfg.amountColor}`}>
                      {cfg.prefix}${formatAmount(tx.amount)}
                    </span>
                    {tx.status !== "posted" && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${STATUS_CONFIG[tx.status]}`}>
                        {tx.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}