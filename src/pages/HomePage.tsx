import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useHomeStore } from "../store/homeStore";
import GameCard from "../components/GameCard";
import RoomCard from "../components/RoomCard";
import FriendsSidebar from "../components/FriendsSidebar";
import Loading from "../components/Loading";

const statsConfig = [
  { label: "在线玩家", key: "online_players" as const, icon: "👥", accent: "text-emerald-400" },
  { label: "活跃房间", key: "active_rooms" as const, icon: "🏠", accent: "text-blue-400" },
  { label: "游戏中", key: "games_in_play" as const, icon: "🎯", accent: "text-amber-400" },
];

export default function HomePage() {
  const { stats, loading, error, fetchStats } = useHomeStore();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchStats(); } finally { setRefreshing(false); }
  }, [fetchStats]);

  if (loading && !stats) return <Loading />;
  if (error) return (
    <div className="w-full py-16 text-center px-4">
      <div className="text-red-400 mb-3 text-sm">加载失败: {error}</div>
      <button onClick={handleRefresh} className="px-4 py-2 rounded-lg text-white/70 transition-colors" style={{ background: 'rgba(255,255,255,0.08)' }}>重试</button>
    </div>
  );
  if (!stats) return null;

  return (
    <div className="w-full h-full overflow-auto" style={{ padding: 'clamp(16px, 3vw, 40px) clamp(12px, 5vw, 102px)' }}>
      {/* Pull to refresh */}
      {refreshing && (
        <div className="w-full flex items-center justify-center py-2 animate-fade-in-up">
          <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
          <span className="text-white/30 text-xs ml-2">刷新中...</span>
        </div>
      )}

      <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
          {/* Welcome + Refresh */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight">欢迎回来</h1>
              <p className="text-white/35 text-xs sm:text-sm mt-0.5">浏览热门游戏和房间，快速开始对局</p>
            </div>
            <button onClick={handleRefresh} disabled={refreshing}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors text-sm shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)' }} title="刷新">
              ↻
            </button>
          </div>

          {/* Stats row */}
          <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))" }}>
            {statsConfig.map((s) => (
              <div key={s.label} className="rounded-2xl p-4 sm:p-5 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '0.67px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-lg sm:text-xl">{s.icon}</span>
                  <span className="text-white/40 text-[10px] sm:text-xs">{s.label}</span>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  {stats[s.key].toLocaleString()}
                </div>
                <div className={`text-[10px] sm:text-[11px] mt-1 ${s.accent}`}>● 实时数据</div>
              </div>
            ))}
          </div>

          {/* Hot Games */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)' }} />
                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white">热门游戏</h2>
              </div>
              <button onClick={() => navigate("/games")} className="text-[10px] sm:text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1">
                浏览全部 <span className="text-sm">→</span>
              </button>
            </div>
            <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
              {stats.hot_games.slice(0, 4).map((game) => <GameCard key={game.id} game={game} />)}
            </div>
          </div>

          {/* Hot Rooms */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #ef4444)' }} />
                <h2 className="text-sm sm:text-base font-bold text-white">热门房间</h2>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {stats.hot_rooms.slice(0, 5).map((room) => <RoomCard key={room.id} room={room} />)}
            </div>
          </div>

          {/* Friends - mobile only */}
          <div className="lg:hidden">
            <FriendsSidebar />
          </div>

          {/* Hot Rooms - desktop only */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #ef4444)' }} />
                <h2 className="text-lg font-bold text-white">热门房间</h2>
              </div>
              <button onClick={() => navigate("/games")} className="text-xs text-white/40 hover:text-white/70 transition-colors">查看全部 →</button>
            </div>
            <div className="space-y-3">
              {stats.hot_rooms.slice(0, 5).map((room) => <RoomCard key={room.id} room={room} />)}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3 sm:gap-4">
            <button onClick={() => navigate("/games")} className="flex-1 py-3 sm:py-3.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              🎮 浏览游戏
            </button>
            <button onClick={() => navigate("/games")} className="flex-1 py-3 sm:py-3.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              ⚡ 快速开始
            </button>
          </div>
        </div>

        {/* Sidebar - desktop only */}
        <aside className="hidden lg:block w-full lg:w-[280px] shrink-0">
          <FriendsSidebar />
        </aside>
      </div>
    </div>
  );
}
