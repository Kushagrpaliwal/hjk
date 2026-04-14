"use client";
import { useState, useEffect } from "react";
import { Download, Eye } from "lucide-react";
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
                    const type = b.status === "won" ? "Win" : "Loss";
                    txns.push({
                        id: `BET-${b.id}`,
                        player: b.username || "—",
                        type: type,
                        amount: Number(b.bet_amount || 0).toLocaleString(),
                        status: "Completed",
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
        const matchSearch = t.player.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || t.type.toLowerCase() === typeFilter;
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
                const colors = { Deposit: "#22C55E", Withdrawal: "#EF4444", Win: "#5B6CFF", Loss: "#F59E0B" };
                return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: colors[v] || "#64748B", background: `${colors[v] || "#64748B"}14` }}>
                        {v === "Deposit" ? "↓" : v === "Withdrawal" ? "↑" : v === "Win" ? "🏆" : "📉"} {v}
                    </span>
                );
            },
        },
        {
            key: "amount",
            label: "Amount",
            render: (v, row) => (
                <span style={{ fontWeight: 700, color: row.type === "Deposit" || row.type === "Win" ? "#22C55E" : "#EF4444" }}>
                    {row.type === "Deposit" || row.type === "Win" ? "+" : "-"}{v}
                </span>
            ),
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
                <SearchFilter searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by player or ID..." />
                <div style={{ display: "flex", gap: 8 }}>
                    {[
                        { opts: [{ value: "all", label: "All Types" }, { value: "deposit", label: "Deposit" }, { value: "withdrawal", label: "Withdrawal" }, { value: "win", label: "Win" }, { value: "loss", label: "Loss" }], value: typeFilter, onChange: setTypeFilter },
                        { opts: [{ value: "all", label: "All Status" }, { value: "approved", label: "Approved" }, { value: "pending", label: "Pending" }, { value: "rejected", label: "Rejected" }], value: statusFilter, onChange: setStatusFilter },
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
