import type { Bill, BillView } from "@/features/bills/types";
import { BillCard } from "./BillCard";
import { BillRow } from "./BillRow";

interface BillGridProps {
  bills: Bill[];
  view: BillView;
  onPreview: (index: number) => void;
  onDownload: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  downloadingId: string | null;
}

export function BillGrid({
  bills,
  view,
  onPreview,
  onDownload,
  onDelete,
  downloadingId,
}: BillGridProps) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {bills.map((bill, i) => (
          <BillCard
            key={bill.id}
            bill={bill}
            index={i}
            onPreview={() => onPreview(i)}
            onDownload={() => onDownload(bill)}
            onDelete={() => onDelete(bill)}
            isDownloading={downloadingId === bill.id}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bills.map((bill, i) => (
        <BillRow
          key={bill.id}
          bill={bill}
          onPreview={() => onPreview(i)}
          onDownload={() => onDownload(bill)}
          onDelete={() => onDelete(bill)}
          isDownloading={downloadingId === bill.id}
        />
      ))}
    </div>
  );
}