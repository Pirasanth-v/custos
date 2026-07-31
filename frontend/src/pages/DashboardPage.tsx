import { Wallet, TrendingUp, TrendingDown, Clock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useDashboard } from "@/features/dashboard/hooks/useGetDashboard";
import useOrgStore from "@/store/orgStore";

import { StatCard } from "@/components/dashboard/StatCard";
import { NetBalanceTrend } from "@/components/dashboard/NetBalanceTrend";
import { CashFlowAnalysis } from "@/components/dashboard/CashFlowAnalysis";
import { ExpenseBreakdown } from "@/components/dashboard/ExpenseBreakdown";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(val: string | number) {
  const n = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// compute month-over-month change from trend data
function monthOverMonthChange(
  trend: { total_income: string; total_expense: string }[],
  field: "total_income" | "total_expense",
): number {
  if (trend.length < 2) return 0;
  const current = parseFloat(trend[trend.length - 1][field]);
  const previous = parseFloat(trend[trend.length - 2][field]);
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

// build sparkline from last 7 data points
function toSparkData(
  trend: { total_income: string; total_expense: string }[],
  field: "total_income" | "total_expense",
) {
  return trend.slice(-7).map((d) => ({ v: parseFloat(d[field]) }));
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id ?? "";

  const { data, isLoading } = useDashboard(orgId, 6);
  const monthly_trend = Array.isArray(data?.monthly) ? data.monthly : [];

  const incomeChange = monthOverMonthChange(monthly_trend, "total_income");
  const expenseChange = monthOverMonthChange(monthly_trend, "total_expense");
  const incomeSpark = toSparkData(monthly_trend, "total_income");
  const expenseSpark = toSparkData(monthly_trend, "total_expense");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {currentOrg?.name ?? "Your organization"} · financial overview
          </p>
        </div>
        <button
          onClick={() => navigate(`/transactions`)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          New Transaction
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          title="Total Balance"
          value={formatCurrency(data?.net_balance ?? "0")}
          icon={Wallet}
          accent="bg-chart-1/15"
          iconColor="text-chart-1"
          sparkData={incomeSpark}
          sparkColor="var(--color-chart-1)"
          loading={isLoading}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthly_trend?.at(-1)?.total_income ?? "0")}
          change={incomeChange}
          icon={TrendingUp}
          accent="bg-chart-2/15"
          iconColor="text-chart-2"
          sparkData={incomeSpark}
          sparkColor="var(--color-chart-2)"
          loading={isLoading}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthly_trend?.at(-1)?.total_expense ?? "0")}
          change={-Math.abs(expenseChange)}
          icon={TrendingDown}
          accent="bg-chart-3/15"
          iconColor="text-chart-3"
          sparkData={expenseSpark}
          sparkColor="var(--color-chart-3)"
          loading={isLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={String(data?.pending_count ?? 0)}
          icon={Clock}
          accent="bg-chart-4/15"
          iconColor="text-chart-4"
          sparkColor="var(--color-chart-4)"
          loading={isLoading}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
        {/* Net balance trend — takes 2 cols on xl */}
        <div className="xl:col-span-2">
          <NetBalanceTrend data={monthly_trend} loading={isLoading} />
        </div>

        {/* Expense breakdown — 1 col */}
        <ExpenseBreakdown data={data?.categories ?? []} loading={isLoading} />
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
        {/* Cash flow — 2 cols on xl */}
        <div className="xl:col-span-2">
          <CashFlowAnalysis data={monthly_trend} loading={isLoading} />
        </div>

        {/* Recent activity — 1 col */}
        <RecentActivity
          data={data?.recent ?? []}
          orgId={orgId}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
