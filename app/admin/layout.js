"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import { ToastProvider } from "./components/Toast";

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const isLoginPage = pathname === "/admin";
    const fixedPages = ["/admin/players", "/admin/deposits", "/admin/withdrawals", "/admin/game-history"];
    const isFixedPage = fixedPages.includes(pathname);

    if (isLoginPage) {
        return children;
    }

    return (
        <ToastProvider>
            <div style={{ display: "flex", height: "100vh", height: "100dvh", background: "#F5F7FB", overflow: "hidden" }}>
                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setSidebarOpen(false)}
                        style={{ display: "block" }}
                    />
                )}

                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: 0,
                        minWidth: 0,
                        background: "#F5F7FB",
                        transition: "margin-left 0.3s ease",
                    }}
                    className="admin-main-content"
                >
                    <TopNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                    <main
                        style={{
                            flex: 1,
                            minHeight: 0,
                            padding: "24px",
                            background: "#F5F7FB",
                            overflowY: isFixedPage ? "hidden" : "auto",
                            overflowX: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {children}
                    </main>
                </div>

                <style>{`
          .admin-main-content {
            margin-left: 272px;
          }
          @media (max-width: 1024px) {
            .admin-main-content {
              margin-left: 0 !important;
            }
          }
          @media (max-width: 640px) {
            .admin-main-content main {
              padding: 16px !important;
            }
          }
        `}</style>
            </div>
        </ToastProvider>
    );
}
