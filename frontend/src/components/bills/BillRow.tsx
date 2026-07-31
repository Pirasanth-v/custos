import { useState } from "react";
import { Download, Trash2, Eye, Loader2 } from "lucide-react";
import type { Bill } from "@/features/bills/types";
import { BillTypeBadge, BillTypeIcon } from "./BillMetaBadge";
import { getFileType, humanSize } from "@/features/bills/utils";
import { format } from "date-fns";

interface BillRowProps {
  bill: Bill;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  isDownloading: boolean;
}

export function BillRow({
  bill,
  onPreview,
  onDownload,
  onDelete,
  isDownloading,
}: BillRowProps) {
  const [imgErr, setImgErr] = useState(false);
  const isImage = getFileType(bill.mime_type) === "image";

  return (
    <div className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/50 bg-card px-3 py-3 transition-all duration-150 hover:border-border hover:bg-accent/30 sm:flex sm:gap-3.5 sm:px-4">
      {/* Thumb */}
      <div
        className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-muted/30"
        onClick={onPreview}
      >
        {isImage && !imgErr ? (
          <img
            src={bill.view_url}
            alt={bill.file_name}
            onError={() => setImgErr(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BillTypeIcon mimeType={bill.mime_type} className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <button
          type="button"
          onClick={onPreview}
          className="block w-full truncate text-left text-[13px] font-medium text-foreground transition hover:text-primary"
          title={bill.file_name}
        >
          {bill.file_name}
        </button>
        <div className="flex flex-col items-start gap-0.5 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:gap-2">
          <span className="tabular-nums">{humanSize(bill.file_size_bytes)}</span>
          <span className="hidden text-border sm:inline">·</span>
          <span className="whitespace-nowrap">
            {bill.created_at && !isNaN(Date.parse(bill.created_at))
              ? format(new Date(bill.created_at), "d MMM yyyy, HH:mm")
              : "Invalid date"}
          </span>

        </div>
      </div>

      {/* Badge */}
      <div className="hidden sm:block">
        <BillTypeBadge mimeType={bill.mime_type} />
      </div>

      {/* Actions - visible on hover */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-150 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100">
        <ActionBtn onClick={onPreview} title="Preview">
          <Eye className="h-3.5 w-3.5" />
        </ActionBtn>
        <ActionBtn
          onClick={onDownload}
          disabled={isDownloading}
          title="Download"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </ActionBtn>
        <ActionBtn
          onClick={onDelete}
          title="Delete"
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ActionBtn>
      </div>
    </div >
  );
}

function ActionBtn({
  onClick,
  disabled,
  title,
  className = "",
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground/70 transition hover:border-border hover:bg-muted hover:text-foreground disabled:opacity-40 sm:h-7 sm:w-7 ${className}`}
    >
      {children}
    </button>
  );
}