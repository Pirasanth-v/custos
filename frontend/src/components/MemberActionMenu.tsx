import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function MemberActionMenu({
  open,
  anchorRef,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        !ref.current?.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  const [rect, setRect] = useState<{
    top: number;
    left: number;
    bottom: number;
  }>({ top: 0, left: 0, bottom: 0 });

  useEffect(() => {
    if (open && anchorRef.current) {
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
      className="w-44 rounded-lg border border-border bg-card shadow-lg z-[9999]"
    >
      <button
        onClick={onEdit}
        className="flex items-center text-foreground gap-2 w-full px-4 py-2 text-sm hover:bg-muted"
      >
        <Pencil size={14} />
        Edit Role
      </button>

      <button
        onClick={onDelete}
        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
      >
        <Trash2 size={14} />
        Remove Member
      </button>
    </div>,
    document.body,
  );
}
