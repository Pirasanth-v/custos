import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Receipt, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

// Hooks
import { useBills } from "@/features/bills/hooks/useGetBillsByOrg";
import { useDeleteBill } from "@/features/bills/hooks/useDeleteBill";
//import { useDownloadBill } from "@/features/bill/hooks/useDownloadBill";

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

  // Data
  const { data: bills = [], isLoading, isError, refetch } = useBills(orgId);
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

  // ── Render ──

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Page header */}
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-14 items-center gap-3">
            <Link
              to=".."
              relative="path"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
              title="Back to transaction"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-4 w-px bg-border/60" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Receipt className="h-3.5 w-3.5 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-none">
                  Bills & Receipts
                </h1>
                {!isLoading && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {bills.length} {bills.length === 1 ? "file" : "files"}{" "}
                    attached
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Error */}
        {isError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="flex-1 text-sm text-foreground">
              Failed to load bills.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {/* Stats row */}
        {!isLoading && bills.length > 0 && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total files" value={String(bills.length)} />
            <StatCard
              label="Images"
              value={String(
                bills.filter((b) => getFileType(b.mime_type) === "image")
                  .length,
              )}
            />
            <StatCard
              label="PDFs"
              value={String(
                bills.filter((b) => getFileType(b.mime_type) === "pdf").length,
              )}
            />
            <StatCard
              label="Total size"
              value={humanSizeTotal(
                bills.reduce((s, b) => s + b.file_size_bytes, 0),
              )}
            />
          </div>
        )}

        {/* Toolbar */}
        {!isLoading && bills.length > 0 && (
          <div className="mb-5">
            <BillToolbar
              filters={filters}
              onFiltersChange={(patch) =>
                setFilters((prev) => ({ ...prev, ...patch }))
              }
              view={view}
              onViewChange={setView}
              totalCount={bills.length}
              filteredCount={filtered.length}
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
          <BillGrid
            bills={filtered}
            view={view}
            onPreview={(i) => setPreviewIndex(i)}
            onDownload={download}
            onDelete={(bill) => setDeletingBill(bill)}
            downloadingId={downloadingId}
          />
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
