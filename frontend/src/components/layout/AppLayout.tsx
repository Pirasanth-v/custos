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
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1">
                <Navbar />
                <main className="flex-1 overflow-auto p-6 bg-background">
                    <Outlet />  {/* renders the matched child route */}
                </main>
            </div>
        </div>
    )
}