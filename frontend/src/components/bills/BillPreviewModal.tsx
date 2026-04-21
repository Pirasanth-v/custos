import { useEffect, useState } from "react";
import {
  X,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { Bill } from "@/features/bills/types";
import { getFileType, humanSize } from "@/features/bills/utils";
import { format } from "date-fns";

interface BillPreviewModalProps {
  bills: Bill[];
  initialIndex: number;
  onClose: () => void;
  onDelete: (bill: Bill) => void;
  onDownload: (bill: Bill) => void;
  downloadingId: string | null;
}

export function BillPreviewModal({
  bills,
  initialIndex,
  onClose,
  onDelete,
  onDownload,
  downloadingId,
}: BillPreviewModalProps) {
  const [idx, setIdx] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const bill = bills[idx];
  const fileType = getFileType(bill?.mime_type ?? "");

  function prev() {
    setIdx((i) => (i > 0 ? i - 1 : bills.length - 1));
  }
  function next() {
    setIdx((i) => (i < bills.length - 1 ? i + 1 : 0));
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (!bill) return null;

  const canZoomIn = zoom < 3;
  const canZoomOut = zoom > 0.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
      {/* Container */}
      <div className="relative z-10 w-full max-w-5xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/8 bg-black/60 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/8">
            <span className="text-xs font-semibold text-white/60">
              {idx + 1}/{bills.length}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/90">
              {bill.file_name}
            </p>
            <p className="text-[11px] text-white/40">
              {humanSize(bill.file_size_bytes)} ·{" "}
              {format(new Date(bill.created_at), "d MMM yyyy, HH:mm")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {fileType === "image" && (
            <>
              <ToolBtn
                onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                disabled={!canZoomIn}
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                disabled={!canZoomOut}
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </ToolBtn>
              <ToolBtn
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title="Rotate"
              >
                <RotateCw className="h-4 w-4" />
              </ToolBtn>
              <div className="mx-1 h-5 w-px bg-white/10" />
            </>
          )}
          <ToolBtn
            onClick={() => window.open(bill.view_url, "_blank", "noopener,noreferrer")}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </ToolBtn>
          <ToolBtn
            onClick={() => onDownload(bill)}
            disabled={downloadingId === bill.id}
            title="Download"
          >
            {downloadingId === bill.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </ToolBtn>
          <ToolBtn
            onClick={() => onDelete(bill)}
            title="Delete"
            className="hover:bg-destructive/20 hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </ToolBtn>
          <div className="mx-1 h-5 w-px bg-white/10" />
          <ToolBtn onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </ToolBtn>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Prev/next arrows */}
        {bills.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur transition hover:border-white/25 hover:bg-black/70 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 backdrop-blur transition hover:border-white/25 hover:bg-black/70 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {fileType === "image" ? (
          <div className="flex h-full w-full items-center justify-center p-8">
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/30" />
              </div>
            )}
            <img
              key={bill.id}
              src={bill.view_url}
              alt={bill.file_name}
              onLoad={() => setImgLoaded(true)}
              className="max-h-full max-w-full select-none object-contain transition-all duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                opacity: imgLoaded ? 1 : 0,
              }}
            />
          </div>
        ) : fileType === "pdf" ? (
          <iframe
            key={bill.id}
            src={`${bill.view_url}#toolbar=0`}
            className="h-full w-full"
            title={bill.file_name}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <ExternalLink className="h-8 w-8 text-white/40" />
            </div>
            <p className="text-sm text-white/60">
              Preview not available for this file type.
            </p>
            <button
              onClick={() => onDownload(bill)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-4 text-sm font-medium text-white/80 transition hover:bg-white/15"
            >
              <Download className="h-4 w-4" />
              Download file
            </button>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {bills.length > 1 && (
        <div className="shrink-0 border-t border-white/8 bg-black/60 px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {bills.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setIdx(i)}
                className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 ${
                  i === idx
                    ? "border-primary shadow-[0_0_0_2px_rgba(99,102,241,0.4)]"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                {getFileType(b.mime_type) === "image" ? (
                  <img
                    src={b.view_url}
                    alt={b.file_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/8 text-[8px] font-bold uppercase text-white/60">
                    {b.mime_type === "application/pdf" ? "PDF" : "FILE"}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function ToolBtn({
  onClick,
  disabled,
  title,
  children,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  );
}