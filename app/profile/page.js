"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";
import {
  User,
  Trophy,
  Flame,
  Layers,
  Target,
  Percent,
  MapPin,
  Calendar,
  Wallet,
  ReceiptText,
  PlusCircle,
  History,
  LogOut,
  ChevronRight,
  Dices,
  Award,
  Phone,
  Activity,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user-api/profile");
        const data = await res.json();
        if (res.ok) {
          setUserData(data.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/user-api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        router.replace("/login"); // better than push
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] flex flex-col items-center p-3 font-sans pb-24 overflow-y-auto">
      <div className="w-full max-w-md relative mt-8">
        {/* COMPACT FLOATING HEADER */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-1.5 rounded-full shadow-lg border border-white/20 z-20">
          <h1 className="text-white font-black tracking-widest text-[10px]">
            PROFILE
          </h1>
        </div>

        {/* COMPACT USER CARD */}
        <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-4 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-md rotate-2">
                <User size={32} />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-md border-2 border-[#0f172a]">
                L{userData?.level || 3}
              </div>
            </div>

            <div className="flex-1">
              <h2 className="font-black text-xl text-white leading-tight">
                {userData?.name || "UserId7661"}
              </h2>
              <p className="text-[11px] text-blue-400 font-medium">
                @{userData?.username || "ukraine_pro"}
              </p>
              <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-tighter">
                <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md">
                  <Phone size={8} className="text-cyan-400" />{" "}
                  {userData?.phone || "Ukraine"}
                </span>
                <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md">
                  <Activity size={8} className="text-cyan-400" />{" "}
                  {userData?.status || "active"}
                </span>
              </div>
            </div>
          </div>

          {/* COMPACT WALLET */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[9px] text-emerald-500/70 font-black uppercase tracking-tight">
                  Balance
                </p>
                <h3 className="text-xl font-black text-white leading-none">
                  ${userData?.wallet || "0.00"}
                </h3>
              </div>
            </div>
            <button
              onClick={() => router.push("/deposit")}
              className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-xl transition-all active:scale-90"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        {/* GAME STATS SECTION */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="font-black text-white uppercase tracking-tighter text-[11px] flex items-center gap-1.5 opacity-80">
              <Trophy size={14} className="text-yellow-400" /> Gameplay Activity
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Win Streak"
              value={userData?.stats?.winStreak || "2"}
              type="fire"
              icon={<Flame size={16} />}
            />
            <StatCard
              title="Total Wins"
              value={userData?.stats?.totalWins || "12"}
              type="win"
              icon={<Award size={16} />}
            />

            {/* DICE MODES - COMPACT */}
            <div className="col-span-2 grid grid-cols-2 bg-white/5 border border-white/10 rounded-2xl py-3 backdrop-blur-sm">
              <div className="text-center border-r border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase">
                  One Dice
                </p>
                <h4 className="text-lg font-black text-white">
                  48{" "}
                  <span className="text-[9px] text-slate-500 font-normal">
                    Rolls
                  </span>
                </h4>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-slate-500 uppercase">
                  Two Dice
                </p>
                <h4 className="text-lg font-black text-white">
                  36{" "}
                  <span className="text-[9px] text-slate-500 font-normal">
                    Rolls
                  </span>
                </h4>
              </div>
            </div>

            <StatCard
              title="Win Rate"
              value={`${userData?.stats?.winRate || "100"}%`}
              type="target"
              icon={<Percent size={16} />}
            />
            <StatCard
              title="Avg Multiplier"
              value="1.9x"
              type="stack"
              icon={<Layers size={16} />}
            />
          </div>
        </div>

        {/* ACCOUNT LINKS - COMPACT LIST */}
        <div className="mt-6 space-y-2 mb-6">
          <p className="text-white/30 text-[9px] font-black uppercase ml-2 tracking-[0.2em]">
            Finances
          </p>
          <MenuLink
            icon={<ReceiptText size={18} />}
            title="My Ledger"
            onClick={() => router.push("/ledger")}
          />
          <MenuLink
            icon={<PlusCircle size={18} />}
            title="Deposit"
            onClick={() => router.push("/deposit")}
          />
          <MenuLink
            icon={<History size={18} />}
            title="Withdrawal"
            onClick={() => router.push("/withdrawal")}
          />
          <MenuLink
            icon={<LogOut size={18} />}
            title="Logout Account"
            onClick={handleLogout}
            color="text-red-400"
          />
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md pb-4 px-4">
        <BottomNav />
      </div>
    </div>
  );
}

function MenuLink({ icon, title, onClick, color = "text-white" }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className={`${color} opacity-70`}>{icon}</span>
        <span className={`font-bold text-xs tracking-tight ${color}`}>
          {title}
        </span>
      </div>
      <ChevronRight
        size={14}
        className="text-white/10 group-hover:text-white/40"
      />
    </button>
  );
}

function StatCard({ title, value, icon, type }) {
  const themes = {
    fire: {
      bg: "https://images.unsplash.com/photo-1554177255-61502b352de3",
      color: "text-orange-400",
    },
    stack: {
      bg: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317",
      color: "text-cyan-400",
    },
    target: {
      bg: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d",
      color: "text-red-400",
    },
    win: {
      bg: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
      color: "text-yellow-400",
    },
  };

  return (
    <div className="relative rounded-2xl overflow-hidden h-24 group">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${themes[type].bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-[#0f172a]/85"></div>
      <div className="relative z-10 p-3 h-full flex flex-col items-center justify-center text-center border border-white/5 rounded-2xl">
        <div className={`${themes[type].color} mb-1`}>{icon}</div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        <h2 className="text-xl font-black text-white">{value}</h2>
      </div>
    </div>
  );
}
