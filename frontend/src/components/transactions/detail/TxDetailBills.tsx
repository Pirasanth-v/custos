import { useState } from "react";
import {
  FileText,
  Image,
  File,
  Download,
  Eye,
  Loader2,
  Paperclip,
} from "lucide-react";
import type { Bill } from "@/features/bills/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFileType(mime: string) {
  if (mime?.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function FileIcon({ mime, className = "" }: { mime: string; className?: string }) {
  const t = getFileType(mime);
  if (t === "image") return <Image className={`text-sky-400 ${className}`} />;
  if (t === "pdf") return <FileText className={`text-orange-400 ${className}`} />;
  return <File className={`text-muted-foreground ${className}`} />;
}

// ─── Single bill tile ─────────────────────────────────────────────────────────

function BillTile({
  bill,
  onPreview,
  onDownload,
  isDownloading,
}: {
  bill: Bill;
  onPreview: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}) {
  const [imgErr, setImgErr] = useState(false);
  const isImage = getFileType(bill.mime_type) === "image";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background/40 transition-all hover:border-border hover:bg-background/80">
      {/* Thumbnail */}
      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-muted/20"
        onClick={onPreview}
      >
        {isImage && !imgErr ? (
          <img
            src={bill.view_url}
            alt={bill.file_name}
            onError={() => setImgErr(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
            <FileIcon mime={bill.mime_type} className="h-7 w-7 opacity-50" />
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDownload(); }}
            disabled={isDownloading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="px-2.5 py-2">
        <p
          className="truncate text-[11px] font-medium text-foreground"
          title={bill.file_name}
        >
          {bill.file_name}
        </p>
        <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground">
          {humanSize(bill.file_size_bytes)}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type TxDetailBillsProps = {
  bills: Bill[];
  isLoading?: boolean;
  onPreview: (index: number) => void;
  onDownload: (bill: Bill) => void;
  downloadingId: string | null;
};

export function TxDetailBills({
  bills,
  isLoading,
  onPreview,
  onDownload,
  downloadingId,
}: TxDetailBillsProps) {
  return (
    <div className="px-6 pb-6">
      {/* Section header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-border/60" />
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Paperclip className="h-3 w-3" />
          Attachments
          {!isLoading && bills.length > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-muted-foreground">
              {bills.length}
            </span>
          )}
        </div>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] animate-pulse rounded-xl bg-muted/40"
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && bills.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 bg-background/20 py-7 text-center">
          <Paperclip className="h-5 w-5 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/60">No attachments</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && bills.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {bills.map((bill, i) => (
            <BillTile
              key={bill.id}
              bill={bill}
              onPreview={() => onPreview(i)}
              onDownload={() => onDownload(bill)}
              isDownloading={downloadingId === bill.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}