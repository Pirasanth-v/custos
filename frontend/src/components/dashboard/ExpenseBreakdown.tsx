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
    <div className="rounded-2xl border border-border bg-card backdrop-blur-sm p-6 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Expense Breakdown</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">By category distribution</p>
      </div>

      {loading ? (
        <div className="h-56 rounded-xl bg-muted animate-pulse" />
      ) : data.length === 0 ? (
        <div className="h-56 flex items-center justify-center">
          <p className="text-[13px] text-muted-foreground/50">No expense data yet</p>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {/* donut */}
          <div className="shrink-0 w-40 h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* center total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Total</span>
              <span className="text-sm font-bold text-foreground leading-tight">{formatCurrency(total)}</span>
            </div>
          </div>

        {/* legend */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[12px] text-muted-foreground truncate group-hover:text-foreground transition-colors">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground/70">{item.pct.toFixed(1)}%</span>
                  <span className="text-[12px] font-semibold text-foreground/80">{formatCurrency(item.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}