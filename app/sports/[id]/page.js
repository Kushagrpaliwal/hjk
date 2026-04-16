"use client";

import Link from "next/link";
import { use, useEffect, useState, useRef, useCallback } from "react";
import Loader from "../../../components/Loader";

// ── Helpers ────────────────────────────────────────────────────────────────

function extractTeams(market) {
  if (!market?.section || market.section.length < 2)
    return { team1: null, team2: null };

  const parse = (sec) => {
    const odds = sec.odds || [];
    const backs = odds
      .filter((o) => o.otype === "back")
      .sort((a, b) => b.tno - a.tno);
    const lays = odds
      .filter((o) => o.otype === "lay")
      .sort((a, b) => a.tno - b.tno);
    const pad = (arr) =>
      [...arr, {}, {}, {}].slice(0, 3).map((o) => ({
        odds: o.odds || 0,
        size: o.size || 0,
        oname: o.oname || "",
      }));
    return {
      name: sec.nat || "TBD",
      sid: sec.sid,
      status: sec.gstatus || "ACTIVE",
      backs: pad(backs),
      lays: pad(lays),
    };
  };

  return { team1: parse(market.section[0]), team2: parse(market.section[1]) };
}

// ── Inline Bet Slip ─────────────────────────────────────────────────────────

function computeSlipProfit(selection, stakeNum) {
  const odds = Number(selection?.odds);
  if (!stakeNum || !Number.isFinite(stakeNum) || !Number.isFinite(odds)) return 0;
  const isMatchOdds =
    selection?.market_type === "MatchOdds" || selection?.match_type === "MatchOdds";
  const isBookmaker =
    selection?.market_type === "Bookmaker" || selection?.match_type === "Bookmaker";
  if ((isMatchOdds || isBookmaker) && selection?.betType === "lay") {
    return stakeNum;
  }
  if (isBookmaker && selection?.betType === "back") {
    return (odds * stakeNum) / 100;
  }
  // Match odds back, fancy, etc.
  return stakeNum * (odds - 1);
}

function BetSlip({ selection, onPlace, onClose, onToast }) {
  const [stake, setStake] = useState("");
  const [placing, setPlacing] = useState(false);
  const isBlue = selection.betType === "back";
  const isFancyBet =
    String(selection?.market_type || "").toLowerCase() === "fancy" ||
    String(selection?.match_type || "").toLowerCase() === "fancy";
  const stakeNum = stake ? parseFloat(stake) : NaN;
  const profit = Number.isFinite(stakeNum)
    ? computeSlipProfit(selection, stakeNum).toFixed(2)
    : "0.00";

    const handlePlace = async () => {
      if (!stake || placing) return;
      if (Number(stake) < 10) {
        onToast?.("Minimum bet amount is 10", "error");
        return;
      }
    setPlacing(true);
    try {
      await onPlace({
        odds: selection.odds,
        size: selection.size,
        stake: parseFloat(stake),
        runnerName: selection.runnerName,
        betType: selection.betType === "back" ? "Back" : "Lay",
        betTypeLabel: selection.betTypeLabel || (selection.betType === "back" ? "Back" : "Lay"),
        match_type: selection.match_type,
        market_name: selection.market_name,
        market_type: selection.market_type,
        oddName: selection.oddName,
        market_id: selection.market_id,
        runnerId: selection.runnerId,
      });
      setStake("");
    } catch (err) {
      onToast?.(err.message || "Failed to place bet", "error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div
      className={`rounded-xl shadow-lg mt-2 overflow-hidden ${isBlue ? "bg-[#E6F7FF]" : "bg-[#FDE8E8]"
        }`}
    >
      {/* Header row */}
      <div
        className={`flex items-center justify-between px-4 py-2 ${isBlue ? "bg-[#CFEAFE]" : "bg-[#FEE2E2]"
          }`}
      >
        <div className="flex items-center gap-2 text-black font-bold text-xs uppercase">
          <span>{selection.betTypeLabel || (isBlue ? "Back" : "Lay")}</span>
          <span className="text-sm font-black text-blue-800">
            {selection.odds}
          </span>
        </div>
        {!isFancyBet && (
          <span className="text-xs font-bold text-gray-600">
            Profit: <span className="text-blue-800">₹{profit}</span>
          </span>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Stake"
            value={stake}
            onChange={(e) => setStake(e.target.value.replace(/[^0-9]/g, ""))}
            className="px-3 py-1.5 rounded-lg border border-gray-300 w-24 font-bold text-center text-sm text-black"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-black font-bold text-lg hover:text-red-500 leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* Quick amounts */}
      <div className="flex flex-wrap gap-2 px-4 py-3 bg-white/50 justify-center">
        {[100, 500, 1000, 10000, 50000].map((amt) => (
          <button
            key={amt}
            onClick={() => setStake(amt.toString())}
            className="text-[#14294A] font-bold px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs shadow-sm"
          >
            {amt.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Place bet */}
      <button
        onClick={handlePlace}
        disabled={!stake || placing}
        className="w-full bg-[#14294A] text-white font-bold py-2.5 hover:bg-[#1e3a6a] transition-all disabled:opacity-50 text-sm"
      >
        {placing ? "Placing..." : "Place Bet"}
      </button>
    </div>
  );
}

// ── Odds button ─────────────────────────────────────────────────────────────

function OddsBtn({ value, size, isBack, onClick, isSelected, isBlink }) {
  const base = isBack
    ? "bg-blue-100 hover:bg-blue-200 text-blue-800"
    : "bg-rose-100 hover:bg-rose-200 text-rose-600";
  const ring = isSelected ? "ring-2 ring-offset-1 ring-blue-500" : "";
  const blink = isBlink ? "bg-yellow-200 text-slate-900" : "";
  return (
    <button
      onClick={onClick}
      disabled={!value || value === 0}
      className={`w-[56px] h-[40px] rounded-md text-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center ${base} ${ring} ${blink}`}
    >
      <div className="text-[13px] font-bold leading-none">{value || "-"}</div>
      <div className="text-[10px] mt-0.5 opacity-60 font-medium">
        {size || ""}
        </div>
      </button>
  );
}

// ── Success Modal ────────────────────────────────────────────────────────

function SuccessModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Bet Placed!</h2>
        <p className="text-slate-500 font-medium mb-8">
          Your wager has been successfully submitted and confirmed.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#0B3B8A] hover:bg-[#1a5bc4] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
        >
          Awesome
        </button>
      </div>
    </div>
  );
}

// ── No Data placeholder ──────────────────────────────────────────────────────

const NoData = () => (
  <div className="py-8 text-center text-slate-400 text-sm font-medium">
    No Data Available
  </div>
);

// ── Recent Bets sidebar ──────────────────────────────────────────────────────

function BetsSidebar({ bets, loading }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-6">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-[#0B3B8A] flex items-center gap-2 text-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          Recent Bets
        </h3>
        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">
          Last 24h
        </span>
      </div>

      <div className="p-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {loading ? (
          <div className="text-center py-6 text-gray-400 text-[10px]">
            Loading bets...
          </div>
        ) : bets.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-[10px]">
            No recent wagers
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bets.map((bet, i) => {
              const statusColor =
                bet.status === "Won"
                  ? "bg-green-100 text-green-700"
                  : bet.status === "Pending"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700";
              return (
                <div
                  key={i}
                  className="bg-gray-50 rounded-lg p-2 border border-gray-100 hover:border-blue-200 transition-all"
                >
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-bold text-xs text-gray-900 truncate pr-2">
                      {bet.runnerName}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${statusColor}`}
                    >
                      {bet.status}
                    </span>
                  </div>
                    <div className="flex justify-between text-[10px] text-gray-500">
                    <span>{bet.match_type}</span>
                    <span className="font-semibold text-gray-700">
                      {bet.betType}
                    </span>
                  </div>
                    <div className="mt-1.5 flex justify-between items-center pt-1.5 border-t border-gray-200/60">
                    <div className="flex gap-3">
                      <div className="flex flex-col">
                          <span className="text-[9px] uppercase text-gray-400 font-bold">
                          Odds
                        </span>
                          <span className="text-[11px] font-bold text-gray-900">
                          {bet.odds}
                        </span>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-[9px] uppercase text-gray-400 font-bold">
                          Stake
                        </span>
                          <span className="text-[11px] font-bold text-gray-900">
                          ₹{bet.stake}
                        </span>
                      </div>
                    </div>
                    <time className="text-[9px] text-gray-400">
                      {new Date(bet.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 bg-blue-50/50 border-t border-gray-100">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-gray-600 font-medium">Total Bets:</span>
          <span className="font-bold text-[#0B3B8A]">{bets.length}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function CricketBettingPage({ params }) {
  const { id } = use(params);

  const [matchdata, setMatchdata] = useState([]);
  const [matchodds, setMatchodds] = useState(null);
  const [bookmaker, setBookmaker] = useState(null);
  const [fancy, setFancy] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recent bets
  const [recentBets, setRecentBets] = useState([]);
  const [betsLoading, setBetsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [username, setUsername] = useState("");
  const [userWallet, setUserWallet] = useState(0);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [liveScoreStatus, setLiveScoreStatus] = useState("loading");

  // Bet modal
  const [selection, setSelection] = useState(null); // { runnerName, odds, size, betType, gameType, marketName, oddName, marketId, runnerId, rowKey }
  const autoCloseRef = useRef(null);
  const oddsBlinkTimeoutRef = useRef(null);
  const prevOddsRef = useRef(new Map());
  const [blinkKeys, setBlinkKeys] = useState(new Set());

  // ── Fetch odds ────────────────────────────────────────────────────────────

  const fetchMatchDetails = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/sports/matchbookfancy?gmid=${id}`
      );
      const data = await res.json();
      const all = data.data || [];
      setMatchdata(all);
      setMatchodds(all.find((m) => m.mname === "MATCH_ODDS") || null);
      setBookmaker(all.find((m) => m.mname === "Bookmaker") || null);
      setFancy(all.find((m) => m.gtype === "fancy") || null);
    } catch (err) {
      console.error("Fetch match error", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMatchDetails();
    const interval = setInterval(fetchMatchDetails, 20000);

    /*
    // Logic to fire the API per second (commented out for now)
    // const fastInterval = setInterval(async () => {
    //   try {
    //     const res = await fetch(`http://46.202.166.160:3009/getPriveteData?gmid=${id}&sid=4&key=${process.env.NEXT_PUBLIC_SPORTS_API_KEY}`);
    //     const data = await res.json();
    //     const all = data.data || [];
    //     setMatchdata(all);
    //     setMatchodds(all.find((m) => m.mname === "MATCH_ODDS") || null);
    //     setBookmaker(all.find((m) => m.mname === "Bookmaker") || null);
    //     setFancy(all.find((m) => m.gtype === "fancy") || null);
    //   } catch (err) {
    //     console.error("1s interval fetch error:", err);
    //   }
    // }, 1000);
    */

    return () => clearInterval(interval);
  }, [fetchMatchDetails, id]);

  useEffect(() => {
    let ignore = false;
    const checkLiveScore = async () => {
      setLiveScoreStatus("loading");
      try {
        const res = await fetch(`/api/live-score?gmid=${id}`);
        const json = await res.json();
        if (ignore) return;
        setLiveScoreStatus(json.ok ? "ok" : "error");
      } catch (err) {
        if (!ignore) setLiveScoreStatus("error");
      }
    };

    if (id) checkLiveScore();
    return () => {
      ignore = true;
    };
  }, [id]);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/user-api/profile", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.user?.username || data.user?.name || "");
          setUserWallet(Number(data.user?.wallet || 0));
        }
      } catch (err) {
        console.error("Fetch user profile error", err);
      }
    };

    fetchUserProfile();
  }, []);

  // ── Fetch bets ────────────────────────────────────────────────────────────

  const fetchBets = useCallback(async () => {
    try {
      if (!username) return;
      const res = await fetch(`/api/getBets?username=${username}`);
      const json = await res.json();
      if (json.success) setRecentBets(json.bets || []);
    } catch (err) {
      console.error("Fetch bets error", err);
    } finally {
      setBetsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (username) fetchBets();
  }, [fetchBets, username]);

  // ── Auto-close modal after 15s ────────────────────────────────────────────

  useEffect(() => {
    clearTimeout(autoCloseRef.current);
    if (selection) {
      autoCloseRef.current = setTimeout(() => setSelection(null), 15000);
    }
    return () => clearTimeout(autoCloseRef.current);
  }, [selection]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2600);
  }, []);

  // Blink odds when values change
  useEffect(() => {
    const nextMap = new Map();
    const changedKeys = new Set();

    const collect = (teams, marketType) => {
      if (!teams?.team1 && !teams?.team2) return;
      [teams.team1, teams.team2].forEach((team, teamIdx) => {
        if (!team) return;
        const rowKeyBase = `${marketType}-row${teamIdx}`;
        const backs = [...team.backs].reverse();
        backs.forEach((b, idx) => {
          const key = `${rowKeyBase}-back${idx}`;
          const val = `${b.odds}|${b.size}`;
          nextMap.set(key, val);
          const prevVal = prevOddsRef.current.get(key);
          if (prevVal !== undefined && prevVal !== val) changedKeys.add(key);
        });
        team.lays.forEach((l, idx) => {
          const key = `${rowKeyBase}-lay${idx}`;
          const val = `${l.odds}|${l.size}`;
          nextMap.set(key, val);
          const prevVal = prevOddsRef.current.get(key);
          if (prevVal !== undefined && prevVal !== val) changedKeys.add(key);
        });
      });
    };

    collect(extractTeams(matchodds), "MatchOdds");
    collect(extractTeams(bookmaker), "Bookmaker");

    if (changedKeys.size > 0) {
      setBlinkKeys(new Set(changedKeys));
      clearTimeout(oddsBlinkTimeoutRef.current);
      oddsBlinkTimeoutRef.current = setTimeout(() => {
        setBlinkKeys(new Set());
      }, 200);
    }

    prevOddsRef.current = nextMap;
    return () => clearTimeout(oddsBlinkTimeoutRef.current);
  }, [matchodds, bookmaker]);

  // ── Handle odds click ─────────────────────────────────────────────────────

  const handleOddsClick = (sel) => {
    // Toggle off if same button clicked again
    if (
      selection?.rowKey === sel.rowKey &&
      selection?.odds === sel.odds &&
      selection?.betType === sel.betType
    ) {
      setSelection(null);
    } else {
      setSelection(sel);
    }
  };

  // ── Place bet ─────────────────────────────────────────────────────────────

  const handlePlaceBet = async (betData) => {
    if (!username) throw new Error("User not logged in");

    const body = {
      sportName: "Cricket",
      event_id: id,
      event_name: `${team1Name} vs ${team2Name}`,
      ...betData,
    };

    const res = await fetch(`/api/addBets?username=${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed to place bet");
    setShowSuccessModal(true);
    showToast(json.message || "Bet placed successfully", "success");
    if (typeof json.walletRemaining === "number") {
      setUserWallet(json.walletRemaining);
    }

    setSelection(null);
    fetchBets(); // refresh sidebar
    return json;
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const moTeams = extractTeams(matchodds);
  const bmTeams = extractTeams(bookmaker);

  const team1Name =
    moTeams.team1?.name ||
    bmTeams.team1?.name ||
    matchodds?.section?.[0]?.nat ||
    "Team 1";
  const team2Name =
    moTeams.team2?.name ||
    bmTeams.team2?.name ||
    matchodds?.section?.[1]?.nat ||
    "Team 2";

  // ── Render odds table rows ──────────────────────────────────────────────

  function renderMarketRows(teams, market, gameType) {
    const rows = [
      { team: teams.team1, key: `${gameType}-row0` },
      { team: teams.team2, key: `${gameType}-row1` },
    ].filter((r) => r.team);

    if (rows.length === 0) return <NoData />;

    return rows.map(({ team, key }) => {
      const isSelectedRow = selection?.rowKey?.startsWith(key);
      return (
        <div key={key}>
          <div
            className={`flex items-center justify-between px-4 py-3 border-b border-slate-50 transition ${isSelectedRow ? "bg-blue-50/40" : "hover:bg-slate-50/60"
              }`}
          >
            <div className="flex items-center gap-2 min-w-[140px]">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-[#0d1b6e]">
                {team.name?.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {team.name}
              </span>
            </div>

            <div className="flex gap-1">
              {/* Mobile: show only first back + lay */}
              <div className="flex gap-1 sm:hidden">
                {[...team.backs].reverse().slice(0, 1).map((b, idx) => {
                  const rowKey = `${key}-back${idx}`;
                  return (
                    <OddsBtn
                      key={rowKey}
                      value={b.odds}
                      size={b.size}
                      isBack={true}
                      isSelected={selection?.rowKey === rowKey}
                      isBlink={blinkKeys.has(rowKey)}
                      onClick={() =>
                        handleOddsClick({
                          rowKey,
                          runnerName: team.name,
                          odds: b.odds,
                          size: b.size,
                          betType: "back",
                          betTypeLabel: "Back",
                          match_type: gameType,
                          market_name: market?.mname,
                          market_type: gameType,
                          oddName: b.oname,
                          market_id: market?.mid,
                          runnerId: team.sid,
                        })
                      }
                    />
                  );
                })}
                {team.lays.slice(0, 1).map((l, idx) => {
                  const rowKey = `${key}-lay${idx}`;
                  return (
                    <OddsBtn
                      key={rowKey}
                      value={l.odds}
                      size={l.size}
                      isBack={false}
                      isSelected={selection?.rowKey === rowKey}
                      isBlink={blinkKeys.has(rowKey)}
                      onClick={() =>
                        handleOddsClick({
                          rowKey,
                          runnerName: team.name,
                          odds: l.odds,
                          size: l.size,
                          betType: "lay",
                          betTypeLabel: "Lay",
                          match_type: gameType,
                          market_name: market?.mname,
                          market_type: gameType,
                          oddName: l.oname,
                          market_id: market?.mid,
                          runnerId: team.sid,
                        })
                      }
                    />
                  );
                })}
              </div>

              {/* Desktop: show all backs + lays */}
              <div className="hidden sm:flex gap-1">
                {/* Back buttons (highest->lowest) */}
                {[...team.backs].reverse().map((b, idx) => {
                  const rowKey = `${key}-back${idx}`;
                  return (
                    <OddsBtn
                      key={rowKey}
                      value={b.odds}
                      size={b.size}
                      isBack={true}
                      isSelected={selection?.rowKey === rowKey}
                      isBlink={blinkKeys.has(rowKey)}
                      onClick={() =>
                        handleOddsClick({
                          rowKey,
                          runnerName: team.name,
                          odds: b.odds,
                          size: b.size,
                          betType: "back",
                          betTypeLabel: "Back",
                          match_type: gameType,
                          market_name: market?.mname,
                          market_type: gameType,
                          oddName: b.oname,
                          market_id: market?.mid,
                          runnerId: team.sid,
                        })
                      }
                    />
                  );
                })}
                {/* Lay buttons */}
                {team.lays.map((l, idx) => {
                  const rowKey = `${key}-lay${idx}`;
                  return (
                    <OddsBtn
                      key={rowKey}
                      value={l.odds}
                      size={l.size}
                      isBack={false}
                      isSelected={selection?.rowKey === rowKey}
                      isBlink={blinkKeys.has(rowKey)}
                      onClick={() =>
                        handleOddsClick({
                          rowKey,
                          runnerName: team.name,
                          odds: l.odds,
                          size: l.size,
                          betType: "lay",
                          betTypeLabel: "Lay",
                          match_type: gameType,
                          market_name: market?.mname,
                          market_type: gameType,
                          oddName: l.oname,
                          market_id: market?.mid,
                          runnerId: team.sid,
                        })
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Inline bet slip */}
          {isSelectedRow && selection && (
            <div className="px-4 pb-3">
              <BetSlip
                selection={selection}
                onPlace={handlePlaceBet}
                onClose={() => setSelection(null)}
                onToast={showToast}
              />
            </div>
          )}
        </div>
      );
    });
  }

  // ── Fancy rows ────────────────────────────────────────────────────────────

  function renderFancyRows() {
    const sections = fancy?.section;
    if (!sections?.length) return <NoData />;

    return sections.map((sec) => {
      const backOdd = sec.odds?.find((o) => o.otype === "back");
      const layOdd = sec.odds?.find((o) => o.otype === "lay");
      const rowKeyBase = `fancy-${sec.sid}`;
      const isSelectedRow =
        selection?.rowKey?.startsWith(rowKeyBase);

      return (
        <div key={sec.sid}>
          <div
            className={`flex items-center justify-between px-4 py-3 border-b border-slate-50 transition ${isSelectedRow ? "bg-rose-50/40" : "hover:bg-slate-50/60"
              }`}
          >
            <div className="flex items-center gap-2 min-w-[140px]">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-[#0d1b6e]">
                F
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {sec.nat}
              </span>
            </div>
            <div className="flex gap-1.5">
              {/* No = lay (blue) */}
              <OddsBtn
                value={layOdd?.odds}
                size={layOdd?.size}
                isBack={true}
                isSelected={selection?.rowKey === `${rowKeyBase}-no`}
                onClick={() =>
                  handleOddsClick({
                    rowKey: `${rowKeyBase}-no`,
                    runnerName: sec.nat,
                    odds: layOdd?.odds,
                    size: layOdd?.size,
                    betType: "lay",
                    betTypeLabel: "No",
                    match_type: "Fancy",
                    market_name: fancy?.mname,
                    market_type: "FANCY",
                    oddName: layOdd?.oname,
                    market_id: fancy?.mid,
                    runnerId: sec.sid,
                  })
                }
              />
              {/* Yes = back (rose) */}
              <OddsBtn
                value={backOdd?.odds}
                size={backOdd?.size}
                isBack={false}
                isSelected={selection?.rowKey === `${rowKeyBase}-yes`}
                onClick={() =>
                  handleOddsClick({
                    rowKey: `${rowKeyBase}-yes`,
                    runnerName: sec.nat,
                    odds: backOdd?.odds,
                    size: backOdd?.size,
                    betType: "back",
                    betTypeLabel: "Yes",
                    match_type: "Fancy",
                    market_name: fancy?.mname,
                    market_type: "FANCY",
                    oddName: backOdd?.oname,
                    market_id: fancy?.mid,
                    runnerId: sec.sid,
                  })
                }
              />
            </div>
          </div>

          {isSelectedRow && selection && (
            <div className="px-4 pb-3">
              <BetSlip
                selection={selection}
                onPlace={handlePlaceBet}
                onClose={() => setSelection(null)}
                onToast={showToast}
              />
            </div>
          )}
        </div>
      );
    });
  }

  // ── TABLE CARD helper ─────────────────────────────────────────────────────

  function TableCard({ title, backLabel = "Back", layLabel = "Lay", children }) {
    return (
      <div className="px-4 pb-5">
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow shadow-green-400 inline-block" />
              <span className="text-xs font-bold text-slate-700 tracking-widest uppercase">
                {title}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-[80px] text-center text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                {backLabel}
              </div>
              <div className="w-[80px] text-center text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                {layLabel}
              </div>
            </div>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#eef2f7] font-sans">
      {toast ? (
        <div className="fixed top-4 right-4 z-[120] animate-[slideIn_.2s_ease-out]">
          <div
            className={`px-4 py-3 rounded-xl border text-sm font-bold shadow-[0_10px_30px_rgba(0,0,0,0.2)] ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : toast.type === "error"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
      {/* Header */}
        <div className="bg-gradient-to-r from-[#0B3B8A] to-[#1a5bc4] text-white">
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <img src="/cricket-ball.png" className="w-8 h-8" alt="Cricket" />
                <div>
                  <h1 className="text-xl font-bold">Cricket</h1>
                </div>
              </div>

              <Link href="/deposit">
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-[#39ff14] text-xl">
                  payments
                </span>
                <span className="text-sm font-bold tracking-tight">
                  {userWallet.toLocaleString()}{" "}
                  <span className="text-blue-100 font-medium">₹</span>
                </span>
              </div>
              </Link>
            </div>
          {!loading && matchodds && (
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-sm font-medium truncate max-w-xs">
                {team1Name} vs {team2Name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1200px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* LEFT */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 min-h-[400px]">
            {/* Nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <Link
                href="/sports"
                className="flex items-center gap-2 text-slate-500 text-sm font-medium hover:text-[#0d1b6e] transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Sport
              </Link>
              {!loading && (
                <p className="font-bold text-[#0d1b6e] text-sm">
                  {team1Name} vs {team2Name}
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader message="Loading match details..." />
              </div>
            ) : (
              <>
                {/* Teams Hero */}
                {liveScoreStatus === "ok" && (
                  <div className="mx-4 mt-4">
                    <div className="rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm">
                      <iframe
                        title="Live Score"
                        src={`https://score.akamaized.uk/diamond-live-score?id=${id}`}
                        className="w-full h-[220px] bg-white"
                      />
                    </div>
                  </div>
                )}
                <div className="bg-slate-50 mx-4 my-4 rounded-xl px-8 py-8">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center">
                        <span className="font-bold text-[#0d1b6e] text-3xl">
                          {team1Name?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-bold text-[#0d1b6e] tracking-widest text-xs">
                        {team1Name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-400 text-2xl">
                      VS
                    </span>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 shadow-md flex items-center justify-center">
                        <span className="font-bold text-[#0d1b6e] text-3xl">
                          {team2Name?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-bold text-[#0d1b6e] tracking-widest text-xs">
                        {team2Name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Odds */}
                {moTeams.team1 && moTeams.team2 && (
                  <TableCard
                    title="Match Odds"
                    backLabel="Back"
                    layLabel="Lay"
                  >
                    {renderMarketRows(moTeams, matchodds, "MatchOdds")}
                  </TableCard>
                )}

                {/* Bookmaker */}
                {bmTeams.team1 && bmTeams.team2 && (
                  <TableCard
                    title="Bookmaker"
                    backLabel="Back"
                    layLabel="Lay"
                  >
                    {renderMarketRows(bmTeams, bookmaker, "Bookmaker")}
                  </TableCard>
                )}

                {/* Fancy */}
                {fancy?.section?.length > 0 && (
                  <TableCard
                    title="Fancy"
                    backLabel="No"
                    layLabel="Yes"
                  >
                    {renderFancyRows()}
                  </TableCard>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-[320px] w-full shrink-0">
          <BetsSidebar bets={recentBets} loading={betsLoading} />
        </div>
      </div>
      {showSuccessModal && (
        <SuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
    </div>
  );
}
