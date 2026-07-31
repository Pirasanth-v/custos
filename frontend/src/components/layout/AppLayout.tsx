import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { useEffect } from "react";
import useOrgStore from '@/store/orgStore';
import { QueryClient } from '@tanstack/react-query';

export default function AppLayout() {
    const queryClient = new QueryClient();
    const currentOrg = useOrgStore((s) => s.currentOrg)
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['org'] })
    }, [currentOrg?.id])
    return (
        <div className="flex min-h-dvh overflow-hidden bg-background">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Navbar />
                <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
                    <Outlet />  {/* renders the matched child route */}
                </main>
            </div>
        </div>
    )
}