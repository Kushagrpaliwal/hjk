"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import SearchFilter from "../components/SearchFilter";
import StatusBadge from "../components/StatusBadge";

const toDisplay = (value, fallback = "-") =>
    value === null || value === undefined || value === "" ? fallback : value;

const formatAmount = (value) => Number(value || 0).toLocaleString();

const normalizeStatus = (value) => {
    const lower = String(value || "").toLowerCase();
    if (!lower) return "Pending";
    return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export default function SportsBetsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [bets, setBets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/sports-bets")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setBets(data.data || []);
                }
            })
            .catch((err) => {
                console.error("Failed to load sports bets:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const filteredBets = useMemo(() => {
        const query = search.toLowerCase();
        return bets.filter((bet) => {
            const status = String(bet.status || "").toLowerCase();
            const statusMatch = statusFilter === "all" || status === statusFilter;
            const searchMatch = [
                bet.id,
                bet.username,
                bet.eventName,
                bet.sportName,
                bet.gameType,
                bet.marketName,
                bet.runnerName,
                bet.betType,
                bet.matchName,
                bet.marketId,
                bet.eventId,
            ]
                .map((item) => String(item || "").toLowerCase())
                .some((item) => item.includes(query));

            return statusMatch && searchMatch;
        });
    }, [bets, search, statusFilter]);

    const columns = [
        {
            key: "id",
            label: "Bet ID",
            render: (value) => (
                <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#5B6CFF" }}>
                    SPT-{value}
                </span>
            ),
        },
        { key: "username", label: "Player", render: (value) => toDisplay(value) },
        { key: "sportName", label: "Sport", render: (value) => toDisplay(value) },
        { key: "eventName", label: "Event", render: (value) => toDisplay(value) },
        { key: "eventId", label: "Event ID", render: (value) => toDisplay(value) },
        { key: "marketName", label: "Market", render: (value) => toDisplay(value) },
        { key: "marketId", label: "Market ID", render: (value) => toDisplay(value) },
        { key: "gameType", label: "Game Type", render: (value) => toDisplay(value) },
        {
            key: "selection",
            label: "Selection",
            render: (_, row) => (
                <span>
                    {toDisplay(row.runnerName)} ({toDisplay(row.betType)})
                </span>
            ),
        },
        { key: "runnerId", label: "Runner ID", render: (value) => toDisplay(value) },
        { key: "oddName", label: "Odd Name", render: (value) => toDisplay(value) },
        { key: "odds", label: "Odds", render: (value) => toDisplay(value) },
        { key: "size", label: "Size", render: (value) => toDisplay(value) },
        {
            key: "stake",
            label: "Stake",
            render: (value) => <span style={{ fontWeight: 700 }}>₹{formatAmount(value)}</span>,
        },
        {
            key: "status",
            label: "Status",
            render: (value) => <StatusBadge status={normalizeStatus(value)} />,
        },
        {
            key: "createdAt",
            label: "Placed At",
            render: (value) => {
                if (!value) return "-";
                const date = new Date(value);
                if (Number.isNaN(date.getTime())) return "-";
                return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            },
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>
                        Sports Bets
                    </h1>
                    <p style={{ fontSize: 14, color: "#94A3B8" }}>
                        {filteredBets.length} sports bets found
                    </p>
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <SearchFilter
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by user, event, market, runner, IDs..."
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        height: 44,
                        paddingLeft: 16,
                        paddingRight: 36,
                        borderRadius: 14,
                        border: "1px solid #E6EAF2",
                        background: "#fff",
                        fontSize: 14,
                        color: "#1E293B",
                        outline: "none",
                        cursor: "pointer",
                        appearance: "none",
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <DataTable columns={columns} data={filteredBets} loading={loading} itemsPerPage={10} />
        </div>
    );
}
