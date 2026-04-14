"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, LogOut, Settings, User, Menu } from "lucide-react";

export default function TopNavbar({ onMenuToggle }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("adminUser");
        document.cookie = "adminAuth=; path=/; max-age=0; samesite=lax";
        router.push("/admin");
    };

    return (
        <header
            style={{
                height: 72,
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid #E6EAF2",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px",
                position: "sticky",
                top: 0,
                zIndex: 30,
                gap: 16,
                flexShrink: 0,
            }}
        >
            {/* Left side: Hamburger + Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                {/* Hamburger — visible on mobile */}
                <button
                    onClick={onMenuToggle}
                    className="hamburger-btn"
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        border: "1px solid #E6EAF2",
                        background: "#FFFFFF",
                        display: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    <Menu size={20} color="#64748B" />
                </button>

                {/* Search */}
                <div style={{ position: "relative", flex: 1, maxWidth: 380, minWidth: 0 }}>
                    <Search
                        size={18}
                        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                    />
                    <input
                        type="text"
                        placeholder="Search players, transactions..."
                        style={{
                            width: "100%",
                            height: 44,
                            paddingLeft: 42,
                            paddingRight: 16,
                            borderRadius: 14,
                            border: "1px solid #E6EAF2",
                            background: "#F5F7FB",
                            fontSize: 14,
                            color: "#1E293B",
                            outline: "none",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = "#5B6CFF";
                            e.target.style.boxShadow = "0 0 0 3px rgba(91,108,255,0.1)";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "#E6EAF2";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                </div>
            </div>

            {/* Right Side */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                {/* Notifications */}
                <button
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        border: "1px solid #E6EAF2",
                        background: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s",
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F7FB")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                >
                    <Bell size={20} color="#64748B" />
                    <span
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: "#EF4444",
                            border: "2px solid #fff",
                        }}
                    />
                </button>

                {/* Divider — hidden on small screens */}
                <div className="nav-divider" style={{ width: 1, height: 32, background: "#E6EAF2" }} />

                {/* Profile */}
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "6px 12px 6px 6px",
                            borderRadius: 14,
                            border: "1px solid #E6EAF2",
                            background: "#FFFFFF",
                            cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F7FB")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: 700,
                                flexShrink: 0,
                            }}
                        >
                            SA
                        </div>
                        <div className="profile-text" style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", lineHeight: 1.2 }}>Super Admin</div>
                            <div style={{ fontSize: 11, color: "#94A3B8" }}>admin@game.com</div>
                        </div>
                        <ChevronDown
                            size={16}
                            color="#94A3B8"
                            className="profile-chevron"
                            style={{
                                marginLeft: 4,
                                transition: "transform 0.2s",
                                transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                        />
                    </button>

                    {showDropdown && (
                        <>
                            <div
                                style={{ position: "fixed", inset: 0, zIndex: 49 }}
                                onClick={() => setShowDropdown(false)}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    right: 0,
                                    width: 200,
                                    background: "#FFFFFF",
                                    borderRadius: 16,
                                    border: "1px solid #E6EAF2",
                                    boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
                                    padding: 8,
                                    zIndex: 50,
                                }}
                                className="animate-scale-in"
                            >
                                {[
                                    { icon: User, label: "Profile" },
                                    { icon: Settings, label: "Settings" },
                                { icon: LogOut, label: "Logout", danger: true, action: handleLogout },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        if (item.action) item.action();
                                        setShowDropdown(false);
                                    }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                            width: "100%",
                                            padding: "10px 12px",
                                            borderRadius: 10,
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: item.danger ? "#EF4444" : "#64748B",
                                            transition: "background 0.15s",
                                        }}
                                        onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = item.danger
                                            ? "rgba(239,68,68,0.06)"
                                            : "#F5F7FB")
                                        }
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <item.icon size={16} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
        @media (max-width: 1024px) {
          .hamburger-btn {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .profile-text,
          .profile-chevron,
          .nav-divider {
            display: none !important;
          }
        }
      `}</style>
        </header>
    );
}
