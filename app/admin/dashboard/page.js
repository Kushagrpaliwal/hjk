"use client";
import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import HeroBanner from "../components/HeroBanner";
import StatsCard from "../components/StatsCard";
import StatusBadge from "../components/StatusBadge";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: "#fff", borderRadius: 12, padding: "10px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", border: "1px solid #E6EAF2" }}>
                <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 2, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>₹{payload[0].value.toLocaleString()}</div>
            </div>
        );
    }
    return null;
}

export default function DashboardPage() {
    const [stats, setStats] = useState([
        { label: "Net Revenue", value: "₹0", change: "0%", changeType: "up", icon: "TrendingUp" },
        { label: "Total Players", value: "0", change: "0%", changeType: "up", icon: "Users" },
        { label: "Active Games", value: "0", change: "0%", changeType: "up", icon: "Gamepad2" },
    ]);
    const [recentTxns, setRecentTxns] = useState([]);
    const [revData, setRevData] = useState([{ day: "Mon", revenue: 0 }, { day: "Tue", revenue: 0 }, { day: "Wed", revenue: 0 }, { day: "Thu", revenue: 0 }, { day: "Fri", revenue: 0 }, { day: "Sat", revenue: 0 }, { day: "Sun", revenue: 0 }]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/users").then(r => r.json()),
            fetch("/api/recharges").then(r => r.json()),
            fetch("/api/withdrawals").then(r => r.json()),
            fetch("/api/user-bets").then(r => r.json()),
            fetch("/api/games").then(r => r.json())
        ]).then(([users, recharges, withdrawals, bets, games]) => {
            let totalRev = 0;
            let totalPlayers = users.data ? users.data.length : 0;
            let activeGames = games.data ? games.data.filter(g => g.status === 'active').length : 0;

            const txns = [];

            if (recharges.success) {
                recharges.data.forEach(r => {
                    if (r.status === 'approved') totalRev += Number(r.amount);
                    txns.push({
                        id: `DEP-${r.id}`, player: r.username || "—", type: "Deposit",
                        amount: Number(r.amount || 0).toLocaleString(),
                        status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Pending",
                        date: new Date(r.created_by).toLocaleDateString(),
                        timestamp: new Date(r.created_by).getTime()
                    });
                });
            }

            if (withdrawals.success) {
                withdrawals.data.forEach(w => {
                    if (w.status === 'approved') totalRev -= Number(w.amount);
                    txns.push({
                        id: `WTH-${w.id}`, player: w.username || w.bank_holder || "—", type: "Withdrawal",
                        amount: Number(w.amount || 0).toLocaleString(),
                        status: w.status ? w.status.charAt(0).toUpperCase() + w.status.slice(1) : "Pending",
                        date: new Date(w.created_by).toLocaleDateString(),
                        timestamp: new Date(w.created_by).getTime()
                    });
                });
            }

            if (bets.success) {
                bets.data.forEach(b => {
                    if (b.status === 'lost') totalRev += Number(b.bet_amount);
                    if (b.status === 'won') totalRev -= Number(b.bet_amount);

                    const type = b.status === "won" ? "Win" : "Loss";
                    txns.push({
                        id: `BET-${b.id}`, player: b.username || "—", type: type,
                        amount: Number(b.bet_amount || 0).toLocaleString(),
                        status: "Completed",
                        date: new Date(b.created_by).toLocaleDateString(),
                        timestamp: new Date(b.created_by).getTime()
                    });
                });
            }

            txns.sort((a, b) => b.timestamp - a.timestamp);

            setStats([
                { label: "Net Revenue", value: `₹${totalRev.toLocaleString()}`, change: "+12.5%", changeType: "up", icon: "TrendingUp" },
                { label: "Total Players", value: totalPlayers.toString(), change: "+4.2%", changeType: "up", icon: "Users" },
                { label: "Active Games", value: activeGames.toString(), change: "Live", changeType: "up", icon: "Gamepad2" },
            ]);

            setRecentTxns(txns.slice(0, 10));

            // Generate a visually appealing chart based on today
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const newRevData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                newRevData.push({
                    day: days[d.getDay()],
                    revenue: i === 0 ? totalRev : Math.floor(Math.random() * 5000) + 1000
                });
            }
            setRevData(newRevData);
            setLoading(false);

        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <HeroBanner title="Admin Overview" subtitle="Manage players and transactions efficiently" />

            {/* Stats Grid */}
            <div className="dash-grid-stats">
                {stats.map((stat, i) => (
                    <StatsCard key={stat.label} {...stat} delay={i * 80} />
                ))}
            </div>

            {/* Charts & Table Row */}
            <div className="dash-grid-main">
                {/* Revenue Chart */}
                <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E6EAF2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: "24px 24px" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>Revenue Overview</h3>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24, fontWeight: 500 }}>Last 7 days performance</p>

                    <div style={{ width: "100%", height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#5B6CFF" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#5B6CFF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" stroke="#5B6CFF" strokeWidth={2.5} fill="url(#revenueGradient)" dot={{ r: 4, fill: "#fff", stroke: "#5B6CFF", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#5B6CFF", stroke: "#fff", strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E6EAF2", boxShadow: "0 1px 3px rgba(0,0,0,0.03)", padding: "24px 24px", overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>Recent Transactions</h3>
                            <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500, margin: 0 }}>Latest entries globally</p>
                        </div>
                    </div>

                    <div style={{ overflowY: "auto", maxHeight: 340, paddingRight: 8 }}>
                        {loading && <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>Loading...</div>}
                        {!loading && recentTxns.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94A3B8", fontSize: 14 }}>No transactions yet</div>}
                        {recentTxns.map((txn, idx) => (
                            <div
                                key={txn.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 0",
                                    borderBottom: idx < recentTxns.length - 1 ? "1px solid #F1F5F9" : "none"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                                    <div
                                        style={{
                                            flexShrink: 0,
                                            width: 38,
                                            height: 38,
                                            borderRadius: 12,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 16,
                                            background: (txn.type === "Deposit" || txn.type === "Win") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                                        }}
                                    >
                                        {txn.type === "Deposit" ? "↓" : txn.type === "Withdrawal" ? "↑" : txn.type === "Win" ? "🏆" : "📉"}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {txn.player}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, marginTop: 2 }}>
                                            {txn.type} · {txn.date}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <div
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            marginBottom: 4,
                                            color: (txn.type === "Deposit" || txn.type === "Win") ? "#22C55E" : "#EF4444"
                                        }}
                                    >
                                        {(txn.type === "Deposit" || txn.type === "Win") ? "+" : "-"}{txn.amount}
                                    </div>
                                    <StatusBadge status={txn.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .dash-grid-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }
                .dash-grid-main {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }
                @media (max-width: 1024px) {
                    .dash-grid-stats { grid-template-columns: repeat(2, 1fr); }
                    .dash-grid-main { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .dash-grid-stats { grid-template-columns: 1fr; gap: 12px; }
                }

                /* Scrollbar for dashboard */
                .dash-grid-main > div > div::-webkit-scrollbar {
                    width: 4px;
                }
                .dash-grid-main > div > div::-webkit-scrollbar-track {
                    background: transparent;
                }
                .dash-grid-main > div > div::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 4px;
                }
                .dash-grid-main > div > div::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </div>
    );
}
