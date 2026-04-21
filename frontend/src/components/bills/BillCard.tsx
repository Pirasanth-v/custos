import { useState } from "react";
import { Download, Trash2, Eye, Loader2 } from "lucide-react";
import type { Bill } from "@/features/bills/types";
import { BillTypeBadge, BillTypeIcon, humanSize, getFileType } from "./BillMetaBadge";
import { format } from "date-fns";

interface BillCardProps {
  bill: Bill;
  index: number;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  isDownloading: boolean;
}

export function BillCard({
  bill,
  onPreview,
  onDownload,
  onDelete,
  isDownloading,
}: BillCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const isImage = getFileType(bill.mime_type) === "image";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-black/10">
      {/* Thumbnail */}
      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-muted/30"
        onClick={onPreview}
      >
        {isImage && !imgErr ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
              </div>
            )}
            <img
              src={bill.view_url}
              alt={bill.file_name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgErr(true)}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <BillTypeIcon mimeType={bill.mime_type} className="h-10 w-10 opacity-40" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">
              {bill.mime_type === "application/pdf" ? "PDF Document" : "File"}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/40">
          <div className="flex scale-90 items-center gap-2 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDownload(); }}
              disabled={isDownloading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-50"
              title="Download"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/30 text-rose-300 backdrop-blur-sm transition hover:bg-rose-500/50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <p
          className="truncate text-[13px] font-medium text-foreground"
          title={bill.file_name}
        >
          {bill.file_name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <BillTypeBadge mimeType={bill.mime_type} />
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {humanSize(bill.file_size_bytes)}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {bill.created_at && !isNaN(Date.parse(bill.created_at))
            ? format(new Date(bill.created_at), "d MMM yyyy")
            : "Invalid date"}
     
        </p>
      </div>
    </div>
  );
}