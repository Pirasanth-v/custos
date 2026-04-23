import { format, parseISO } from "date-fns";

type TxAuditRowProps = {
  action: "Created" | "Last edited";
  name: string;
  iso: string;
  isMe?: boolean;
};

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function safeFormat(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yyyy 'at' HH:mm");
  } catch {
    return iso;
  }
}

// Deterministic muted color per name initial
const AVATAR_COLORS = [
  "bg-indigo-500/20 text-indigo-400 ring-indigo-500/20",
  "bg-emerald-500/20 text-emerald-400 ring-emerald-500/20",
  "bg-amber-500/20 text-amber-400 ring-amber-500/20",
  "bg-rose-500/20 text-rose-400 ring-rose-500/20",
  "bg-sky-500/20 text-sky-400 ring-sky-500/20",
  "bg-violet-500/20 text-violet-400 ring-violet-500/20",
];

function avatarColor(name: string): string {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) ?? 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function TxAuditRow({ action, name, iso, isMe }: TxAuditRowProps) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Avatar */}
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-1 ${avatarColor(name)}`}
      >
        {initials(name)}
      </div>

      {/* Text */}
      <p className="text-[12px] leading-none text-muted-foreground">
        <span className="text-muted-foreground/60">{action} by </span>
        <span className="font-medium text-foreground">{isMe ? "you" :name}</span>
        <span className="text-muted-foreground/60"> · </span>
        <span className="tabular-nums">{safeFormat(iso)}</span>
      </p>
    </div>
  );
}