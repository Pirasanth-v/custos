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

## Google Auth integration rules
- Backend endpoint POST /auth/google already complete — accepts {id_token: string}, sets session_token cookie, returns {message: "ok"}
- Do NOT build any backend code
- Follow exact same pattern as existing login mutation (hook file, useMutation, api.post, navigate to /dashboard on success, toast on error)
- Use GoogleLogin component from @react-oauth/google — NOT useGoogleLogin (we need credential/id_token not access_token)
- The Google sign in button UI already exists in the login page — find it and replace only that button with the real component
- Do not change anything else on the login or register page
- Do not change layout, colors, sizing, or surrounding elements
- Match existing code style exactly (same import order, same error handling, same file structure)