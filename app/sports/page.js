"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../../components/Loader";
import BottomNav from "../../components/BottomNav";

const LIVE_FLAG_TRUE = new Set([
  "1",
  "true",
  "y",
  "yes",
  "live",
  "running",
  "inplay",
  "in-play",
  "playing",
]);

const LIVE_FLAG_FALSE = new Set([
  "0",
  "false",
  "n",
  "no",
  "upcoming",
  "scheduled",
  "pre",
  "preplay",
  "pending",
  "finished",
]);

const normalizeLiveFlag = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    if (value > 0) return true;
    if (value === 0) return false;
  }
  const normalized = String(value).trim().toLowerCase();
  if (LIVE_FLAG_TRUE.has(normalized)) return true;
  if (LIVE_FLAG_FALSE.has(normalized)) return false;
  const numeric = Number(normalized);
  if (!Number.isNaN(numeric)) {
    if (numeric > 0) return true;
    if (numeric === 0) return false;
  }
  return null;
};

const isLiveFlag = (value) => normalizeLiveFlag(value) === true;

export default function Page() {
  const router = useRouter();
  const [navLoading, setNavLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [matchdata, setMatchdata] = useState([]);
  const [recentBets, setRecentBets] = useState([]);
  const [userWallet, setUserWallet] = useState(0);
  const [username, setUsername] = useState("");

  const formatDate = (ds) => {
    const d = new Date(ds);
    return isNaN(d)
      ? ds
      : d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
  };

  const formatTime = (ds) => {
    const d = new Date(ds);
    return isNaN(d)
      ? ""
      : d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
  };
  const fetchmatchlist = async () => {
    try {
      setDataLoading(true);
      const res = await fetch(
        "/api/sports/matchlist"
      );
      const data = await res.json();
      setMatchdata(data.data?.t1 || []);
    } catch (err) {
      console.error("Failed to fetch matches", err);
      setMatchdata([]);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchRecentBets = async () => {
    try {
      if (!username) return;
      const res = await fetch(`/api/getBets?username=${username}`);
      const data = await res.json();
      if (data.success) {
        setRecentBets(data.bets || []);
      }
    } catch (err) {
      console.error("Failed to fetch recent bets", err);
    }
  };

  useEffect(() => {
    fetchmatchlist();
    const interval = setInterval(fetchmatchlist, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user-api/profile", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUserWallet(data.user?.wallet || 0);
          setUsername(data.user?.username || data.user?.name || "");
        } else {
          console.error("Failed to fetch user data:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch user wallet:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (username) fetchRecentBets();
  }, [username]);

  const handleMatchSelect = (item) => {
    setNavLoading(true);
    router.push(`/sports/${item.gmid}`);
  };

  const getOddValue = (team, type) => {
    const odd = team?.odds?.find((o) => o?.otype === type);
    return odd?.odds ?? "-";
  };

  const buildMarketRow = (item) => {
    const tags = [];
    if (item?.bm) tags.push("BM");
    if (item?.f) tags.push("F");
    if (item?.f1) tags.push("F1");
    if (item?.tv) tags.push("TV");

    const team1 = item?.section?.[0];
    const team2 = item?.section?.[1];

    return {
      date: item?.stime || "-",
      match: item?.ename || "Match",
      tags,
      isLive: isLiveFlag(item?.iplay),
      back: [getOddValue(team1, "back"), "-", "-"],
      lay: [getOddValue(team2, "lay"), "-", "-"],
    };
  };

  return (
    <div>
      {navLoading && <Loader fullscreen message="Navigating..." />}

      <div className="bg-[#e8ecf4] min-h-screen pb-24">
        <div className="bg-gradient-to-r from-[#071E46] to-[#0B3B8A] text-white">
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src="/dice_rush_logo.png"
                  alt="Dice Rush Logo"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold">Sports</h1>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-[#39ff14] text-xl">
                  payments
                </span>
                <span className="text-sm font-bold tracking-tight">
                  {userWallet.toLocaleString()}{" "}
                  <span className="text-blue-100 font-medium">₹</span>
                </span>
              </div>
            </div>

            <div className="flex gap-3">
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-sm">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {matchdata.filter((m) => isLiveFlag(m?.iplay)).length} Live
                </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto p-4 flex flex-col lg:flex-row gap-6">

          <div className="flex-1">
            {dataLoading ? (
              <div className="bg-white rounded-xl shadow px-4 py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Loader message="Loading matches..." />
              </div>
            ) : matchdata.length > 0 ? (
              matchdata.map((item) => {
                const market = buildMarketRow(item);
                return (
                  <div key={item.gmid} className="mb-4">
                    <div
                      className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 shadow-sm cursor-pointer hover:shadow-md hover:border-slate-300"
                      onClick={() => handleMatchSelect(item)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-red-500 font-semibold">
                          {formatDate(market.date)} {formatTime(market.date)}
                        </p>
                        <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                          {market.match}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                          {market.isLive ? (
                            <>
                              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                              <span>Live</span>
                            </>
                          ) : (
                            <>
                              <span className="h-2 w-2 rounded-full bg-slate-300" />
                              <span>Upcoming</span>
                            </>
                          )}
                          {market.tags.map((tag) => (
                            <span
                              key={`${item.gmid}-${tag}`}
                              className="rounded-full bg-[#e8c979] px-2 py-0.5 text-[10px] font-bold text-slate-900"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 md:gap-2">
                        {[0, 1, 2].map((idx) => (
                          <div
                            key={`pair-${item.gmid}-${idx}`}
                            className="flex gap-1.5 md:gap-2"
                          >
                            <div className="w-[48px] md:w-[56px] rounded-md bg-[#a9d8ff] px-1.5 md:px-2 py-1 text-center">
                              <div className="text-[12px] md:text-[13px] font-bold text-slate-900">
                                {market.back[idx]}
                              </div>
                              <div className="text-[8px] md:text-[9px] text-slate-600">
                                -
                              </div>
                            </div>
                            <div className="w-[48px] md:w-[56px] rounded-md bg-[#f7c9c9] px-1.5 md:px-2 py-1 text-center">
                              <div className="text-[12px] md:text-[13px] font-bold text-slate-900">
                                {market.lay[idx]}
                              </div>
                              <div className="text-[8px] md:text-[9px] text-slate-600">
                                -
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl shadow px-4 py-10 text-center">
                <div className="text-4xl mb-2">🏏</div>
                <p className="text-gray-500 font-semibold">
                  No Matches Available
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Please check back later
                </p>
              </div>
            )}
          </div>
          <div className="lg:w-[320px] w-full shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">

              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-[#0B3B8A] flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  Recent Bets
                </h3>

                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                  Last 24h
                </span>
              </div>

              <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
                {recentBets.length > 0 ? (
                  recentBets.map((bet) => (
                    <div key={bet.id} className="bg-gray-50 rounded-lg p-2 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="font-bold text-xs text-gray-900 truncate pr-2">
                          {bet.runnerName}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          bet.betType === 'Back' || bet.betType === 'Yes' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {bet.betType}
                        </span>
                      </div>

                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>{bet.sportName}</span>
                        <span className="font-semibold text-gray-700">
                          {bet.gameType}
                        </span>
                      </div>

                      <div className="mt-1.5 flex justify-between items-center pt-1.5 border-t border-gray-200/60">
                        <div className="flex gap-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-gray-400 font-bold">Odds</span>
                            <span className="text-[11px] font-bold text-gray-900">{bet.odds}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-gray-400 font-bold">Stake</span>
                            <span className="text-[11px] font-bold text-gray-900">₹{bet.stake}</span>
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
                  ))
                ) : (
                  <div className="py-6 text-center text-gray-400 text-[10px]">
                    No recent bets found
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50/50 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">
                    Total Bets:
                  </span>
                  <span className="font-bold text-[#0B3B8A]">
                    {recentBets.length}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <div className="w-full max-w-md pb-2">
        <BottomNav />
      </div>
    </div>
  );
}
