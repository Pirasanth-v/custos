import { Search, LayoutGrid, List, X } from "lucide-react";
import type { BillFilters, BillSortKey, BillView } from "@/features/bills/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BillToolbarProps {
  filters: BillFilters;
  onFiltersChange: (f: Partial<BillFilters>) => void;
  view: BillView;
  onViewChange: (v: BillView) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

const TYPE_OPTIONS: { value: BillFilters["type"]; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "image", label: "Images" },
  { value: "pdf", label: "PDFs" },
  { value: "other", label: "Other" },
];

const SORT_OPTIONS: { value: BillSortKey; label: string }[] = [
  { value: "uploaded_at", label: "Date uploaded" },
  { value: "file_name", label: "File name" },
  { value: "file_size", label: "File size" },
];

export function BillToolbar({
  filters,
  onFiltersChange,
  view,
  onViewChange,
  limit,
  onLimitChange,
}: BillToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: search + type filter */}
      <div className="flex flex-1 items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bills…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="h-9 w-full rounded-lg border border-border/70 bg-background/60 pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFiltersChange({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Type chips */}
        <div className="hidden sm:flex items-center gap-1">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onFiltersChange({ type: opt.value })}
              className={`h-9 rounded-lg px-3 text-xs font-medium transition ${filters.type === opt.value
                ? "bg-primary/15 text-primary border border-primary/30"
                : "border border-border/60 bg-background/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Mobile: type select */}
        <Select
          value={filters.type}
          onValueChange={(value) =>
            onFiltersChange({ type: value as BillFilters["type"] })
          }
        >
          <SelectTrigger
            aria-label="Filter by bill type"
            className="h-9 w-auto rounded-lg border border-border/60 bg-transparent! px-2 text-xs text-foreground shadow-none hover:bg-transparent! focus:bg-transparent! focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=open]:bg-transparent! sm:hidden"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent position="popper">
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Right: count + sort + view */}
      <div className="flex items-center gap-2">
        {/* Limit Selector */}
        <div className="hidden items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-2.5 sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-tight text-muted-foreground/70">Per page</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger
              aria-label="Items per page"
              className="h-8 w-[68px] border-0 bg-transparent! px-2 text-[13px] font-medium text-foreground shadow-none hover:bg-transparent! focus:bg-transparent! focus-visible:ring-0 data-[state=open]:bg-transparent!"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent position="popper" align="end">
              {[5, 10, 20, 50].map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-4 w-px bg-border/60 hidden sm:block" />

        {/* Sort */}
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/60 px-2">
          <Select
            value={filters.sortKey}
            onValueChange={(value) =>
              onFiltersChange({ sortKey: value as BillSortKey })
            }
          >
            <SelectTrigger
              aria-label="Sort bills"
              className="h-9 min-w-[110px] border-0 bg-transparent! px-2 text-xs text-foreground shadow-none hover:bg-transparent! focus:bg-transparent! focus-visible:ring-0 data-[state=open]:bg-transparent!"
            >
              <SelectValue />
            </SelectTrigger>

            <SelectContent position="popper" align="end">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            title={filters.sortDir === "asc" ? "Ascending" : "Descending"}
            onClick={() =>
              onFiltersChange({
                sortDir: filters.sortDir === "asc" ? "desc" : "asc",
              })
            }
            className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition hover:text-foreground"
          >
            <span className="text-[10px] font-bold">
              {filters.sortDir === "asc" ? "↑" : "↓"}
            </span>
          </button>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border border-border/60 bg-background/60">
          <ViewBtn
            active={view === "grid"}
            onClick={() => onViewChange("grid")}
            title="Grid view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </ViewBtn>
          <ViewBtn
            active={view === "list"}
            onClick={() => onViewChange("list")}
            title="List view"
          >
            <List className="h-3.5 w-3.5" />
          </ViewBtn>
        </div>
      </div>
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${active
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
    >
      {children}
    </button>
  );
}