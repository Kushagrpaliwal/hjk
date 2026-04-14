"use client";

import { useState, useEffect } from "react";
import BottomNav from "../../components/BottomNav";
import { Trophy } from "lucide-react";

// re‑use generation logic from game page so we have consistent dummy data
const generateBotPlayers = () => {
  const botNames = [
    "Shadow_Pro",
    "CyberKing",
    "AlphaBot",
    "NovaPlayer",
    "PhantomGamer",
    "EliteBot",
    "VortexPro",
    "NeonMaster",
    "QuantumBot",
    "LunarEchoed",
  ];
  const avatarColors = [
    "#39ff14",
    "#ff00ff",
    "#00ffff",
    "#ffff00",
    "#ff6600",
    "#00ff99",
    "#ff0066",
    "#0099ff",
    "#ff3300",
    "#33ff00",
  ];

  // pick distinct avatars from /public/avtar/av-1.png .. av-72.png
  const selectedAvatars = new Set();
  while (selectedAvatars.size < botNames.length) {
    selectedAvatars.add(Math.floor(Math.random() * 72) + 1);
  }
  const avatarIndices = Array.from(selectedAvatars);

  return botNames.map((name, idx) => ({
    id: idx + 1,
    name,
    avatar: `/avtar/av-${avatarIndices[idx]}.png`,
    winRate: Math.random() * 60 + 20,
    totalGames: Math.floor(Math.random() * 500) + 100,
    totalWinnings: Math.floor(Math.random() * 75000) + 1000,
    currentBet: Math.floor(Math.random() * 1000) + 50,
    diceRoll: null,
    isRunning: false,
    color: avatarColors[idx % avatarColors.length],
    rank: idx + 1,
  }));
};

// sort by winnings and assign ranks
const assignRanks = (players) => {
  const sorted = [...players].sort((a, b) => b.totalWinnings - a.totalWinnings);
  const ranked = sorted.map((p, i) => ({ ...p, rank: i + 1 }));
  return players.map((p) => ({
    ...p,
    rank: ranked.find((r) => r.id === p.id).rank,
  }));
};

// svg fallback avatar generator (same as game page)
const makeFallback = (name = "", color = "#222") => {
  const initials = (name || "B")
    .split(/[_\s-]+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='50%' dy='.1em' font-family='Inter, Arial, sans-serif' font-size='48' fill='#000' text-anchor='middle'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const bots = generateBotPlayers();
    setPlayers(assignRanks(bots));
  }, []);

  const handleAvatarError = (e, name, color) => {
    e.currentTarget.src = makeFallback(name, color);
  };

  // split into top3 and the rest for separate rendering
  const topThree = players.slice(0, 3);
  const others = players.slice(3);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] flex flex-col items-center justify-between p-3 font-sans overflow-hidden">
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="w-full max-w-md rounded-3xl p-4 relative">

          {/* HEADER */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 
            bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 
            px-8 py-2 rounded-full 
            shadow-[0_0_20px_rgba(59,130,246,0.6)] 
            border border-white/20"
          >
            <h1 className="text-white font-bold tracking-widest text-sm">
              LEADERBOARD
            </h1>
          </div>

          {/* TOP 3 PLAYERS */}
          {topThree.length > 0 && (
            <div className="mt-8 flex justify-around items-end gap-4">
              {topThree.map((p) => (
                <TopPlayer key={p.id} player={p} onError={handleAvatarError} />
              ))}
            </div>
          )}

          {/* REMAINING LIST */}
          {others.length > 0 && (
            <div className="mt-6 space-y-3 overflow-y-auto max-h-[50vh] hide-scrollbar">
              {others.map((p) => (
                <PlayerRow key={p.id} player={p} onError={handleAvatarError} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="w-full max-w-md pb-2">
        <BottomNav />
      </div>
    </div>
  );
}

function PlayerRow({ player, onError }) {
  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-md">
      <div className="text-xl font-bold text-cyan-400 w-6 text-center">
        {player.rank}
      </div>
      <img
        src={player.avatar}
        alt={player.name}
        className="w-10 h-10 rounded-full object-cover"
        onError={(e) => onError(e, player.name, player.color)}
      />
      <div className="flex-1">
        <p className="font-semibold text-white">{player.name}</p>
        <p className="text-xs text-slate-400">
          Winnings: {player.totalWinnings.toLocaleString()} CHIPS
        </p>
      </div>
      <Trophy size={18} className="text-yellow-400" />
    </div>
  );
}

// larger presentation for a top‑3 spot; crowns on #1
function TopPlayer({ player, onError }) {
  const isFirst = player.rank === 1;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <img
          src={player.avatar}
          alt={player.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400"
          onError={(e) => onError(e, player.name, player.color)}
        />
        {isFirst && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400 text-xl">
            👑
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-300">#{player.rank}</p>
      <p className="text-sm font-semibold text-white">
        {player.name}
      </p>
      <p className="text-xs text-slate-400">
        {player.totalWinnings.toLocaleString()} CHIPS
      </p>
    </div>
  );
}

