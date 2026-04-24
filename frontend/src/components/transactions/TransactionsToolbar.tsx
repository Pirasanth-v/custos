import type { Account } from "@/features/account/types";
import type { Category } from "@/features/category/types";
import type {
  TransactionType,
  TransactionFilters,
} from "@/features/transaction/types";
import { Search, ArrowUpDown, X, CreditCard, Tag, Filter } from "lucide-react";
import { useState } from "react";

type TransactionsToolbarProps = {
  filters: TransactionFilters;
  onFiltersChange: (patch: Partial<TransactionFilters>) => void;
  accounts: Account[];
  categories: Category[];
};

const TYPE_OPTIONS: { value: TransactionType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfer" },
];

const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "amount", label: "Amount" },
];

export default function TransactionsToolbar({
  filters,
  onFiltersChange,
  accounts,
  categories,
}: TransactionsToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const isFiltered =
    filters.search ||
    filters.type !== "all" ||
    filters.account_ids?.length ||
    filters.category_ids?.length;

  const toggleAccountId = (id: string) => {
    const current = filters.account_ids || [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    onFiltersChange({ account_ids: next });
  };

  const toggleCategoryId = (id: string) => {
    const current = filters.category_ids || [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    onFiltersChange({ category_ids: next });
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search records..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="h-10 w-full rounded-xl border border-border/60 bg-card px-11 text-sm text-foreground shadow-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none placeholder:text-muted-foreground/40"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ search: "" })}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-2xl p-1 hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <div className="h-10 flex p-1 bg-muted/50 rounded-xl border border-border/40">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFiltersChange({ type: opt.value })}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filters.type === opt.value
                    ? "bg-card text-primary shadow-sm ring-1 ring-black/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-border/60 mx-1 hidden lg:block" />

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all border ${
              showFilters || (filters.account_ids?.length || 0) > 0 || (filters.category_ids?.length || 0) > 0
                ? "bg-primary/5 border-primary/20 text-primary"
                : "bg-card border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            <Filter className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            Filters
            {(filters.account_ids?.length || 0) + (filters.category_ids?.length || 0) > 0 && (
               <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                 {(filters.account_ids?.length || 0) + (filters.category_ids?.length || 0)}
               </span>
            )}
          </button>

          <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card px-3 h-10 shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/60" />
            <select
              value={filters.sort_key}
              onChange={(e) => onFiltersChange({ sort_key: e.target.value })}
              className="bg-transparent text-xs font-bold text-muted-foreground focus:outline-none h-full pr-1 cursor-pointer appearance-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option className="bg-background" key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                onFiltersChange({
                  sort_dir: filters.sort_dir === "asc" ? "desc" : "asc",
                })
              }
              className="ml-1 h-6 w-6 rounded-lg hover:bg-muted flex items-center justify-center text-[10px] font-black text-primary transition-colors"
            >
              {filters.sort_dir === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {isFiltered ? (
            <button
              onClick={() =>
                onFiltersChange({
                  search: "",
                  type: "all",
                  account_ids: [],
                  category_ids: [],
                })
              }
              className="flex h-10 items-center gap-2 rounded-xl bg-destructive/5 px-4 text-xs font-bold text-destructive transition-all hover:bg-destructive/10"
            >
              Reset
            </button>
          ) : null}
     
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-1">
              <CreditCard className="h-3.5 w-3.5" />
              Accounts
            </div>
            <div className="flex flex-wrap gap-2">
              {accounts.map((acc) => {
                const active = filters.account_ids?.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    onClick={() => toggleAccountId(acc.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                        : "bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {acc.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/60 px-1">
              <Tag className="h-3.5 w-3.5" />
              Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const active = filters.category_ids?.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategoryId(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                        : "bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

