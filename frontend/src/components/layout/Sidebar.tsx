import { useEffect, useMemo, useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react"
import logo from "@/assets/logo_crop.png"
import useThemeStore from "@/store/themeStore"
import { CurrencyDropdown } from "../dropdown/CurrencyDropdown"
import { OrganizationDropdown } from "../dropdown/OrganizationDropdown"

type SidebarItem = {
  label: string
  to: string
  icon: React.ElementType
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", to: "/accounts", icon: Wallet },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { label: "Bills", to: "/bills", icon: Receipt },
  { label: "Settings", to: "/settings", icon: Settings },
]

const SIDEBAR_STORAGE_KEY = "app_sidebar_pinned"

export function Sidebar() {
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { isDark, toggle } = useThemeStore()
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    Promise.resolve().then(() => setPinned(saved === "true"))
  }, [])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(pinned))
  }, [pinned])

  const expanded = useMemo(() => pinned || hovered, [pinned, hovered])

  useEffect(() => {
    if (!mobileOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        @media (max-width: 767px) {
          nav h1 {
            padding-left: 2.75rem !important;
          }
        }
      `}</style>

      {/* Hamburger button for mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm hover:bg-muted md:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Overlay/backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 touch-none overscroll-none bg-background/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed inset-y-0 left-0 z-50 h-dvh w-64 transform border-r border-border bg-card text-foreground transition-all duration-300 ease-in-out md:static md:translate-x-0 md:h-screen md:shrink-0 md:transition-all ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          } ${expanded ? "md:w-64" : "md:w-20"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Top section */}
          <div className="shrink-0 flex items-center justify-between px-4 py-4">
            <img src={logo} alt="logo" className="h-12" />

            {/* Mobile close button / Desktop pin button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-foreground hover:bg-foreground/10 md:hidden"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>

              <button
                type="button"
                onClick={() => setPinned((prev) => !prev)}
                className={`hidden rounded-lg p-2 text-foreground hover:bg-foreground/10 lg:flex ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
                title={pinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {pinned ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.to}>
                  <SidebarNavItem
                    item={item}
                    expanded={expanded}
                    onClick={() => setMobileOpen(false)}
                  />
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile-only settings section */}
          <div className="shrink-0 space-y-4 border-t border-border bg-card px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organization</span>
              <OrganizationDropdown />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currency</span>
              <CurrencyDropdown
                selectedCurrency={currency}
                onSelect={setCurrency}
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-medium text-foreground">Theme</span>
              <button
                onClick={toggle}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Bottom section */}
          <div className="hidden md:block border-t border-white/10 p-3">
            <button
              type="button"
              onClick={() => setPinned((prev) => !prev)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-white/10 hover:text-white lg:hidden"
            >
              {pinned ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              <span className={`${expanded ? "block" : "hidden"}`}>
                {pinned ? "Unpin sidebar" : "Pin sidebar"}
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarNavItem({
  item,
  expanded,
  onClick,
}: {
  item: SidebarItem
  expanded: boolean
  onClick?: () => void
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${isActive
          ? "bg-primary text-white"
          : "text-foreground hover:bg-foreground/8"
        }`
      }
      title={!expanded ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center ${isActive ? "text-white" : "text-foreground"
              }`}
          >
            <Icon size={20} strokeWidth={2} />
          </span>

          <span
            className={`ml-4 whitespace-nowrap text-[15px] font-medium transition-all duration-200 ${expanded
              ? "translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-2 opacity-0 md:pointer-events-none md:-translate-x-2 md:opacity-0 max-md:pointer-events-auto max-md:translate-x-0 max-md:opacity-100"
              }`}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}