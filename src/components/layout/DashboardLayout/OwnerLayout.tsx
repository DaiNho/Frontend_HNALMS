import { useState } from "react";
import { Outlet } from "react-router-dom";
import OwnerSidebar from "../Sidebar/OwnerSidebar/OwnerSidebar";
import HeaderDashboard from "../Header/HeaderDashboard/HeaderDashboard";
import "./DashboardLayout.css";

export default function OwnerLayout() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout-wrapper">
            <OwnerSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
            
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
