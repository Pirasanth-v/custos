import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface MonthSummary {
  month: string;
  total_income: string;
  total_expense: string;
}

interface CashFlowAnalysisProps {
  data: MonthSummary[];
  loading?: boolean;
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short" });
}

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    color: string;
    value: number | string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">{label}</p>
      {payload.map((p: { dataKey: string, color: string, value: number | string }) => ( 
        <div key={p.dataKey} className="flex justify-between items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[12px] text-muted-foreground capitalize">{p.dataKey}</span>
          </div>
          <span className="text-[12px] font-semibold text-popover-foreground">{formatCurrency(p.value as number)}</span>
        </div>
      ))}
    </div>
  );
}

// Custom rounded bar shape
function RoundedBar(props: { x: number; y: number; width: number; height: number; fill: string }) {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return null;
  const r = Math.min(4, width / 2);
  return (
    <path
      d={`M${x + r},${y} h${width - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${height - r} h${-width} v${-(height - r)} a${r},${r} 0 0 1 ${r},${-r}z`}
      fill={fill}
    />
  );
}

export function CashFlowAnalysis({ data, loading = false }: CashFlowAnalysisProps) {
  const chartData = data.map((d) => ({
    label: formatMonth(d.month),
    income: parseFloat(d.total_income),
    expense: parseFloat(d.total_expense),
  }));

  return (
    <div className="rounded-2xl border border-border bg-card backdrop-blur-sm p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Cash Flow Analysis</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Income vs expenses comparison</p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: "Income", color: "var(--color-chart-2)" },
            { label: "Expense", color: "var(--color-chart-3)" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-56 rounded-xl bg-muted animate-pulse" />
      ) : (
        <div className="h-56 -mx-2">
          {/* Defensive: Only render chart if chartData is a valid non-empty array */}
          {Array.isArray(chartData) && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)" }} />

                <Bar
                  dataKey="income"
                  fill="var(--color-chart-2)"
                  shape={(props) => (
                    <RoundedBar
                      {...props}
                      fill={props.fill ?? "var(--color-chart-2)"}
                    />
                  )}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="expense"
                  fill="var(--color-chart-3)"
                  shape={(props) => (
                    <RoundedBar
                      {...props}
                      fill={props.fill ?? "var(--color-chart-3)"}
                    />
                  )}
                  maxBarSize={28}
                />
       
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
              No data to display.
            </div>
          )}

        </div>
      )}
    </div>
  );
}