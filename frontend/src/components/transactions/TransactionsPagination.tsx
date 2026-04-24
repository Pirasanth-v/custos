type TransactionsPaginationProps = {
  totalLoaded: number;
  visibleCount: number;
  currentPage: number;
  totalPages: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  isFetchingNextPage: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export default function TransactionsPagination({
  totalLoaded,
  visibleCount,
  currentPage,
  totalPages,
  canGoPrev,
  canGoNext,
  isFetchingNextPage,
  onPrev,
  onNext,
}: TransactionsPaginationProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{visibleCount}</span>{" "}
        of <span className="font-medium text-foreground">{totalLoaded}</span>{" "}
        loaded
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Page{" "}
          <span className="font-medium text-foreground">{currentPage}</span> /{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </span>

        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev || isFetchingNextPage}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isFetchingNextPage}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFetchingNextPage ? "Loading..." : "Next"}
        </button>
      </div>
    </div>
  );
}

