import { useEffect, useMemo, useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PiggyBank,
  CheckSquare,
  FileText,
  Folder,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import logo from "@/assets/logo_crop.png"

type SidebarItem = {
  label: string
  to: string
  icon: React.ElementType
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", to: "/accounts", icon: Wallet },
  { label: "Transactions", to: "/transactions", icon: ArrowLeftRight },
  { label: "Budgets", to: "/budgets", icon: PiggyBank },
  { label: "Approvals", to: "/approvals", icon: CheckSquare },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Files", to: "/bills", icon: Folder },
  { label: "Settings", to: "/settings", icon: Settings },
]

const SIDEBAR_STORAGE_KEY = "app_sidebar_pinned"

export function Sidebar() {
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    Promise.resolve().then(() => setPinned(saved === "true"))
  }, [])

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(pinned))
  }, [pinned])

  const expanded = useMemo(() => pinned || hovered, [pinned, hovered])

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`h-screen shrink-0 border-r border-border  bg-card text-foreground transition-all duration-300 ease-in-out ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Top section */}
        <div className="flex items-center justify-between px-4 py-4">
          {/* <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary font-semibold text-white">
              C
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                expanded ? "w-auto opacity-100" : "w-0 opacity-0"
              }`}
            >
              <p className="truncate text-sm font-semibold">Custos</p>
              <p className="truncate text-xs text-white/60">Finance Platform</p>
            </div>
          </div> */}

          <img src={logo} alt="logo" className="h-12"/>

          <button
            type="button"
            onClick={() => setPinned((prev) => !prev)}
            className={`hidden rounded-lg p-2 text-foreground hover:bg-foreground/10 lg:flex ${
              expanded ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
            title={pinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {pinned ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.to}>
                <SidebarNavItem item={item} expanded={expanded} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-3">
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
  )
}

function SidebarNavItem({
  item,
  expanded,
}: {
  item: SidebarItem
  expanded: boolean
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `group flex items-center rounded-xl px-3 py-3 transition-all duration-200 ${
          isActive
            ? "bg-primary text-white"
            : "text-foreground hover:bg-foreground/8"
        }`
      }
      title={!expanded ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center ${
              isActive ? "text-white" : "text-foreground"
            }`}
          >
            <Icon size={20} strokeWidth={2} />
          </span>

          <span
            className={`ml-4 whitespace-nowrap text-[15px] font-medium transition-all duration-200 ${
              expanded
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0"
            }`}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}