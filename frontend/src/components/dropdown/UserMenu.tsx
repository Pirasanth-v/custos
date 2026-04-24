import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserMenuProps = {
  firstName: string;
  lastName?: string;
  onSignOut: () => void;
};

export default function UserMenu({
  firstName,
  lastName = "",
  onSignOut,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const initials = useMemo(() => {
    const first = firstName?.trim()?.[0] ?? "";
    const last = lastName?.trim()?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  }, [firstName, lastName]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-10 w-10 rounded-full bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center hover:opacity-90 transition"
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-popover shadow-xl overflow-hidden z-50">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className="w-full px-4 py-3 text-left text-foreground hover:bg-foreground/5 transition border-t border-foreground/10"
          >
            Settings
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="w-full px-4 py-3 text-left text-foreground hover:bg-foreground/5 transition border-t border-foreground/10"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
