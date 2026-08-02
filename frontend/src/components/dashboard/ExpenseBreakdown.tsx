import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface CategoryBreakdown {
  category_id: string | null;
  category_name: string | null;
  total: string;
  tx_count: number;
}

interface ExpenseBreakdownProps {
  data: CategoryBreakdown[];
  loading?: boolean;
}

const PALETTE = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary)",
];

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

interface CustomTooltipPayloadItem {
  name: string;
  value: number;
  payload: {
    color: string;
    pct: number;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-popover border border-border rounded-xl px-4 py-3 shadow-2xl">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
        <span className="text-[12px] font-semibold text-popover-foreground">{item.name}</span>
      </div>
      <p className="text-[12px] text-muted-foreground">{formatCurrency(item.value as number)}</p>
      <p className="text-[11px] text-muted-foreground/70">{item.payload.pct.toFixed(1)}% of total</p>
    </div>
  );
}

export function ExpenseBreakdown({ data, loading = false }: ExpenseBreakdownProps) {
  const total = data.reduce((s, d) => s + parseFloat(d.total), 0);

  const chartData = data.map((d, i) => ({
    name: d.category_name ?? "Uncategorized",
    value: parseFloat(d.total),
    pct: total > 0 ? (parseFloat(d.total) / total) * 100 : 0,
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <div className="rounded-2xl border border-border bg-card backdrop-blur-sm p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground leading-none">Expense Breakdown</h3>
        <p className="text-[11px] text-muted-foreground mt-1 tracking-tight">By category distribution</p>
      </div>

      {loading ? (
        <div className="flex-1 min-h-[220px] rounded-xl bg-muted-foreground/10 animate-pulse" />
      ) : data.length === 0 ? (
        <div className="flex-1 min-h-[220px] flex items-center justify-center">
          <p className="text-[13px] text-muted-foreground/50 italic">No data recorded</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* donut area - fixed height to prevent pushing legend too far */}
          <div className="relative w-full h-[160px] sm:h-[180px] shrink-0 flex items-center justify-center -mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* center total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-0.5">
              <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-[0.1em]">Total</span>
              <span className="text-base font-bold text-foreground tabular-nums tracking-tight">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* legend area - scrollable container that takes remaining space */}
          <div className="flex-1 overflow-y-auto pr-2 mr-2 scrollbar-thin">
            <div className="flex flex-col gap-1">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between group py-1 border-b border-border/5 last:border-0 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-4">
                    <div className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[12px] text-muted-foreground truncate group-hover:text-foreground transition-colors font-medium">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-muted-foreground/40 tabular-nums font-medium">{item.pct.toFixed(0)}%</span>
                    <span className="text-[12px] font-semibold text-foreground/90 tabular-nums">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}