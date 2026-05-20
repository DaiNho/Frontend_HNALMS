import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../Sidebar/AdminSidebar/AdminSidebar";
import HeaderDashboard from "../Header/HeaderDashboard/HeaderDashboard";
import "./DashboardLayout.css";

export default function AdminLayout() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout-wrapper">
            <AdminSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
            
            {isMobileSidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
            )}
            
            <div className="dashboard-layout-body">
                <HeaderDashboard onMenuClick={() => setIsMobileSidebarOpen(true)} />
                <main className="dashboard-layout-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
