"use client";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import { useState, useEffect } from "react";

const CRICKET_MARKETS = [
  {
    id: "m1",
    date: "16/03/2026 18:00",
    match: "Cricgiri Champs v White Dot Shastri Nagar",
    tags: ["P"],
    back: [1.31, "-", "-"],
    lay: [3.15, "-", "-"],
  },
  {
    id: "m2",
    date: "16/03/2026 19:30",
    match: "India Captains v Southern Super Stars",
    tags: ["BM"],
    back: [15.0, "-", "-"],
    lay: [1.06, 1.07, "-"],
  },
  {
    id: "m3",
    date: "16/03/2026 20:00",
    match: "Sri Lanka SRL v South Africa SRL",
    tags: ["BM"],
    back: ["-", "-", "-"],
    lay: ["-", "-", "-"],
  },
  {
    id: "m4",
    date: "16/03/2026 20:40",
    match: "India T10 v Pakistan T10",
    tags: ["BM"],
    back: ["-", "-", "-"],
    lay: ["-", "-", "-"],
  },
  {
    id: "m5",
    date: "16/03/2026 21:45",
    match: "Sialkot Region v Multan Region",
    tags: ["F", "BM"],
    back: [1.71, "-", "-"],
    lay: [2.32, 2.42, "-"],
  },
];

export default function GamePage() {
  const [selectedGame, setSelectedGame] = useState("one"); // 'one' or 'two'
  const [userWallet, setUserWallet] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  // Fetch current user's wallet and email
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user-api/profile", {
          credentials: "include", // Include cookies
        });

        if (res.ok) {
          const data = await res.json();
          setUserWallet(data.user?.wallet || 0);
          setUserEmail(data.user?.email || "");
        } else {
          console.error("Failed to fetch user data:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch user wallet:", err);
      }
    };

    fetchUserData();
  }, []);

  const HERO_SLIDES = [
    {
      id: "s1",
      image: "ipl.jpeg",
    },
    {
      id: "s2",
      image: "roulette.jpeg",
    },
    {
      id: "s3",
      image: "virat.jpeg",
    },
    {
      id: "s4",
      image: "wickets.jpeg",
    },
    {
      id: "s5",
      image: "ipl.jpeg",
    },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f4f1ea] font-['Space_Grotesk'] text-white antialiased overflow-x-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[-2]"
        style={{ backgroundImage: "url('/main-bg-img.jpg')" }}
      ></div>
      <div className="fixed inset-0 bg-[#f4f1ea]/85 z-[-1]"></div>
      <header className="relative flex items-center justify-between border-b border-black/10 px-6 py-4 md:px-20 lg:px-40 sticky top-0 bg-[#0b0b0b] z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#39ff14] text-3xl drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
              casino
            </span>
            <h2 className="text-2xl font-black leading-tight tracking-tighter text-white">
              DICE{" "}
              <span className="text-[#39ff14] italic drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">
                RUSH
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-[#39ff14] text-xl">
              payments
            </span>
            <span className="text-sm font-bold tracking-tight">
              {userWallet.toLocaleString()}{" "}
              <span className="text-slate-400 font-medium">₹</span>
            </span>
          </div>
        </div>
      </header>

      {/* --- MARQUEE NOTE SECTION --- */}
      <div className="relative flex w-full items-center overflow-hidden bg-zinc-900 border-y border-white/5 py-2 backdrop-blur-sm">

        <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-zinc-900 via-transparent to-zinc-900 opacity-60"></div>

        <div
          className="flex animate-marquee-scroll whitespace-nowrap text-[11px] font-semibold tracking-wide text-zinc-400"
          style={{ animation: "marquee-scroll 22s linear infinite" }}
        >
          <div className="flex shrink-0 items-center">
            <span className="mx-10 flex items-center gap-3">
              <span className="h-[1px] w-4 bg-zinc-700" />
              Welcome to{" "}
              <span className="text-zinc-100 uppercase tracking-tighter">
                Dice Rush
              </span>
              . Secure wallet, instant joins, and verified tables.
            </span>
            <span className="mx-10 flex items-center gap-3">
              <span className="h-[1px] w-4 bg-zinc-700" />
              Live <span className="text-zinc-100">Cricket Markets</span> are
              open now.{" "}
              <span className="italic text-zinc-500 underline decoration-zinc-700">
                Bet responsibly.
              </span>
            </span>
            <span className="mx-10 flex items-center gap-3">
              <span className="h-[1px] w-4 bg-zinc-700" />
              VIP Weekend Bonus:{" "}
              <span className="text-zinc-100">Extra Cashback</span> on Two Dice
              games.
            </span>
            {/* Loop duplicate */}
            <span className="mx-10 flex items-center gap-3">
              <span className="h-[1px] w-4 bg-zinc-700" />
              Welcome to Dice Rush. Secure wallet, instant joins, and verified
              tables.
            </span>
          </div>
        </div>
      </div>

      <main className="relative z-10 flex-1 max-w-[1400px] mx-auto w-full px-6 py-12">
        <style>{`
          @keyframes banner-slide {
            0% { transform: translateX(0); }
            20% { transform: translateX(0); }
            25% { transform: translateX(-20%); }
            40% { transform: translateX(-20%); }
            45% { transform: translateX(-40%); }
            60% { transform: translateX(-40%); }
            65% { transform: translateX(-60%); }
            80% { transform: translateX(-60%); }
            85% { transform: translateX(-80%); }
            100% { transform: translateX(-80%); }
          }
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
        `}</style>

        {/* <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
            <div
              className="flex w-[500%]"
              style={{ animation: "banner-slide 24s ease-in-out infinite" }}
            >
              {HERO_SLIDES.map((slide) => (
                <div
                  key={slide.id}
                  className="relative w-1/5 h-[140px] md:h-[220px] lg:h-[260px] flex-shrink-0"
                >
                  <img
                    src={slide.image}
                    alt="Casino banner"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* <div className="text-center mb-16 space-y-2">
          <h1 className="text-2xl md:text-5xl font-bold">
            Welcome,{" "}
            <span className="text-[#39ff14] drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">
              {userEmail || "Guest"}
            </span>
          </h1>
          <p className="text-slate-500 uppercase tracking-[0.4em] text-xs font-bold">
            Choose your game • Place your bets • Win big
          </p>
        </div> */}

        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                🏏 Live Markets
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Prices update every 3s
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {CRICKET_MARKETS.map((market) => (
              <div
                key={market.id}
                className="flex flex-col md:flex-row md:items-center gap-4 rounded-xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-red-500 font-semibold">
                    {market.date}
                  </p>
                  <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                    {market.match}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span>In-Play</span>
                    {market.tags.map((tag) => (
                      <span
                        key={tag}
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
                      key={`pair-${market.id}-${idx}`}
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
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              ❤️ Live Casino
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Prices update every 2s
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-8">
            {/* Game Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card: One Dice */}
              <div
                onClick={() => setSelectedGame("one")}
                className={`group relative flex flex-col bg-black border rounded-[2rem] overflow-hidden hover:border-[#39ff14]/30 transition-all duration-500 cursor-pointer ${selectedGame === "one" ? "border-[#39ff14]" : "border-white/5"}`}
              >
                <div className="relative h-80 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center brightness-50 group-hover:scale-110 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1000')]"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <div className="relative size-32 flex items-center justify-center">
                      {/* Outer Glow Ring */}
                      <div className="absolute inset-0 rounded-full bg-[#39ff14]/20 blur-2xl animate-pulse"></div>
                      <img
                        src="one-dice-image.png"
                        alt="Neon Dice 1"
                        className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(57,255,20,0.6)] group-hover:rotate-12 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase italic">
                      One Dice Game
                    </h3>
                  </div>
                </div>
                <div className="p-8 pt-0 flex flex-col gap-6 -mt-8 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                        Payout
                      </p>
                      <p className="text-[#39ff14] text-xl font-black">2x</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                        Win Chance
                      </p>
                      <p className="text-[#39ff14] text-xl font-black">16.7%</p>
                    </div>
                  </div>
                  <Link href="/game/onedicegame">
                    <button className="w-full bg-[#39ff14] text-black py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] active:scale-95 uppercase tracking-widest">
                      Join Game
                    </button>
                  </Link>
                </div>
              </div>

              {/* Card: Two Dice */}
              <div
                onClick={() => setSelectedGame("two")}
                className={`group relative flex flex-col bg-black border rounded-[2rem] overflow-hidden hover:border-[#ff00ff]/30 transition-all duration-500 cursor-pointer ${selectedGame === "two" ? "border-[#ff00ff]" : "border-white/5"}`}
              >
                <div className="relative h-80 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center brightness-[0.3] group-hover:scale-110 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1000')]"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <div className="relative h-40 w-full flex items-center justify-center">
                      {/* Atmospheric Glow */}
                      <div className="absolute w-48 h-24 bg-[#ff00ff]/10 blur-3xl rounded-full"></div>
                      <img
                        src="two-dice-image.png"
                        alt="Neon Pair of Dice"
                        className="relative z-10 h-full w-auto object-contain drop-shadow-[0_0_20px_rgba(255,0,255,0.6)] group-hover:rotate-12 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase italic">
                      Two Dice Game
                    </h3>
                  </div>
                </div>
                <div className="p-8 pt-0 flex flex-col gap-6 -mt-8 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                        Payout
                      </p>
                      <p className="text-[#ff00ff] text-xl font-black">6x</p>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">
                        Win Chance
                      </p>
                      <p className="text-[#ff00ff] text-xl font-black">22.2%</p>
                    </div>
                  </div>
                  <Link href="/game/twodicegame">
                    <button className="w-full bg-[#ff00ff] text-white py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,0,255,0.4)] active:scale-95 uppercase tracking-widest">
                      Join Game
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* --- Terms & Conditions Section --- */}
        <div className="w-full px-6 py-4 border-t border-slate-200/70">
          <div className="mx-auto max-w-7xl">
            <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest text-slate-500">
              Terms & Conditions Highlights
            </h4>
            <div className="grid grid-cols-1 gap-4 text-[12px] leading-relaxed text-slate-600 md:grid-cols-3 md:gap-8">
              {/* T&C Point 1 */}
              <div className="flex flex-col gap-1 border-l border-slate-200 pl-3">
                <span className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4">01. Eligibility</span>
                <p>Users must be 18+ to participate. Account verification is mandatory for withdrawals. We reserve the right to restrict access based on jurisdiction.</p>
              </div>

              {/* T&C Point 2 */}
              <div className="flex flex-col gap-1 border-l border-slate-200 pl-3">
                <span className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4">02. Wallet & Stakes</span>
                <p>Instant joins require a minimum wallet balance. All stakes are final once a round begins. Please review table limits before joining.</p>
              </div>

              {/* T&C Point 3 */}
              <div className="flex flex-col gap-1 border-l border-slate-200 pl-3">
                <span className="font-bold text-slate-800 underline decoration-slate-300 underline-offset-4">03. Responsible Gaming</span>
                <p>Set your own limits. Our system monitors betting patterns to ensure a safe environment. Visit our "Help" section for self-exclusion tools.</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter">
                &copy; 2026 Dice Rush Gaming Network. All Rights Reserved.
              </p>
              <button className="text-[10px] font-bold text-slate-700 transition-colors hover:text-slate-900 underline decoration-slate-300 underline-offset-4">
                Read Full Document
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM NAV */}
      <div className="w-full max-w-md pb-2">
        <BottomNav />
      </div>
    </div>
  );
}
