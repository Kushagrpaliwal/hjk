import * as LucideIcons from "lucide-react";

export default function StatsCard({ label, value, change, changeType, icon, delay = 0 }) {
    const Icon = LucideIcons[icon] || LucideIcons.Activity;
    const isUp = changeType === "up";

    return (
        <div
            className="animate-fade-in"
            style={{
                background: "#FFFFFF",
                borderRadius: 20,
                padding: "24px 24px 20px",
                border: "1px solid #E6EAF2",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                transition: "transform 0.2s, box-shadow 0.2s",
                animationDelay: `${delay}ms`,
                cursor: "default",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
            }}
        >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "rgba(91, 108, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={22} color="#5B6CFF" strokeWidth={1.8} />
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isUp ? "#22C55E" : "#EF4444",
                        background: isUp ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                        padding: "4px 10px",
                        borderRadius: 20,
                    }}
                >
                    {isUp ? "↑" : "↓"} {change}
                </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1E293B", marginBottom: 4, lineHeight: 1.2 }}>
                {value}
            </div>
            <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{label}</div>
        </div>
    );
}
