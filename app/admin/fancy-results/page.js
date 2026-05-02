"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCcw, Trophy } from "lucide-react";
import DataTable from "../components/DataTable";
import SearchFilter from "../components/SearchFilter";
import Modal from "../components/Modal";

const initialModal = {
  open: false,
  market: null,
  result: "",
};

export default function FancyResultsPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [declareModal, setDeclareModal] = useState(initialModal);

  const loadPendingFancyMarkets = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/fancy-results", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load pending fancy bets");
      }

      setRows(
        data.data.map((item, index) => ({
          id: `${item.marketId}-${item.runnerName}-${index}`,
          eventId: String(item.eventId || "-"),
          eventName: String(item.eventName || "Unknown Event"),
          marketId: String(item.marketId || "-"),
          marketName: String(item.marketName || item.runnerName || "-"),
          runnerName: String(item.runnerName || "-"),
          totalBets: Number(item.totalBets || 0),
          totalStake: Number(item.totalStake || 0),
          firstBetAtRaw: item.firstBetAt || null,
          lastBetAtRaw: item.lastBetAt || null,
          firstBetAt: item.firstBetAt
            ? new Date(item.firstBetAt).toLocaleString()
            : "-",
          lastBetAt: item.lastBetAt
            ? new Date(item.lastBetAt).toLocaleString()
            : "-",
        }))
      );
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Unable to load pending fancy bets",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingFancyMarkets();
  }, []);

  const filteredRows = rows.filter((row) => {
    const needle = search.toLowerCase();
    return (
      row.eventId.toLowerCase().includes(needle) ||
      row.eventName.toLowerCase().includes(needle) ||
      row.marketId.toLowerCase().includes(needle) ||
      row.marketName.toLowerCase().includes(needle) ||
      row.runnerName.toLowerCase().includes(needle)
    );
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const latestTodayTimestamp = rows.reduce((latest, row) => {
    if (!row.lastBetAtRaw) return latest;
    const timestamp = new Date(row.lastBetAtRaw).getTime();
    if (Number.isNaN(timestamp) || timestamp < startOfToday.getTime()) {
      return latest;
    }
    return Math.max(latest, timestamp);
  }, 0);

  const openDeclareModal = (market) => {
    setFeedback({ type: "", message: "" });
    setDeclareModal({
      open: true,
      market,
      result: "",
    });
  };

  const closeDeclareModal = () => {
    if (submitting) return;
    setDeclareModal(initialModal);
  };

  const submitResult = async () => {
    if (!declareModal.market) return;

    const parsedResult = Number(declareModal.result);

    if (!Number.isFinite(parsedResult)) {
      setFeedback({ type: "error", message: "Enter a valid numeric result" });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const adminUserRaw =
        typeof window !== "undefined"
          ? localStorage.getItem("adminUser")
          : null;
      const adminUser = adminUserRaw ? JSON.parse(adminUserRaw) : null;

      const res = await fetch("/api/admin/fancy-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: declareModal.market.eventId,
          eventName: declareModal.market.eventName,
          marketId: declareModal.market.marketId,
          marketName: declareModal.market.marketName,
          runnerName: declareModal.market.runnerName,
          result: parsedResult,
          declaredBy: adminUser?.username || "admin",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to declare fancy result");
      }

      const manualRes = await fetch("/api/getManualResult", {
        method: "POST",
      });
      const manualData = await manualRes.json();

      if (!manualRes.ok || !manualData.success) {
        throw new Error(
          manualData.message ||
            "Result declared, but manual settlement could not be completed"
        );
      }

      const settledBets = Array.isArray(manualData.results)
        ? manualData.results
            .filter(
              (item) =>
                item.marketId === declareModal.market.marketId &&
                item.runnerName === declareModal.market.runnerName
            )
            .reduce((sum, item) => sum + Number(item.settledCount || 0), 0)
        : 0;

      setFeedback({
        type: "success",
        message: `Declared ${parsedResult} for ${declareModal.market.runnerName} in bet_result and settled ${settledBets} pending bet(s) from manual results.`,
      });
      setDeclareModal(initialModal);
      await loadPendingFancyMarkets();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Failed to declare fancy result",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "eventName",
      label: "Event",
      render: (_, row) => (
        <div className="min-w-[220px] whitespace-normal">
          <div className="font-semibold text-slate-900">{row.eventName}</div>
          <div className="text-xs text-slate-400">Event ID: {row.eventId}</div>
        </div>
      ),
    },
    {
      key: "runnerName",
      label: "Fancy Selection",
      render: (_, row) => (
        <div className="min-w-[180px] whitespace-normal">
          <div className="font-semibold text-slate-900">{row.runnerName}</div>
          <div className="text-xs text-slate-400">{row.marketName}</div>
        </div>
      ),
    },
    {
      key: "marketId",
      label: "Market ID",
      render: (value) => (
        <span className="font-mono text-xs text-indigo-600">{value}</span>
      ),
    },
    {
      key: "totalBets",
      label: "Pending Bets",
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      key: "totalStake",
      label: "Total Stake",
      render: (value) => (
        <span className="font-semibold text-slate-900">
          Rs. {value.toFixed(2)}
        </span>
      ),
    },
    {
      key: "lastBetAt",
      label: "Last Bet",
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: "actions",
      label: "Declare",
      render: (_, row) => (
        <button
          onClick={() => openDeclareModal(row)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          <Trophy size={14} />
          Declare Result
        </button>
      ),
    },
  ];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Pending Fancy Results
          </h1>
          <p className="text-sm text-slate-400">
            Review unique pending fancy markets, declare the result into bet_result, and settle pending bets through getManualResult.
          </p>
        </div>

        <button
          onClick={loadPendingFancyMarkets}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {feedback.message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by event, market ID, or fancy selection..."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pending Markets
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {rows.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Pending Bets
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {rows.reduce((sum, row) => sum + row.totalBets, 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Stake
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            Rs.{" "}
            {rows.reduce((sum, row) => sum + row.totalStake, 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <DataTable
          columns={columns}
          data={loading ? [] : filteredRows}
          flexWrapper={true}
          getRowClassName={(row) => {
            if (!row.lastBetAtRaw || !latestTodayTimestamp) return "";
            const rowTimestamp = new Date(row.lastBetAtRaw).getTime();
            return rowTimestamp === latestTodayTimestamp
              ? "bg-yellow-50 hover:!bg-yellow-100"
              : "";
          }}
        />
      </div>

      <Modal
        isOpen={declareModal.open}
        onClose={closeDeclareModal}
        title="Declare Fancy Result"
        maxWidth={560}
      >
        {declareModal.market && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Event
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {declareModal.market.eventName}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Selection
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {declareModal.market.runnerName}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Market ID
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-indigo-600">
                  {declareModal.market.marketId}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Pending Bets
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {declareModal.market.totalBets}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Final Fancy Result
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={declareModal.result}
                onChange={(e) =>
                  setDeclareModal((current) => ({
                    ...current,
                    result: e.target.value,
                  }))
                }
                placeholder="Enter numeric result"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
              <p className="mt-2 text-xs text-slate-400">
                Back wins when bet odds are less than or equal to the declared
                result. Lay wins when bet odds are greater than the declared
                result.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This action stores the declared value in bet_result first, then
              runs manual settlement for pending fancy bets using that table.
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeclareModal}
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={submitResult}
                disabled={submitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {submitting ? "Declaring..." : "Declare Result"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
