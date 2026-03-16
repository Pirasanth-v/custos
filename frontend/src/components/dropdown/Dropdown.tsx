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
        <div
          className={`absolute right-0 mt-2 ${widthClass} rounded-xl border border-border bg-popover text-popover-foreground shadow-lg z-50 overflow-hidden`}
        >
          {children}
        </div>
      )}
    </div>
  );
}