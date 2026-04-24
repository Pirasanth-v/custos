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
        <div className="flex flex-col">
          {/* Close button — floating top-right */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ── Amount hero + status ──────────────────────────────── */}
          <TxDetailHeader
            transaction={transaction}
            currencyCode={currencyCode}
          />

          {/* ── Metadata grid ─────────────────────────────────────── */}
          <TxDetailMeta
            transaction={transaction}
            accounts={accounts}
            categories={categories}
          />

          {/* ── Bills ─────────────────────────────────────────────── */}
          <TxDetailBills
            bills={bills}
            isLoading={billsLoading}
            onPreview={(i) => setPreviewIndex(i)}
            onDownload={download}
            downloadingId={downloadingId}
          />
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