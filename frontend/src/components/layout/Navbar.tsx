//import logo from "@/assets/logo_crop.png";
import { Sun, Moon, BellDot } from "lucide-react";
import UserMenu from "../dropdown/UserMenu";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { logout } from "@/features/auth/api";
import { useState } from "react";
import useThemeStore from "@/store/themeStore";
import { CurrencyDropdown } from "../dropdown/CurrencyDropdown";
import { OrganizationDropdown } from "../dropdown/OrganizationDropdown";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { isDark, toggle } = useThemeStore();
  const [currency, setCurrency] = useState("USD");
  const [orgId, setOrgId] = useState(1);

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
        {/* Left Section: App Name */}
        {/* Uncomment for logo: */}
        {/* <div className="flex items-center gap-1">
          <img src={logo} alt="logo" className="h-12 w-auto" />
          <h1 className="text-lg font-medium">Custos</h1>
        </div> */}
        <h1 className="text-lg font-medium">Custos</h1>

        {/* Middle Section: Organization Dropdown */}
        <div>
          <OrganizationDropdown 
            selectedOrgId={orgId}
            onSelect={setOrgId}
            onCreate={() => {
              console.log("create organization clicked")
            }}
          />
        </div>

        {/* Right Section: Currency, Theme, Notifications, Profile */}
        <div className="flex gap-5 items-center">
          <CurrencyDropdown 
            selectedCurrency={currency}
            onSelect={setCurrency}
          />

          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <BellDot size={20} />

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