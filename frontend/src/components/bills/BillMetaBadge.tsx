import { FileText, Image, File } from "lucide-react";
import type { BillFileType } from "@/features/bills/types";
import { getFileType } from "@/features/bills/utils";
import { humanSize } from "@/features/bills/utils";

const TYPE_CONFIG: Record<
  BillFileType,
  { label: string; icon: React.ElementType; cls: string; iconCls: string }
> = {
  image: {
    label: "Image",
    icon: Image,
    cls: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    iconCls: "text-sky-400",
  },
  pdf: {
    label: "PDF",
    icon: FileText,
    cls: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    iconCls: "text-orange-400",
  },
  other: {
    label: "File",
    icon: File,
    cls: "bg-muted/60 text-muted-foreground border-border/40",
    iconCls: "text-muted-foreground",
  },
};

export function BillTypeBadge({ mimeType }: { mimeType: string }) {
  const type = getFileType(mimeType);
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.cls}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  );
}

export function BillTypeIcon({
  mimeType,
  className = "",
}: {
  mimeType: string;
  className?: string;
}) {
  const type = getFileType(mimeType);
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  return <Icon className={`${cfg.iconCls} ${className}`} />;
}

export function BillSizeBadge({ bytes }: { bytes: number }) {
  return (
    <span className="text-[11px] tabular-nums text-muted-foreground">
      {humanSize(bytes)}
    </span>
  );
}