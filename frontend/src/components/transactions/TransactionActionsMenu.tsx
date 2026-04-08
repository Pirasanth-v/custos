import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type React from "react";

type Props = {
  open: boolean;
  anchorRef?: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function TransactionActionsMenu({
  open,
  anchorRef,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const [rect, setRect] = useState<{
    top: number;
    left: number;
    bottom: number;
  }>({ top: 0, left: 0, bottom: 0 });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        !ref.current?.contains(e.target as Node) &&
        !anchorRef?.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (open && anchorRef?.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, bottom: r.bottom });
    }
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: rect.bottom + 8,
        left: rect.left - 120,
      }}
      className="z-[9999] w-44 rounded-lg border border-border bg-card shadow-lg"
    >
      <button
        onClick={() => {
          onClose();
          onEdit();
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
      >
        <Pencil size={14} />
        Edit
      </button>

      <button
        onClick={() => {
          onClose();
          onDelete();
        }}
        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>,
    document.body,
  );
}

