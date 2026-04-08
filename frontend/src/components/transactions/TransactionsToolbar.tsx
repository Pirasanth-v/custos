import type { TransactionType } from "@/features/transaction/types";
import { Filter, Search } from "lucide-react";

type TransactionsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  type: TransactionType | "all";
  onTypeChange: (value: TransactionType | "all") => void;
};

export default function TransactionsToolbar({
  search,
  onSearchChange,
  type,
  onTypeChange,
}: TransactionsToolbarProps) {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search description, amount..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </div>

          <div className="relative w-full sm:w-56">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value as TransactionType)}
              className="h-11 w-full appearance-none rounded-xl border border-input bg-background pl-10 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

