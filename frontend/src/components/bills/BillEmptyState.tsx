import { Receipt, SearchX } from "lucide-react";

interface BillEmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function BillEmptyState({ isFiltered, onClearFilters }: BillEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-background/30 py-20 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-background/80">
        {isFiltered ? (
          <SearchX className="h-7 w-7 text-muted-foreground" />
        ) : (
          <Receipt className="h-7 w-7 text-muted-foreground" />
        )}
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-background">
          0
        </span>
      </div>
      <div className="max-w-xs space-y-1.5">
        <p className="text-sm font-semibold text-foreground">
          {isFiltered ? "No results found" : "No bills attached"}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {isFiltered
            ? "Try adjusting your search or filter to find what you're looking for."
            : "Receipts and documents attached to this transaction will appear here."}
        </p>
      </div>
      {isFiltered && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 text-xs font-medium text-foreground transition hover:bg-accent"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}