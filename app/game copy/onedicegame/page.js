"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { User, Zap, RotateCcw, History, Plus, Minus } from "lucide-react";

export default function DiceRushResponsive() {
  const [betAmount, setBetAmount] = useState(100);
  const [betOn, setBetOn] = useState(1);
  const [balance, setBalance] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState(1);
  const [rollingFace, setRollingFace] = useState(1);
  const [roundHistory, setRoundHistory] = useState([]);
  const [canBet, setCanBet] = useState(false);
  const [placingBet, setPlacingBet] = useState(false);
  const [myCurrentBets, setMyCurrentBets] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const requestInFlightRef = useRef(false);
  const countdownSyncRef = useRef({ baseTimeLeft: 0, syncedAt: Date.now() });

  const historyDelayRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2600);
  }, []);

  const fetchGameState = useCallback(async () => {
    if (requestInFlightRef.current) return;

    requestInFlightRef.current = true;

    try {
      const response = await fetch("/api/game-api/dice/state", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch game state");
      }

      const nextTimeLeft = Math.max(0, Number(data.timeLeft || 0));

      countdownSyncRef.current = {
        baseTimeLeft: nextTimeLeft,
        syncedAt: Date.now(),
      };

      setCurrentPeriod(data.period || "");
      setTimeLeft(nextTimeLeft);
      setIsRolling(Boolean(data.isRolling));
      setLastResult(Number(data.lastResult || 1));

      // 🧠 CLEAR OLD TIMER (important)
      if (historyDelayRef.current) {
        clearTimeout(historyDelayRef.current);
      }

      // ✅ APPLY DELAY ONLY DURING RESULT PHASE
      if (!data.canBet) {
        const delay = nextTimeLeft * 1000; // dynamic delay

        historyDelayRef.current = setTimeout(() => {
          setRoundHistory(
            Array.isArray(data.roundHistory) ? data.roundHistory : [],
          );
        }, delay);
      }

      setBalance(Number(data.wallet || 0));
      setCanBet(Boolean(data.canBet));
      setMyCurrentBets(Array.isArray(data.currentBets) ? data.currentBets : []);

      setError("");
    } catch (err) {
      setError(err.message || "Unable to sync with server");
    } finally {
      requestInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchGameState();
    const timer = setInterval(fetchGameState, 1000);
    return () => clearInterval(timer);
  }, [fetchGameState]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (historyDelayRef.current) {
        clearTimeout(historyDelayRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRolling) {
      setRollingFace(lastResult || 1);
      return undefined;
    }
    const timer = setInterval(() => {
      setRollingFace(Math.floor(Math.random() * 6) + 1);
    }, 70);
    return () => clearInterval(timer);
  }, [isRolling, lastResult]);

  useEffect(() => {
    const timer = setInterval(() => {
      const { baseTimeLeft, syncedAt } = countdownSyncRef.current;
      const elapsedSeconds = Math.floor((Date.now() - syncedAt) / 1000);
      const nextTimeLeft = Math.max(0, baseTimeLeft - elapsedSeconds);

      setTimeLeft((prev) => (prev === nextTimeLeft ? prev : nextTimeLeft));
    }, 250);

    return () => clearInterval(timer);
  }, []);

  const displayFace = isRolling ? rollingFace : lastResult;
  const shouldSlowRoll = timeLeft <= 10 && timeLeft > 0;
  const shouldShowRevealMessage = timeLeft <= 5 && timeLeft > 0;
  const shouldFastRoll = isRolling && !shouldSlowRoll && !shouldShowRevealMessage;

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value);
    setBetAmount(isNaN(val) ? 0 : val);
  };

  const handlePlaceBet = async () => {
    if (placingBet) {
      return;
    }
    if (!canBet) {
      showToast("Bet window is closed for this period", "error");
      return;
    }
    if (betAmount <= 0) {
      showToast("Please enter a valid bet amount", "error");
      return;
    }

    setPlacingBet(true);
    setError("");
    try {
      const response = await fetch("/api/game-api/dice/bet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betAmount, betOn }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bet placement failed");
      }

      setBalance(Number(data.wallet || balance));
      showToast("Bet placed successfully", "success");
      await fetchGameState();
    } catch (err) {
      const message = err.message || "Unable to place bet";
      setError(message);
      showToast(message, "error");
    } finally {
      setPlacingBet(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans p-3 md:p-6 overflow-x-hidden">
      {toast ? (
        <div className="fixed top-4 right-4 z-50 animate-[slideIn_.2s_ease-out]">
          <div
            className={`px-4 py-3 rounded-xl border text-sm md:text-base font-bold shadow-[0_10px_30px_rgba(0,0,0,0.45)] ${
              toast.type === "success"
                ? "bg-[#c0ff00] text-black border-[#98cc00]"
                : toast.type === "error"
                  ? "bg-[#2b0d16] text-pink-300 border-pink-600/60"
                  : "bg-[#1e1e1e] text-white border-white/10"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-4 md:mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-[#c0ff00] p-1.5 rounded-lg shadow-[0_0_15px_rgba(192,255,0,0.3)]">
            <div className="grid grid-cols-2 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-black rounded-full" />
              ))}
            </div>
          </div>
          <h1 className="text-lg md:text-xl font-black italic tracking-tighter">
            DICE RUSH
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-[#141414] px-3 py-1.5 rounded-full border border-white/5">
          <span className="text-[#c0ff00] font-black text-sm md:text-base">
            {balance.toLocaleString()}
          </span>
          <div className="w-7 h-7 bg-[#2a2a2a] rounded-full flex items-center justify-center border border-white/10">
            <User size={14} className="text-gray-400" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* --- MAIN GAME CONTAINER --- */}
        <div className="col-span-1 lg:col-span-9 p-4 md:p-8 relative flex flex-col min-h-[550px] md:min-h-[600px]">
          {/* MOBILE TOP INFO BAR */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                Period
              </p>

              <div className="flex items-center gap-1.5">
                <History size={12} className="text-[#c0ff00]" />

                <span className="text-sm md:text-2xl font-black font-mono text-white leading-none">
                  {currentPeriod}
                </span>
              </div>
            </div>

            <div className="flex gap-1.5">
              {roundHistory.slice(0, 4).map((res, i) => (
                <div
                  key={i}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black border border-white/10 ${res > 3 ? "bg-[#c0ff00] text-black shadow-[0_0_10px_rgba(192,255,0,0.2)]" : "bg-purple-600 text-white"}`}
                >
                  {res}
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: THE DICE (UPDATED ANIMATION WRAPPER) */}
          <div className="dice-stage flex-1 flex items-center justify-center py-8">
            <div
              className={`relative transition-all duration-500 ease-out ${
                shouldFastRoll
                  ? "dice-rolling scale-110"
                  : shouldSlowRoll
                    ? "dice-rolling-slow scale-105"
                    : "rotate-0 scale-100 drop-shadow-[0_0_30px_rgba(192,255,0,0.2)]"
              }`}
            >
              <div className="absolute -inset-16 md:-inset-20 bg-purple-500/10 blur-[100px] rounded-full"></div>
              <div className="w-36 h-36 md:w-44 md:h-44 border-4 border-purple-500/30 rounded-[32px] md:rounded-[38px] flex items-center justify-center bg-black/40 backdrop-blur-xl shadow-[0_0_80px_rgba(168,85,247,0.1)] relative">
                <img
                  src={`/${displayFace}.png`}
                  alt={`Dice ${displayFace}`}
                  className={`w-30 h-30 md:w-40 md:h-40 object-contain drop-shadow-[0_0_20px_rgba(192,255,0,0.35)] rounded-[30px] md:rounded-[36px] transition-all duration-500 ${
                    shouldShowRevealMessage ? "blur-[3px] opacity-80" : "blur-0"
                  }`}
                  onError={(e) => {
                    e.currentTarget.src = "/one-dice-image.png";
                  }}
                />
                {shouldShowRevealMessage ? (
                  <div className="absolute inset-0 flex items-center justify-center text-center px-3">
                    <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/90 bg-black/60 border border-white/10 rounded-lg px-3 py-2">
                      Dice will be open after 5sec
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* BOTTOM RIGHT: COUNTDOWN TIMER */}
          <div className="absolute bottom-60 right-4 md:bottom-45 md:right-8">
            <div className="relative w-[60px] h-[60px] md:w-[100px] md:h-[100px]">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#c0ff00]/20 to-purple-600/20 blur-2xl"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_-10px_-10px_20px_rgba(0,0,0,0.3),inset_10px_10px_20px_rgba(255,255,255,0.2)]">
                <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/30 via-transparent to-black/20 shadow-[inset_0_2px_8px_rgba(255,255,255,0.4)]"></div>
                <div className="absolute inset-2 md:inset-4 rounded-full bg-gradient-to-br from-black/60 via-black/80 to-black/95 flex items-center justify-center border border-white/5 shadow-[inset_0_10px_30px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
                  <span
                    className={`relative text-2xl md:text-4xl font-black font-mono transition-all ${
                      timeLeft < 5
                        ? "text-pink-500 animate-pulse drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]"
                        : "text-[#c0ff00] drop-shadow-[0_0_15px_rgba(192,255,0,0.6)]"
                    }`}
                  >
                    {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION: INPUT & BETTING */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/2 space-y-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase ml-1">
                  Bet Amount
                </p>
                <div className="flex items-center bg-black rounded-xl border border-white/10 p-1 group focus-within:border-[#c0ff00]/50 transition-colors">
                  <button
                    onClick={() => setBetAmount(Math.max(0, betAmount - 10))}
                    className="p-3 text-gray-500 hover:text-white"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={handleInputChange}
                    className="bg-transparent w-full text-center text-xl font-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setBetAmount(betAmount + 10)}
                    className="p-3 text-gray-500 hover:text-white"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="w-full md:w-1/2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                <div className="flex md:grid md:grid-cols-4 gap-2 min-w-max md:min-w-0">
                  {[10, 50, 100, 500].map((val) => (
                    <button
                      key={val}
                      disabled={placingBet}
                      onClick={() => setBetAmount(val)}
                      className={`px-8 md:px-4 py-4 md:py-3 rounded-xl font-black text-sm md:text-base transition-all transform active:translate-y-1 ${betAmount === val ? "bg-[#c0ff00] text-black translate-y-[-4px] shadow-[0_4px_0_#8dbb00]" : "bg-[#1e1e1e] text-gray-400 shadow-[0_4px_0_#000]"}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((face) => (
                <button
                  key={face}
                  onClick={() => setBetOn(face)}
                  disabled={placingBet}
                  className={`py-3 rounded-xl font-black text-sm transition-all ${
                    betOn === face
                      ? "bg-[#c0ff00] text-black shadow-[0_4px_0_#8dbb00]"
                      : "bg-[#1e1e1e] text-gray-300 shadow-[0_4px_0_#000]"
                  }`}
                >
                  {face}
                </button>
              ))}
            </div>

            <button
              onClick={handlePlaceBet}
              disabled={!canBet || placingBet}
              className={`w-full py-4 md:py-5 rounded-2xl font-black italic text-lg md:text-xl flex items-center justify-center gap-3 transition-all bg-white text-black shadow-[0_6px_0_#ccc] active:translate-y-1 ${!canBet || placingBet ? "opacity-40 grayscale pointer-events-none" : ""}`}
            >
              <Zap size={20} fill="black" />
              {placingBet ? "PLACING..." : `PLACE BET ON ${betOn}`}
            </button>
            <p className="text-xs text-gray-400">
              Bets this period: {myCurrentBets.length}
            </p>
            {/* {error ? (
              <p className="text-xs text-pink-500 font-bold">{error}</p>
            ) : null} */}
          </div>
        </div>

        {/* --- SIDEBAR: RECENT HISTORY --- */}
        <aside className="col-span-1 lg:col-span-3 space-y-3 pb-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black tracking-widest text-gray-500 flex items-center gap-2 uppercase">
              <RotateCcw size={12} /> Live History
            </h2>
          </div>
          <div className="grid grid-cols-1 md:block gap-2">
            {roundHistory.map((num, i) => (
              <div
                key={i}
                className="bg-[#141414] p-3 rounded-xl border border-white/5 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${num > 3 ? "bg-[#c0ff00] text-black" : "bg-[#222] text-gray-500"}`}
                  >
                    {num}
                  </div>
                  <span className="text-[10px] font-mono text-gray-600">
                    #H{i + 1}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#c0ff00]">
                    RESULT {num}
                  </p>
                  <p className="text-[8px] text-gray-700 font-bold">
                    6.0X ON EXACT
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* 🔵 CIRCULAR SMOOTH SPIN */
        .dice-rolling {
          animation: dice-spin 0.4s linear infinite;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .dice-rolling-slow {
          animation: dice-spin 2.8s linear infinite;
          transform-style: preserve-3d;
          will-change: transform;
        }

        .dice-stage {
          perspective: 900px;
        }

        @keyframes dice-spin {
          0% {
            transform: rotateZ(0deg) rotateX(10deg);
          }
          100% {
            transform: rotateZ(360deg) rotateX(10deg);
          }
        }

        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
