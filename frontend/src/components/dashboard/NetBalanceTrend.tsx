import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
  } from "recharts";
  import { TrendingUp } from "lucide-react";
  
  interface MonthSummary {
    month: string;   // ISO string from backend e.g. "2024-01-01T00:00:00Z"
    total_income: string;
    total_expense: string;
  }
  
  interface NetBalanceTrendProps {
    data: MonthSummary[];
    loading?: boolean;
  }
  
  function formatMonth(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  
  function formatCurrency(val: number) {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  }
  
  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      dataKey: string;
      value: number;
    }>;
    label?: string;
  }
  function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    const income = payload.find((p: { dataKey: string; value: number }) => p.dataKey === "income")?.value ?? 0;
    const expense = payload.find((p: { dataKey: string; value: number }) => p.dataKey === "expense")?.value ?? 0;
    const net = (income as number) - (expense as number);
  
    return (
      <div className="bg-popover border border-border rounded-xl px-4 py-3 shadow-2xl min-w-[160px]">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center gap-6">
            <span className="text-[12px] text-muted-foreground">Income</span>
            <span className="text-[12px] font-semibold text-chart-2">{formatCurrency(income as number)}</span>
          </div>
          <div className="flex justify-between items-center gap-6">
            <span className="text-[12px] text-muted-foreground">Expense</span>
            <span className="text-[12px] font-semibold text-chart-3">{formatCurrency(expense as number)}</span>
          </div>
          <div className="h-px bg-border my-0.5" />
          <div className="flex justify-between items-center gap-6">
            <span className="text-[12px] text-muted-foreground">Net</span>
            <span className={`text-[12px] font-bold ${net >= 0 ? "text-chart-1" : "text-chart-3"}`}>
              {net >= 0 ? "+" : ""}{formatCurrency(net)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  export function NetBalanceTrend({ data, loading = false }: NetBalanceTrendProps) {
    const chartData = data.map((d) => ({
      label: formatMonth(d.month),
      income: parseFloat(d.total_income),
      expense: parseFloat(d.total_expense),
      net: parseFloat(d.total_income) - parseFloat(d.total_expense),
    }));
  
    return (
      <div className="rounded-2xl border border-border bg-card backdrop-blur-sm p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Net Balance Trend</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{data.length}-month performance overview</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-accent text-accent-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-chart-1" />
            <span className="text-[11px] font-medium text-muted-foreground">Trend</span>
          </div>
        </div>
  
        {/* legend */}
        <div className="flex items-center gap-5">
          {[
            { label: "Income", color: "var(--color-chart-2)" },
            { label: "Expense", color: "var(--color-chart-3)" },
            { label: "Net", color: "var(--color-chart-1)" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
  
        {/* chart */}
        {loading ? (
          <div className="h-64 rounded-xl bg-muted-foreground/10 animate-pulse" />
        ) : (
          <div className="h-48 sm:h-64 -mx-2">
            {/* Defensive: Only render chart if chartData is a valid non-empty array */}
            {Array.isArray(chartData) && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    {[
                      { id: "income", color: "var(--color-chart-2)" },
                      { id: "expense", color: "var(--color-chart-3)" },
                      { id: "net", color: "var(--color-chart-1)" },
                    ].map(({ id, color }) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
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
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="income" stroke="var(--color-chart-2)" strokeWidth={1.5} fill="url(#income)" dot={false} />
                  <Area type="monotone" dataKey="expense" stroke="var(--color-chart-3)" strokeWidth={1.5} fill="url(#expense)" dot={false} />
                  <Area type="monotone" dataKey="net" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#net)" dot={false} />
                </AreaChart>
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