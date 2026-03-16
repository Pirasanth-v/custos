import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export default function AppLayout() {
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