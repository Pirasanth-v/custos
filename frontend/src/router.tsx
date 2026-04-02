import { createBrowserRouter, Navigate } from "react-router-dom"
import ProtectedRoute from '@/components/ProtectedRoute'
import RegisterPage from "@/pages/RegisterPage"
import DashboardPage from "@/pages/DashboardPage"
import LoginPage from "./pages/LoginPage"
import AppLayout from "./components/layout/AppLayout"
import CreateOrganizationPage from "./pages/CreateOrgPage"
import SettingsPage from "./pages/settings/SettingsPage"
import AccountsPage from "./pages/AccountsPage"

export const router = createBrowserRouter ([
    {
        path: '/',
        element: <Navigate to="/dashboard" replace />
    },
    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/register',
        element: <RegisterPage />
    },
    {
        path: '/createOrg',
        element: (
            <ProtectedRoute>
                <CreateOrganizationPage />
            </ProtectedRoute>
        )
    },
    {
        element: (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: '/dashboard',
                element: <DashboardPage />
            },
            {
                path: '/accounts',
                element: <AccountsPage />
            },
            {
                path: "/settings",
                element: <SettingsPage />
            }
        ]
    }
])