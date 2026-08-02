import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";

// Hooks
import { useBills } from "@/features/bills/hooks/useGetBillsByOrg";
import { useDeleteBill } from "@/features/bills/hooks/useDeleteBill";

// Components
import { BillToolbar } from "@/components/bills/BillToolBar";
import { BillGrid } from "@/components/bills/BillGrid";
import { BillEmptyState } from "@/components/bills/BillEmptyState";
import { BillPreviewModal } from "@/components/bills/BillPreviewModal";
import { BillDeleteDialog } from "@/components/bills/BillDeleteDialog";
import {
  BillSkeletonGrid,
  BillSkeletonList,
} from "@/components/bills/BillSkeleton";

// Types
import type { Bill, BillFilters, BillView } from "@/features/bills/types";
import { getFileType } from "@/features/bills/utils";

// Store
import useOrgStore from "@/store/orgStore";
import { useBillStats } from "@/features/bills/hooks/useGetStats";

// ─── Default filter state ─────────────────────────────────────────────────────

const DEFAULT_FILTERS: BillFilters = {
  search: "",
  type: "all",
  sortKey: "uploaded_at",
  sortDir: "desc",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillsPage() {
  const { txId = "" } = useParams<{ txId: string }>();
  const { currentOrg } = useOrgStore();
  const orgId = currentOrg?.id ?? "";

  // State
  const [filters, setFilters] = useState<BillFilters>(DEFAULT_FILTERS);
  const [view, setView] = useState<BillView>("grid");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Pagination State
  const [limit, setLimit] = useState<number>(10);
  const [cursor, setCursor] = useState<string>("");
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  // Data
  const {
    data: billsResponse,
    isLoading,
    isError,
    refetch,
  } = useBills(orgId, { cursor, limit });
  const bills = billsResponse?.data ?? [];
  const hasNext = billsResponse?.has_more ?? false;
  const nextCursor = billsResponse?.next ?? "";
  const { data: stats } = useBillStats(orgId);

  const { mutateAsync: deleteBillMutation, isPending: isDeleting } =
    useDeleteBill(orgId, txId);

  const download = async (bill: Bill) => {
    try {
      setDownloadingId(bill.id);
      const res = await fetch(bill.view_url);
      if (!res.ok) {
        throw new Error("Failed to fetch the file.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = bill.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Optionally handle error (e.g., show a toast/alert)
      console.error("Bill download failed:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  // Filtering + sorting
  const filtered = useMemo(() => {
    let result = [...bills];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((b) => b.file_name.toLowerCase().includes(q));
    }

    if (filters.type !== "all") {
      result = result.filter((b) => getFileType(b.mime_type) === filters.type);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (filters.sortKey === "uploaded_at") {
        cmp =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (filters.sortKey === "file_name") {
        cmp = a.file_name.localeCompare(b.file_name);
      } else if (filters.sortKey === "file_size") {
        cmp = a.file_size_bytes - b.file_size_bytes;
      }
      return filters.sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [bills, filters]);

  // const isFiltered = filters.search.length > 0 || filters.type !== "all";

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  async function handleDelete() {
    if (!deletingBill) return;
    await deleteBillMutation(deletingBill.id);
    setDeletingBill(null);
    // Close preview if deleting the currently previewed bill
    if (previewIndex !== null) {
      const current = filtered[previewIndex];
      if (current?.id === deletingBill.id) {
        setPreviewIndex(null);
      }
    }
  }

  // Pagination Actions
  function handleNextPage() {
    if (!hasNext) return;
    setCursorStack((prev) => [...prev, cursor]);
    setCursor(nextCursor);
  }

  function handlePrevPage() {
    if (cursorStack.length === 0) return;
    const newStack = [...cursorStack];
    const prevCursor = newStack.pop() ?? "";
    setCursorStack(newStack);
    setCursor(prevCursor);
  }

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit);
    setCursor("");
    setCursorStack([]);
  }

  // ── Render ──

  return (
    <div className="flex min-h-full min-w-0 flex-col bg-background">
      {/* Page header */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <div className="mb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Bills & Receipts
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Manage your uploaded invoices, bills, and digital receipts here.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {/* Error */}
        {isError && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-3 py-3.5 sm:flex-nowrap sm:px-4">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="min-w-0 flex-1 text-sm text-foreground">
              Failed to load bills.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {/* Stats row */}
        {!isLoading && bills.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <StatCard
              label="Total files"
              value={String(stats?.total_bills ?? "—")}
            />
            <StatCard
              label="Images"
              value={String(stats?.image_count ?? "—")}
            />
            <StatCard label="PDFs" value={String(stats?.pdf_count ?? "—")} />
            <StatCard
              label="Total size"
              value={humanSizeTotal(stats?.total_file_size_bytes ?? 0)}
            />
          </div>
        )}

        {/* Toolbar */}
        {!isLoading && bills.length > 0 && (
          <div className="mb-5 min-w-0">
            <BillToolbar
              filters={filters}
              onFiltersChange={(patch) =>
                setFilters((prev) => ({ ...prev, ...patch }))
              }
              view={view}
              onViewChange={setView}
              limit={limit}
              onLimitChange={handleLimitChange}
            />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          view === "grid" ? (
            <BillSkeletonGrid />
          ) : (
            <BillSkeletonList />
          )
        ) : bills.length === 0 ? (
          <BillEmptyState />
        ) : filtered.length === 0 ? (
          <BillEmptyState isFiltered onClearFilters={clearFilters} />
        ) : (
          <>
            <BillGrid
              bills={filtered}
              view={view}
              onPreview={(i) => setPreviewIndex(i)}
              onDownload={download}
              onDelete={(bill) => setDeletingBill(bill)}
              downloadingId={downloadingId}
            />

            {/* Pagination Controls */}
            <div className="mt-6 flex flex-col items-center gap-4 border-t border-border/40 pt-5 sm:mt-8 sm:flex-row sm:justify-end sm:pt-6">
              <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex sm:w-auto sm:gap-3">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={cursorStack.length === 0 || isLoading}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-40 sm:h-8"
                >
                  Previous
                </button>
                <div className="whitespace-nowrap text-center text-xs font-medium text-muted-foreground">
                  Page {cursorStack.length + 1}
                </div>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!hasNext || isLoading}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-40 sm:h-8"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Preview modal */}
      {previewIndex !== null && filtered.length > 0 && (
        <BillPreviewModal
          key={previewIndex}
          bills={filtered}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onDelete={(bill) => {
            setPreviewIndex(null);
            setDeletingBill(bill);
          }}
          onDownload={download}
          downloadingId={downloadingId}
        />
      )}

      {/* Delete dialog */}
      {deletingBill && (
        <BillDeleteDialog
          bill={deletingBill}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingBill(null)}
        />
      )}
    </div>
  );
}

// ─── Local helpers ────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function humanSizeTotal(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}
