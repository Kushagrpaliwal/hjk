"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Ban, CheckCircle2 } from "lucide-react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import SearchFilter from "../components/SearchFilter";

export default function PlayerManagement() {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [players, setPlayers] = useState([]);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetch("/api/users")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const formatted = data.data.map((u) => ({
                        id: u.id.toString(),
                        name: u.name || u.username,
                        email: u.email || "N/A",
                        phone: u.phone || "N/A",
                        balance: `Rs. ${Number(u.wallet || 0).toLocaleString()}`,
                        status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : "Pending",
                        regDate: new Date(u.created_by).toLocaleDateString(),
                    }));
                    setPlayers(formatted);
                }
            })
            .catch(console.error);
    }, []);

    const filtered = players.filter((p) => {
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.email.toLowerCase().includes(search.toLowerCase()) ||
            p.id.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || p.status.toLowerCase() === filter;
        return matchSearch && matchFilter;
    });

    const handleStatusToggle = async (row) => {
        const nextStatus = row.status?.toLowerCase() === "active" ? "suspended" : "active";
        setUpdatingId(row.id);
        try {
            const res = await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: row.id, status: nextStatus }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to update status");
            }
            const label = nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1);
            setPlayers((prev) =>
                prev.map((p) => (p.id === row.id ? { ...p, status: label } : p))
            );
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    const columns = [
        {
            key: "id",
            label: "Player ID",
            render: (v) => <span className="font-mono text-xs text-indigo-500">{v}</span>,
        },
        { key: "name", label: "Name" },
        { key: "email", label: "Email", render: (v) => <span className="text-slate-500">{v}</span> },
        { key: "phone", label: "Phone", render: (v) => <span className="text-slate-500">{v}</span> },
        {
            key: "balance",
            label: "Wallet Balance",
            render: (v) => <span className="font-semibold text-slate-900">{v}</span>,
        },
        { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
        {
            key: "regDate",
            label: "Registered",
            render: (v) => <span className="text-xs text-slate-400">{v}</span>,
        },
        {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/players/${row.id}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-indigo-600 shadow-sm transition hover:border-slate-300 hover:text-indigo-700"
                        aria-label="View player"
                        title="View"
                    >
                        <Eye size={18} />
                    </Link>
                    {row.status?.toLowerCase() === "active" ? (
                        <button
                            type="button"
                            onClick={() => handleStatusToggle(row)}
                            disabled={updatingId === row.id}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-red-500 shadow-sm transition hover:border-slate-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Suspend player"
                            title="Suspend"
                        >
                            <Ban size={18} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleStatusToggle(row)}
                            disabled={updatingId === row.id}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-emerald-600 shadow-sm transition hover:border-slate-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Activate player"
                            title="Activate"
                        >
                            <CheckCircle2 size={18} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Player Management</h1>
                    <p className="text-sm text-slate-400">{filtered.length} players found</p>
                </div>
            </div>

            <SearchFilter
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name, email, or ID..."
                filterOptions={[
                    { value: "all", label: "All Players" },
                    { value: "active", label: "Active" },
                    { value: "suspended", label: "Suspended" },
                ]}
                filterValue={filter}
                onFilterChange={setFilter}
            />

            <DataTable columns={columns} data={filtered} itemsPerPage={8} flexWrapper={true} />
        </div>
    );
}
