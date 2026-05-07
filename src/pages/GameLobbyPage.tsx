import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLobbyStore } from "../store/lobbyStore";
import { useGameStore } from "../store/homeStore";
import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import Loading from "../components/Loading";
import type { Game } from "../types";

export default function GameLobbyPage() {
  const { gameType } = useParams<{ gameType: string }>();
  const navigate = useNavigate();
  const { rooms, loading, error, fetchRooms, createRoom } = useLobbyStore();
  const { games, fetchGames } = useGameStore();
  const [showCreate, setShowCreate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const currentGame: Game | undefined = games.find((g) => g.id === gameType);

  useEffect(() => { fetchGames(); }, []);
  useEffect(() => { if (gameType) fetchRooms(gameType); }, [gameType]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchRooms(gameType!);
    } finally {
      setRefreshing(false);
    }
  }, [gameType, fetchRooms]);

  const filtered = rooms.filter(r =>
    !searchText || r.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading && rooms.length === 0) return <Loading />;

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-auto" style={{ padding: 'clamp(12px, 3vw, 32px) clamp(12px, 5vw, 86px)' }}>
      {/* Pull to refresh indicator */}
      {refreshing && (
        <div className="w-full flex items-center justify-center py-3 shrink-0 animate-fade-in-up">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
          <span className="text-white/30 text-xs ml-2">刷新中...</span>
        </div>
      )}

      {/* Top bar */}
      <div className="w-full flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button onClick={() => navigate("/games")} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">{currentGame ? `${currentGame.icon} ${currentGame.name}` : "游戏大厅"}</h1>
            <p className="text-white/35 text-[10px] sm:text-xs truncate">{currentGame?.online_count ?? 0}人在线 · {rooms.length}个房间</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleRefresh} disabled={refreshing}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors text-sm"
            style={{ background: 'rgba(255,255,255,0.05)' }} title="刷新">
            ↻
          </button>
          <button onClick={() => setShowCreate(true)}
            className="px-3 sm:px-5 py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-colors hover:opacity-80"
            style={{ background: '#2563eb' }}>
            + 创建
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="w-full mb-4 shrink-0">
        <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
          placeholder="搜索房间名称或房主..."
          className="w-full px-4 py-2.5 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.67px solid rgba(255,255,255,0.08)' }} />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-sm shrink-0" style={{ background: 'rgba(239,68,68,0.1)', border: '0.67px solid rgba(239,68,68,0.15)' }}>
          {error}
          <button onClick={handleRefresh} className="ml-2 underline text-red-300 text-xs">重试</button>
        </div>
      )}

      {/* Room cards grid */}
      {filtered.length === 0 ? (
        <div className="w-full rounded-2xl py-16 text-center flex-1 flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '0.67px solid rgba(255,255,255,0.06)' }}>
          <span className="text-4xl block mb-3">🏠</span>
          <p className="text-white/30 text-sm">暂无房间</p>
          <p className="text-white/15 text-xs mt-1">快来创建第一个房间吧</p>
        </div>
      ) : (
        <div className="w-full grid gap-4 sm:gap-6 flex-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 460px), 1fr))' }}>
          {filtered.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      )}

      {showCreate && (
        <CreateRoomModal
          game={currentGame ?? { id: gameType ?? "avalon", name: gameType ?? "游戏", max_players: 8, min_players: 2, icon: "🎮" } as Game}
          onClose={() => setShowCreate(false)}
          onCreate={async (payload) => {
            const room = await createRoom(payload as unknown as Record<string, unknown>);
            setShowCreate(false);
            navigate(`/room/${room.id}`);
          }}
        />
      )}
    </div>
  );
}
