import { useId } from "react";
import { type LucideIcon } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface SparkPoint {
  v: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number; // percentage, positive = up, negative = down
  icon: LucideIcon;
  accent: string; // tailwind color class for icon bg e.g. "bg-indigo-500/20"
  iconColor: string; // e.g. "text-indigo-400"
  sparkData?: SparkPoint[];
  sparkColor?: string;
  loading?: boolean;
}

function ChangeChip({ change }: { change: number }) {
  const up = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up
        ? "bg-success/15 text-success"
        : "bg-destructive/15 text-destructive"
        }`}
    >
      <span>{up ? "▲" : "▼"}</span>
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  accent,
  iconColor,
  sparkData,
  sparkColor = "var(--color-primary)",
  loading = false,
}: StatCardProps) {
  const sparkId = useId();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-sm p-5 flex flex-col gap-4 group hover:border-border/80 hover:shadow-sm transition-all duration-300">
      {/* top row */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            {title}
          </span>
          {loading ? (
            <div className="h-8 w-32 rounded-lg bg-muted animate-pulse" />
          ) : (
            <span className="text-2xl font-bold text-card-foreground tracking-tight leading-none">
              {value}
            </span>
          )}
        </div>
        <div className={`p-2.5 rounded-xl ${accent}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>

      {/* sparkline */}
      {sparkData && (
        <div className="h-10 -mx-1">
          {/* Defensive check to prevent rendering if sparkData is null or undefined */}
          {sparkData && Array.isArray(sparkData) && sparkData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={sparkId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="white" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="white" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={sparkColor}
                  strokeWidth={1.5}
                  fill={`url(#${sparkId})`}
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}

        </div>
      )}

      {/* bottom row */}
      {change !== undefined && (
        <div className="flex items-center gap-2">
          <ChangeChip change={change} />
          <span className="text-[11px] text-muted-foreground">vs last month</span>
        </div>
      )}

      {/* subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${sparkColor}08 0%, transparent 70%)` }}
      />
    </div>
  );
}