import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";

type StatusType = "error" | "success" | "info" | "warning";

type StatusMessageProps = {
  type?: StatusType;
  message?: string | null;
  title?: string;
  className?: string;
  compact?: boolean;
  children?: ReactNode;
  autoHide?: boolean;
  duration?: number;
  onClose?: () => void;
};

const styles: Record<
  StatusType,
  {
    container: string;
    icon: ReactNode;
    title: string;
  }
> = {
  error: {
    container: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: <AlertCircle className="h-4 w-4" />,
    title: "Error: ",
  },
  success: {
    container:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: "Success",
  },
  info: {
    container:
      "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: <Info className="h-4 w-4" />,
    title: "Info",
  },
  warning: {
    container:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: <TriangleAlert className="h-4 w-4" />,
    title: "Warning",
  },
};

export default function StatusMessage({
  type = "error",
  message,
  title,
  className = "",
  compact = false,
  children,
  autoHide,
  duration,
  onClose,
}: StatusMessageProps) {
  // Hooks must be called unconditionally
  const [visible, setVisible] = useState<boolean>(false);

  const variant = styles[type];

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!autoHide || !message) return;

    const hideTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration || 3000);

    return () => clearTimeout(hideTimer);
  }, [message, autoHide, duration]);

  useEffect(() => {
    if (!message || !isExiting) return;

    const removeTimer = setTimeout(() => {
      onClose?.();
      setIsExiting(false);
    }, 300);

    return () => clearTimeout(removeTimer);
  }, [message, isExiting, onClose]);

  useEffect(() => {
    if (!autoHide || !message) return;

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, duration || 3000);

    return () => clearTimeout(hideTimer);
  }, [message, autoHide, duration]);

  useEffect(() => {
    if (!message || visible) return;

    const removeTimer = setTimeout(() => {
      onClose?.();
    }, 300);

    return () => clearTimeout(removeTimer);
  }, [visible, message, onClose]);

  if (!message && !children) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "w-full rounded-xl border transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        variant.container,
        compact ? "px-3 py-2" : "px-4 py-3",
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0">{variant.icon}</div>

        <div className="min-w-0 flex justify-center items-center gap-1">
          {!compact && (
            <p className="text-sm font-semibold">{title || variant.title}</p>
          )}

          {message ? (
            <p className={compact ? "text-xs" : "text-sm"}>{message}</p>
          ) : null}

          {children ? (
            <div className={compact ? "mt-1" : "mt-2"}>{children}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
