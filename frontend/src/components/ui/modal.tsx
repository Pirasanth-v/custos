import { useEffect, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
};

export default function Modal({ open, onClose, children, maxWidthClass }: ModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
        tabIndex={-1}
      />

      {/* Modal content */}
      <div
        className={`relative z-10 w-full ${maxWidthClass || "max-w-xl"
          } max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-white/10 bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 sm:max-h-[calc(100dvh-2rem)]`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}