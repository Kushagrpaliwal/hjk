"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Wallet, ShieldCheck, ShieldOff, Mail, Phone, 
  Calendar, Hash, Activity, Trophy, ArrowUpCircle, ArrowDownCircle 
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";

// --- Helpers ---
const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const formatMoney = (value) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value || 0);

export default function PlayerDetailPage() {
    const params = useParams();
    const playerId = useMemo(() => {
        const rawId = params?.id;
        return Array.isArray(rawId) ? rawId[0] : rawId;
    }, [params]);

    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!playerId) return;
        
        const fetchPlayer = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/users/${playerId}`);
                const data = await res.json();
                if (!data.success) throw new Error(data.error || "Failed to load player");
                setPlayer(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayer();
    }, [playerId]);

    const displayName = useMemo(() => player?.name || player?.username || "Unknown Player", [player]);
    const statusLabel = useMemo(() => {
        if (!player?.status) return "Pending";
        return player.status.charAt(0).toUpperCase() + player.status.slice(1);
    }, [player]);

    const initials = useMemo(() => 
        displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    , [displayName]);

    const handleStatusToggle = async () => {
        if (!player || updating) return;
        const nextStatus = player.status?.toLowerCase() === "active" ? "suspended" : "active";
        setUpdating(true);
        try {
            const res = await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: player.id, status: nextStatus }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setPlayer(prev => ({ ...prev, status: nextStatus }));
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-slate-500">Loading Profile...</div>;
    if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/admin/players" className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Directory
                </Link>
                <div className="text-xs text-slate-400 font-mono">UID: {player?.id}</div>
            </div>

            {/* Profile Header Card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-violet-700" />
                
                <div className="relative px-8 pt-16 pb-8">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            {/* Avatar */}
                            <div className="relative h-32 w-32 rounded-3xl bg-white p-1.5 shadow-xl">
                                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-50 text-4xl font-black text-indigo-600">
                                    {initials}
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white p-1 shadow">
                                    <div className={`h-full w-full rounded-full ${player?.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                </div>
                            </div>
                            
                            <div className="mb-2">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl font-black text-slate-900">{displayName}</h1>
                                    <StatusBadge status={statusLabel} />
                                </div>
                                <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500">
                                    <span className="flex items-center gap-1.5 text-sm"><Mail size={16} /> {player?.email}</span>
                                    <span className="flex items-center gap-1.5 text-sm"><Phone size={16} /> {player?.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm">
                                    <Wallet className="text-indigo-600" size={24} />
                                </div>
                                <div className="pr-4">
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Balance</p>
                                    <p className="text-xl font-black text-slate-900">{formatMoney(player?.wallet)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Bar */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-8 py-4">
                    <div className="flex gap-4">
                        <button
                            onClick={handleStatusToggle}
                            disabled={updating}
                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                                player?.status?.toLowerCase() === "active" 
                                ? "bg-white text-red-600 border border-red-100 hover:bg-red-50" 
                                : "bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
                            }`}
                        >
                            {player?.status?.toLowerCase() === "active" ? (
                                <><ShieldOff size={18} /> Suspend Account</>
                            ) : (
                                <><ShieldCheck size={18} /> Reactivate Account</>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 italic">Account created: {formatDate(player?.created_by)}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Activity size={20} />} label="Total Games" value={player?.stats?.totalGames ?? 0} color="blue" />
                <StatCard icon={<Trophy size={20} />} label="Wins" value={player?.stats?.totalWins ?? 0} color="emerald" />
                <StatCard icon={<ArrowUpCircle size={20} />} label="Deposits" value={formatMoney(player?.stats?.totalDeposits)} color="violet" />
                <StatCard icon={<ArrowDownCircle size={20} />} label="Withdrawals" value={formatMoney(player?.stats?.totalWithdrawals)} color="amber" />
            </div>

            {/* Detailed Info Section */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Hash size={20} className="text-indigo-600" /> Administrative Details
                    </h3>
                    <div className="space-y-4">
                        <DetailRow label="System Username" value={player?.username} />
                        <DetailRow label="Email Address" value={player?.email} />
                        <DetailRow label="Contact Number" value={player?.phone} />
                        <DetailRow label="Last Record Update" value={formatDate(player?.updated_by)} />
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                        <Calendar size={32} />
                    </div>
                    <h3 className="font-bold text-slate-900">Activity History</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-[200px]">Historical data for this player is not yet available.</p>
                </div>
            </div>
        </div>
    );
}

// --- Sub-components for cleaner code ---

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: "text-blue-600 bg-blue-50",
        emerald: "text-emerald-600 bg-emerald-50",
        violet: "text-violet-600 bg-violet-50",
        amber: "text-amber-600 bg-amber-50",
    };
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-hover hover:border-indigo-200">
            <div className={`inline-flex p-3 rounded-2xl mb-4 ${colors[color]}`}>{icon}</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className="text-sm font-bold text-slate-900">{value || "N/A"}</span>
        </div>
    );
}
