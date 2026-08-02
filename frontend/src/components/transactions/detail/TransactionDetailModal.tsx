import { useState } from "react";
import { X } from "lucide-react";
import Modal from "@/components/ui/modal";
import { TxDetailHeader } from "./TxDetailHeader";
import { TxDetailMeta } from "./TxDetailMeta";
import { TxDetailBills } from "./TxDetailBills";
import { BillPreviewModal } from "@/components/bills/BillPreviewModal";
import { useBillsByTransaction } from "@/features/bills/hooks/useGetBillsByTransaction";
import type { Transaction } from "@/features/transaction/types";
import type { Account } from "@/features/account/types";
import type { Category } from "@/features/category/types";

type TransactionDetailModalProps = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  orgId: string;
  accounts: Account[];
  categories: Category[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  /** currency code to display next to amount — pulled from the from_account */
  currencyCode?: string;
};

export default function TransactionDetailModal({
  open,
  onClose,
  transaction,
  orgId,
  accounts,
  categories,
  currencyCode,
}: TransactionDetailModalProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const txId = transaction?.id ?? "";
  const { data: bills = [], isLoading: billsLoading } = useBillsByTransaction(
    orgId,
    txId,
  );

  const download = (bill: { view_url: string }) => {
    window.open(bill.view_url, "_blank");
  };
  const downloadingId = null;

  if (!open || !transaction) return null;

  return (
    <>
      <Modal open={open} onClose={onClose} maxWidthClass="max-w-lg">
        <div className="flex min-w-0 flex-col">
          {/* Close button — floating top-right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transaction details"
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground sm:right-4 sm:top-4"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ── Amount hero + status ──────────────────────────────── */}
          <div className="min-w-0 pr-10 sm:pr-12">
            <TxDetailHeader
              transaction={transaction}
              currencyCode={currencyCode}
            />
          </div>

          {/* ── Metadata grid ─────────────────────────────────────── */}
          <div className="min-w-0">
            <TxDetailMeta
              transaction={transaction}
              accounts={accounts}
              categories={categories}
            />
          </div>

          {/* ── Bills ─────────────────────────────────────────────── */}
          <div className="min-w-0">
            <TxDetailBills
              bills={bills}
              isLoading={billsLoading}
              onPreview={(i) => setPreviewIndex(i)}
              onDownload={download}
              downloadingId={downloadingId}
            />
          </div>
        </div>
      </Modal>

      {/* Bill lightbox — rendered outside the modal stack */}
      {previewIndex !== null && bills.length > 0 && (
        <BillPreviewModal
          bills={bills}
          initialIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onDelete={() => setPreviewIndex(null)} // read-only view; no delete from detail
          onDownload={download}
          downloadingId={downloadingId}
        />
      )}
    </>
  );
}