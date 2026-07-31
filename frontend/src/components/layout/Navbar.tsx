import { Sun, Moon } from "lucide-react";
import UserMenu from "../dropdown/UserMenu";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { logout } from "@/features/auth/api";
import { useState } from "react";
import useThemeStore from "@/store/themeStore";
import { CurrencyDropdown } from "../dropdown/CurrencyDropdown";
import { OrganizationDropdown } from "../dropdown/OrganizationDropdown";
import Notifications from "../notification/NotificationDropDown";

export function Navbar() {
  const user = useAuthStore((s) => s.user);

  const navigate = useNavigate();

  const [error, setError] = useState("");

  const { isDark, toggle } = useThemeStore();

  const [currency, setCurrency] = useState("USD");

  // Handle sign-out logic
  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch {
      setError("Error");
    }
  };

  return (
    <>
      {error &&
        <div className="fixed top-18 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded shadow">
          {error}
          <button
            className="ml-3 text-sm underline"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>}
      <nav className="h-16 flex justify-between items-center bg-card text-foreground border-b border-border px-5">
        <h1 className="text-lg font-medium">Custos</h1>

        {/* Middle Section: Organization Dropdown */}
        <div className="hidden md:block">
          <OrganizationDropdown />
        </div>

        {/* Right Section: Currency, Theme, Notifications, Profile */}
        <div className="flex gap-5 items-center">
          <div className="hidden md:block">
            <CurrencyDropdown
              selectedCurrency={currency}
              onSelect={setCurrency}
            />
          </div>

          <button
            onClick={toggle}
            className="hidden md:block p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notification Dropdown; badge handled inside, not here */}
          <Notifications />

          <UserMenu
            firstName={user?.first_name || ""}
            lastName={user?.last_name || ""}
            onSignOut={handleSignOut}
          />
        </div>
      </nav>
    </>
  );
}