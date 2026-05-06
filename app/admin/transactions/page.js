"use client";
import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import SearchFilter from "../components/SearchFilter";

export default function TransactionsPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/recharges").then(r => r.json()),
            fetch("/api/withdrawals").then(r => r.json()),
            fetch("/api/user-bets").then(r => r.json())
        ]).then(([rechData, withData, betData]) => {
            const txns = [];
            if (rechData.success) {
                rechData.data.forEach(r => {
                    txns.push({
                        id: `DEP-${r.id}`,
                        player: r.username || "—",
                        type: "Deposit",
                        amount: Number(r.amount || 0).toLocaleString(),
                        status: r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : "Pending",
                        date: new Date(r.created_by).toLocaleDateString(),
                        timestamp: new Date(r.created_by).getTime()
                    });
                });
            }
            if (withData.success) {
                withData.data.forEach(w => {
                    txns.push({
                        id: `WTH-${w.id}`,
                        player: w.username || "—",
                        type: "Withdrawal",
                        amount: Number(w.amount || 0).toLocaleString(),
                        status: w.status ? w.status.charAt(0).toUpperCase() + w.status.slice(1) : "Pending",
                        date: new Date(w.created_by).toLocaleDateString(),
                        timestamp: new Date(w.created_by).getTime()
                    });
                });
            }
            if (betData.success) {
                betData.data.forEach(b => {
                    const normalizedStatus = String(b.status || "").toLowerCase();
                    const isSports = b.source === "sports";
                    const type =
                        normalizedStatus === "won"
                            ? isSports
                                ? "Sports Win"
                                : "Win"
                            : normalizedStatus === "lost"
                                ? isSports
                                    ? "Sports Loss"
                                    : "Loss"
                                : isSports
                                    ? "Sports Bet"
                                    : "Bet";

                    txns.push({
                        id: `${isSports ? "SPT" : "BET"}-${b.id}`,
                        player: b.username || "-",
                        type,
                        category: isSports ? "sports" : "casino",
                        details: b.details || "-",
                        amount: Number(b.bet_amount || 0).toLocaleString(),
                        status: normalizedStatus
                            ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
                            : "Pending",
                        date: new Date(b.created_by).toLocaleDateString(),
                        timestamp: new Date(b.created_by).getTime()
                    });
                });
            }
            txns.sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(txns);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const filtered = transactions.filter((t) => {
        const searchValue = search.toLowerCase();
        const matchSearch =
            t.player.toLowerCase().includes(searchValue) ||
            t.id.toLowerCase().includes(searchValue) ||
            String(t.details || "").toLowerCase().includes(searchValue);
        const matchType =
            typeFilter === "all" ||
            t.category === typeFilter ||
            t.type.toLowerCase() === typeFilter;
        const matchStatus = statusFilter === "all" || t.status.toLowerCase() === statusFilter;
        return matchSearch && matchType && matchStatus;
    });

    const columns = [
        { key: "id", label: "Transaction ID", render: (v) => <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#5B6CFF" }}>{v}</span> },
        { key: "player", label: "Player Name" },
        {
            key: "type",
            label: "Type",
            render: (v) => {
                const colors = {
                    Deposit: "#22C55E",
                    Withdrawal: "#EF4444",
                    Win: "#5B6CFF",
                    Loss: "#F59E0B",
                    Bet: "#64748B",
                    "Sports Bet": "#8B5CF6",
                    "Sports Win": "#0EA5E9",
                    "Sports Loss": "#F97316",
                };
                return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: colors[v] || "#64748B", background: `${colors[v] || "#64748B"}14` }}>
                        {v}
                    </span>
                );
            },
        },
        {
            key: "details",
            label: "Details",
            render: (v) => <span style={{ color: "#64748B", fontSize: 13 }}>{v || "-"}</span>,
        },
        {
            key: "amount",
            label: "Amount",
            render: (v, row) => {
                const isPositive = row.type === "Deposit" || row.type === "Win" || row.type === "Sports Win";

                return (
                    <span style={{ fontWeight: 700, color: isPositive ? "#22C55E" : "#EF4444" }}>
                        {isPositive ? "+" : "-"}{v}
                    </span>
                );
            },
        },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
        { key: "date", label: "Date", render: (v) => <span style={{ color: "#94A3B8", fontSize: 13 }}>{v}</span> },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>Player Transactions</h1>
                    <p style={{ fontSize: 14, color: "#94A3B8" }}>{filtered.length} transactions</p>
                </div>
                {/* <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "10px 20px",
                        borderRadius: 14,
                        border: "none",
                        background: "#5B6CFF",
                        color: "#fff",
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#4C5DF4")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#5B6CFF")}
                >
                    <Download size={16} /> Export CSV
                </button> */}
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <SearchFilter searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by player, ID, or bet details..." />
                <div style={{ display: "flex", gap: 8 }}>
                    {[
                        { opts: [{ value: "all", label: "All Types" }, { value: "deposit", label: "Deposit" }, { value: "withdrawal", label: "Withdrawal" }, { value: "casino", label: "Casino Bets" }, { value: "sports", label: "Sports Bets" }], value: typeFilter, onChange: setTypeFilter },
                        { opts: [{ value: "all", label: "All Status" }, { value: "approved", label: "Approved" }, { value: "pending", label: "Pending" }, { value: "won", label: "Won" }, { value: "lost", label: "Lost" }, { value: "rejected", label: "Rejected" }], value: statusFilter, onChange: setStatusFilter },
                    ].map((f, i) => (
                        <select
                            key={i}
                            value={f.value}
                            onChange={(e) => f.onChange(e.target.value)}
                            style={{ height: 44, paddingLeft: 16, paddingRight: 36, borderRadius: 14, border: "1px solid #E6EAF2", background: "#fff", fontSize: 14, color: "#1E293B", outline: "none", cursor: "pointer", appearance: "none" }}
                        >
                            {f.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    ))}
                </div>
            </div>

            <DataTable columns={columns} data={filtered} loading={loading} />
        </div>
    );
}
