import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  widthClass?: string;
};

export default function Dropdown({
  trigger,
  children,
  widthClass = "w-64",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={wrapperRef}>
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>

      {open && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className={`fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden md:absolute md:inset-auto md:right-0 md:mt-2 md:z-50 ${widthClass}`}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}