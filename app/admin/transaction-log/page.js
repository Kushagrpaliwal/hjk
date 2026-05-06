"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import SearchFilter from "../components/SearchFilter";

const toDisplay = (value, fallback = "-") =>
  value === null || value === undefined || value === "" ? fallback : value;

const amountClass = (value) => ({
  color: Number(value || 0) >= 0 ? "#16A34A" : "#DC2626",
  fontWeight: 700,
});

const formatAmount = (value) => `₹${Number(value || 0).toLocaleString()}`;

export default function TransactionLogPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/transaction-log")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRows(data.data || []);
      })
      .catch((err) => {
        console.error("Failed to load transaction log:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const query = search.toLowerCase();
    return rows.filter((row) => {
      const matchesType =
        typeFilter === "all" ||
        String(row.transactionType || "").toLowerCase() === typeFilter;
      const matchesSource =
        sourceFilter === "all" ||
        String(row.referenceSource || "").toLowerCase() === sourceFilter;
      const matchesSearch = [
        row.id,
        row.betId,
        row.username,
        row.eventName,
        row.marketName,
        row.runnerName,
        row.transactionType,
      ]
        .map((item) => String(item || "").toLowerCase())
        .some((item) => item.includes(query));

      return matchesType && matchesSource && matchesSearch;
    });
  }, [rows, search, typeFilter, sourceFilter]);

  const columns = [
    {
      key: "id",
      label: "Log ID",
      render: (value) => (
        <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#5B6CFF" }}>
          LOG-{value}
        </span>
      ),
    },
    {
      key: "betId",
      label: "Bet ID",
      render: (value) => (
        <span style={{ fontFamily: "monospace", fontSize: 12.5, color: "#7C3AED" }}>
          {value ? `SPT-${value}` : "-"}
        </span>
      ),
    },
    { key: "username", label: "Player", render: (value) => toDisplay(value) },
    { key: "referenceSource", label: "Source", render: (value) => toDisplay(value) },
    { key: "transactionType", label: "Action", render: (value) => toDisplay(value) },
    { key: "eventName", label: "Event", render: (value) => toDisplay(value) },
    { key: "marketName", label: "Market", render: (value) => toDisplay(value) },
    {
      key: "selection",
      label: "Selection",
      render: (_, row) => `${toDisplay(row.runnerName)} (${toDisplay(row.betType)})`,
    },
    { key: "gameType", label: "Game Type", render: (value) => toDisplay(value) },
    { key: "odds", label: "Odds", render: (value) => toDisplay(value) },
    { key: "stake", label: "Stake", render: (value) => formatAmount(value) },
    {
      key: "previousBalance",
      label: "Previous Balance",
      render: (value) => formatAmount(value),
    },
    {
      key: "profitLoss",
      label: "Profit/Loss",
      render: (value) => (
        <span style={amountClass(value)}>
          {Number(value || 0) >= 0 ? "+" : ""}
          {formatAmount(value)}
        </span>
      ),
    },
    {
      key: "currentBalance",
      label: "Current Balance",
      render: (value) => <span style={{ fontWeight: 700 }}>{formatAmount(value)}</span>,
    },
    {
      key: "createdAt",
      label: "Created At",
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
            Sports Transaction Log
          </h1>
          <p style={{ fontSize: 14, color: "#94A3B8" }}>{filteredRows.length} records</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by user, bet id, event, market, selection..."
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
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
          <option value="all">All Actions</option>
          <option value="bet_placed">BET_PLACED</option>
          <option value="bet_settled">BET_SETTLED</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
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
          <option value="all">All Sources</option>
          <option value="sports">sports</option>
          <option value="deposit">deposit</option>
          <option value="withdrawal">withdrawal</option>
          <option value="admin_wallet">admin_wallet</option>
          <option value="dice_one">dice_one</option>
          <option value="dice_two">dice_two</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredRows} loading={loading} itemsPerPage={10} />
    </div>
  );
}
