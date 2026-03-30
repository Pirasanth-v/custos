import React from "react";

interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  error,
  className = "",
  ...inputProps
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-foreground">{label}</label>
    <input
      {...inputProps}
      className={[
        "h-11 w-full rounded-xl border-input dark:border-input/30 border bg-input-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        error ? "border-destructive/60" : "",
        className,
      ].join(" ")}
    />
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

export default SettingsInput;
