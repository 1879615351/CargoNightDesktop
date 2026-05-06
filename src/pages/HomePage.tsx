import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHomeStore } from "../store/homeStore";
import GameCard from "../components/GameCard";
import RoomCard from "../components/RoomCard";
import FriendsSidebar from "../components/FriendsSidebar";
import Loading from "../components/Loading";

const statsConfig = [
  { label: "在线玩家", value: (s: number) => s.toLocaleString(), icon: "👥", color: "from-emerald-500/20 to-emerald-600/5", accent: "text-emerald-400" },
  { label: "活跃房间", value: (s: number) => String(s), icon: "🏠", color: "from-blue-500/20 to-blue-600/5", accent: "text-blue-400" },
  { label: "游戏中", value: (s: number) => String(s), icon: "🎯", color: "from-amber-500/20 to-amber-600/5", accent: "text-amber-400" },
];

export default function HomePage() {
  const { stats, loading, error, fetchStats } = useHomeStore();
  const navigate = useNavigate();

  useEffect(() => { fetchStats(); }, []);

  if (loading && !stats) return <Loading />;
  if (error) return (
    <div className="w-full py-16 text-center" style={{ paddingLeft: 'clamp(16px, 7vw, 102px)', paddingRight: 'clamp(16px, 7vw, 102px)' }}>
      <div className="text-red-400 mb-3">加载失败: {error}</div>
      <button onClick={fetchStats} className="px-4 py-2 rounded-lg text-white/70 transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>重试</button>
    </div>
  );
  if (!stats) return null;

  return (
    <div className="w-full" style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 7vw, 102px)' }}>
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* Welcome section */}
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">欢迎回来</h1>
            <p className="text-white/35 text-sm mt-1">浏览热门游戏和房间，快速开始对局</p>
          </div>

          {/* Stats row - Figma style cards */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))" }}>
            {statsConfig.map((s) => (
              <div key={s.label} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '0.67px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-white/40 text-xs">{s.label}</span>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-white tracking-tight">{s.value(stats[s.label === "在线玩家" ? "online_players" : s.label === "活跃房间" ? "active_rooms" : "games_in_play"])}</div>
                <div className={`text-[11px] mt-1.5 ${s.accent}`}>● 实时数据</div>
              </div>
            ))}
          </div>

          {/* Hot Games */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)' }} />
                <h2 className="text-base lg:text-lg font-bold text-white">热门游戏</h2>
              </div>
              <button onClick={() => navigate("/games")} className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                浏览全部 <span className="text-sm">→</span>
              </button>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}>
              {stats.hot_games.slice(0, 4).map((game) => <GameCard key={game.id} game={game} />)}
            </div>
          </div>

          {/* Hot Rooms */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #ef4444)' }} />
                <h2 className="text-base lg:text-lg font-bold text-white">热门房间</h2>
              </div>
              <button onClick={() => navigate("/games")} className="text-xs text-white/40 hover:text-white/70 transition-colors">查看全部 →</button>
            </div>
            <div className="space-y-3">
              {stats.hot_rooms.slice(0, 5).map((room) => <RoomCard key={room.id} room={room} />)}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate("/games")} className="flex-1 py-3.5 rounded-xl text-white text-sm font-semibold transition-all" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              🎮 浏览游戏
            </button>
            <button onClick={() => navigate("/games")} className="flex-1 py-3.5 rounded-xl text-white text-sm font-semibold transition-all" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              ⚡ 快速开始
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <FriendsSidebar />
        </aside>
      </div>
    </div>
  );
}
