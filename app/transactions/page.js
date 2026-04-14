"use client";

import { useState, useEffect } from "react";
import BottomNav from "../../components/BottomNav";
import {
  ArrowDown,
  ArrowUp,
  Gamepad2,
  Search,
  Loader2, // Added for loading state
} from "lucide-react";

export default function TransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Assuming your API route is /api/user/profile
        const response = await fetch("/api/user-api/profile"); 
        const data = await response.json();

        if (response.ok && data.user?.history) {
          const { recharges, withdrawals, bets } = data.user.history;

          // Transform different table data into a unified transaction format
          const unifiedData = [
            ...recharges.map((item) => ({
              id: `rec-${item.id}`,
              type: "deposit",
              amount: item.amount,
              date: new Date(item.created_by),
              description: `Recharge: ${item.transaction_id}`,
              status: item.status,
            })),
            ...withdrawals.map((item) => ({
              id: `wit-${item.id}`,
              type: "withdrawal",
              amount: item.amount,
              date: new Date(item.created_by),
              description: `Withdrawal to ${item.bank_holder}`,
              status: item.status,
            })),
            ...bets.map((item) => ({
              id: `bet-${item.id}`,
              type: "gameplay",
              amount: item.bet_amount,
              date: new Date(item.created_by),
              description: `Bet on ${item.game_type} (${item.bet_on})`,
              status: item.status,
            })),
          ];

          // Sort by date (newest first)
          unifiedData.sort((a, b) => b.date - a.date);
          setTransactions(unifiedData);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filtered = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
    );

  const formatDate = (d) => {
    return d.toLocaleDateString(undefined, { 
        year: "numeric", month: "short", day: "numeric", hour: '2-digit', minute: '2-digit' 
    });
  };

  const iconFor = (type) => {
    if (type === "deposit") return <ArrowDown className="text-green-400" />;
    if (type === "withdrawal") return <ArrowUp className="text-red-400" />;
    return <Gamepad2 className="text-cyan-400" />;
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] flex flex-col items-center justify-between p-3 font-sans overflow-hidden">
      <div className="flex-1 flex items-start justify-center w-full pt-10">
        <div className="w-full max-w-md rounded-3xl p-4 relative">

          {/* HEADER */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 px-8 py-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-white/20 z-10">
            <h1 className="text-white font-bold tracking-widest text-sm text-nowrap">
              TRANSACTION HISTORY
            </h1>
          </div>

          {/* CONTROLS */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 border border-white/10">
              <input
                type="text"
                placeholder="Search transaction..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-slate-400 py-2 focus:outline-none text-sm"
              />
              <Search className="text-slate-400 w-4 h-4" />
            </div>
            <div className="flex justify-around gap-1">
              {[
                { key: "all", label: "All" },
                { key: "deposit", label: "Deposits" },
                { key: "withdrawal", label: "Withdraws" },
                { key: "gameplay", label: "Bets" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold transition-all 
                    ${filter === f.key ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-white/10 text-slate-400 border border-white/5"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* LIST */}
          <div className="mt-6 space-y-3 overflow-y-auto max-h-[65vh] hide-scrollbar pb-20">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Loader2 className="animate-spin mb-2" />
                <p>Syncing Ledger...</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-10">No records found</p>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    {iconFor(t.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-500">{formatDate(t.date)}</p>
                        <span className={`text-[10px] px-1.5 rounded-md uppercase font-bold ${
                            t.status === 'approved' || t.status === 'won' ? 'text-green-500 bg-green-500/10' : 
                            t.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' : 'text-red-500 bg-red-500/10'
                        }`}>
                            {t.status}
                        </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.type === "withdrawal" || t.status === 'lost' ? "text-red-400" : "text-green-400"}`}>
                      {t.type === "withdrawal" || t.status === 'lost' ? "-" : "+"}
                      {Number(t.amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Chips</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-md pb-2">
        <BottomNav />
      </div>
    </div>
  );
}