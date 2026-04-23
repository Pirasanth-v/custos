import { Eye, Pencil, Trash2 } from "lucide-react";
import type React from "react";

type Props = {
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
};

export default function TransactionActionsMenu({
  onEdit,
  onDelete,
  onView,
}: Props) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-1">
      <ActionBtn onClick={onView} title="View Details">
        <Eye className="h-3.5 w-3.5" />
      </ActionBtn>
      <ActionBtn onClick={onEdit} title="Edit Transaction">
        <Pencil className="h-3.5 w-3.5" />
      </ActionBtn>
      <ActionBtn
        onClick={onDelete}
        title="Delete Transaction"
        className="hover:bg-destructive/60 hover:text-destructive text-destructive/80"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </ActionBtn>
    </div>
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
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition hover:border-border hover:text-foreground disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}
