# Custos — Responsiveness Refactor Rules

## Project
React+TS+Tailwind+Bun/Vite frontend in /frontend. Go backend in /backend. Monorepo.

## Strict constraints — never violate
- DO NOT change any business logic, API calls, hooks, or state management
- DO NOT change any colors, typography, spacing ratios, or visual design
- DO NOT refactor component structure or rename props/functions
- DO NOT touch /backend at all
- DO NOT change more than ONE component per task
- ONLY add or adjust Tailwind responsive prefixes (sm: md: lg: xl:)
- After each component, verify the existing functionality is intact before moving on

## What responsive means here
- No horizontal scroll on any screen
- Tables must be scrollable or stack on mobile
- Sidebar must collapse or become bottom nav on mobile (sm: breakpoint)
- Modals/drawers must be full-screen on mobile
- Charts must shrink gracefully (use ResponsiveContainer if recharts)
- Grid layouts must stack vertically on small screens
- Buttons/inputs must have adequate touch targets (min 44px height)

## Component priority order — do exactly in this order
1. Layout shell / sidebar (affects all pages)
2. Dashboard page (StatCard grid, NetBalanceTrend, CashFlowAnalysis, ExpenseBreakdown, RecentActivity)
3. Transactions page + Table generic component
4. Bills upload flow (modal/drawer + file list)
5. Accounts page
6. Categories page
7. Auth pages (login, register)

## Tech
- Tailwind breakpoints: sm=640px md=768px lg=1024px xl=1280px
- recharts charts already use recharts — wrap in ResponsiveContainer where missing
- All components in /frontend/src/components and /frontend/src/pages