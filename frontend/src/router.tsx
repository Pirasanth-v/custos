import { createBrowserRouter, Navigate } from "react-router-dom"
import ProtectedRoute from '@/components/ProtectedRoute'
import RegisterPage from "@/pages/RegisterPage"
import DashboardPage from "@/pages/DashboardPage"
import LoginPage from "./pages/LoginPage"
import AppLayout from "./components/layout/AppLayout"

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
        path: 'register',
        element: <RegisterPage />
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
            }
        ]
    }
])