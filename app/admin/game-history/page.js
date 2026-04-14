"use client";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import SearchFilter from "../components/SearchFilter";
import Modal from "../components/Modal";

export default function GameHistoryPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [detailModal, setDetailModal] = useState({ open: false, game: null });
    const [gameHistory, setGameHistory] = useState([]);

    useEffect(() => {
        fetch("/api/games")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const mapped = data.data.map((g) => {
                        const statusLabel = g.status === 1 ? "Completed" : g.status === 2 ? "Cancelled" : "In Progress";
                        return {
                            id: String(g.period || g.id),
                            gameType: g.game_type || "N/A",
                            result: g.result || "-",
                            status: statusLabel,
                            date: g.created_by ? new Date(g.created_by).toLocaleString() : "N/A",
                        };
                    });
                    setGameHistory(mapped);
                }
            })
            .catch(console.error);
    }, []);

    const filtered = gameHistory.filter((g) => {
        const matchSearch =
            g.id.toLowerCase().includes(search.toLowerCase()) ||
            g.gameType.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" || g.status.toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    const columns = [
        {
            key: "id",
            label: "Round ID",
            render: (v) => <span className="font-mono text-xs text-indigo-500">{v}</span>,
        },
        { key: "gameType", label: "Game Type" },
        {
            key: "result",
            label: "Result",
            render: (v) => <span className={v === "-" ? "text-slate-400" : "font-semibold text-slate-900"}>{v}</span>,
        },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
        {
            key: "date",
            label: "Date",
            render: (v) => <span className="text-xs text-slate-400">{v}</span>,
        },
        {
            key: "actions",
            label: "Details",
            render: (_, row) => (
                <button
                    onClick={() => setDetailModal({ open: true, game: row })}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-indigo-600 transition hover:border-slate-300"
                    aria-label="View round details"
                    title="View"
                >
                    <Eye size={16} />
                </button>
            ),
        },
    ];

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Game History</h1>
                <p className="text-sm text-slate-400">{filtered.length} rounds</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <SearchFilter
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by round ID or game type..."
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-11 min-w-[160px] rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in progress">In Progress</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <DataTable columns={columns} data={filtered} flexWrapper={true} />

            <Modal isOpen={detailModal.open} onClose={() => setDetailModal({ open: false, game: null })} title="Round Details" maxWidth={520}>
                {detailModal.game && (
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                { label: "Round ID", value: detailModal.game.id },
                                { label: "Status", value: detailModal.game.status },
                                { label: "Game Type", value: detailModal.game.gameType },
                                { label: "Result", value: detailModal.game.result },
                                { label: "Date", value: detailModal.game.date },
                            ].map((item) => (
                                <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</div>
                                    <div className="mt-1 text-sm font-semibold text-slate-900">
                                        {item.value === "-" ? "N/A" : item.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                            <div className="text-xs font-semibold text-slate-900">Round Notes</div>
                            <div className="mt-1 text-sm text-slate-500">
                                Game Type: {detailModal.game.gameType}
                                <br />
                                Result: {detailModal.game.result === "-" ? "N/A" : detailModal.game.result}
                                <br />
                                Status: {detailModal.game.status}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
