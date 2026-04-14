"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, Users, ArrowLeftRight, ArrowDownCircle, ArrowUpCircle, CreditCard, Gamepad2, KeyRound, Gem } from "lucide-react";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { label: "Player Management", icon: Users, href: "/admin/players" },
    { label: "Player Transactions", icon: ArrowLeftRight, href: "/admin/transactions" },
    { label: "Deposit Requests", icon: ArrowDownCircle, href: "/admin/deposits" },
    { label: "Withdrawal Requests", icon: ArrowUpCircle, href: "/admin/withdrawals" },
    { label: "Payment Settings", icon: CreditCard, href: "/admin/payment-settings" },
    { label: "Game History", icon: Gamepad2, href: "/admin/game-history" },
    { label: "Change Password", icon: KeyRound, href: "/admin/change-password" },
];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    return (
        <>
            <aside
                className={`admin-sidebar ${isOpen ? "open" : ""}`}
                style={{
                    width: 272,
                    minHeight: "100vh",
                    minHeight: "100dvh",
                    background: "#FFFFFF",
                    borderRight: "1px solid #E6EAF2",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    paddingTop: 28,
                    paddingBottom: 28,
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                {/* Logo + Close on mobile */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingLeft: 28,
                        paddingRight: 20,
                        marginBottom: 36,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 42,
                                height: 42,
                                borderRadius: 14,
                                background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Gem size={22} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", lineHeight: 1.2 }}>GameAdmin</div>
                            <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>Control Panel</div>
                        </div>
                    </div>
                    {/* Close button — visible only on mobile via CSS */}
                    <button
                        onClick={onClose}
                        className="sidebar-close-btn"
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: "none",
                            background: "#F5F7FB",
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                    >
                        <X size={18} color="#64748B" />
                    </button>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, paddingLeft: 16, paddingRight: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, paddingLeft: 12, marginBottom: 12 }}>
                        Menu
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                        {menuItems.map((item) => {
                            const isActive = item.href === "/admin/dashboard" ? pathname === "/admin/dashboard" : pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            padding: "11px 14px",
                                            borderRadius: 14,
                                            fontSize: 14,
                                            fontWeight: isActive ? 600 : 500,
                                            color: isActive ? "#5B6CFF" : "#64748B",
                                            background: isActive ? "rgba(91, 108, 255, 0.08)" : "transparent",
                                            textDecoration: "none",
                                            transition: "all 0.2s ease",
                                            whiteSpace: "nowrap",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = "rgba(91, 108, 255, 0.04)";
                                                e.currentTarget.style.color = "#5B6CFF";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = "#64748B";
                                            }
                                        }}
                                    >
                                        <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Bottom */}
                <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 16 }}>
                    <div
                        style={{
                            padding: "16px 18px",
                            borderRadius: 16,
                            background: "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
                            border: "1px solid rgba(102,126,234,0.12)",
                        }}
                    >
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 4 }}>Need Help?</div>
                        <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>Contact support for assistance</div>
                    </div>
                </div>
            </aside>

            <style>{`
        @media (max-width: 1024px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            box-shadow: none;
          }
          .admin-sidebar.open {
            transform: translateX(0);
            box-shadow: 8px 0 32px rgba(0,0,0,0.1);
          }
          .sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>
        </>
    );
}
