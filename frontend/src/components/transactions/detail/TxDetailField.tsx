type TxDetailFieldProps = {
    label: string;
    value: React.ReactNode;
    by?: string;
    mono?: boolean;
    muted?: boolean;
  };
  
  export function TxDetailField({
    label,
    value,
    by,
    mono = false,
    muted = false,
  }: TxDetailFieldProps) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className={`text-sm leading-snug ${
            mono ? "font-mono tabular-nums" : "font-medium"
          } ${muted ? "text-muted-foreground" : "text-foreground"}`}
        >
{value ? (
  <div className="flex flex-col gap-0.5">
    <span className={`text-sm font-medium ${mono ? "font-mono tabular-nums" : ""} ${muted ? "text-muted-foreground" : "text-foreground"}`}>
      {value}
    </span>
    {by && (
      <span className="text-[11px] text-muted-foreground/60 leading-none">
        {by}
      </span>
    )}
  </div>
) : (
  <span className="text-muted-foreground/50">—</span>
)}
     
        </span>
      </div>
    );
  }