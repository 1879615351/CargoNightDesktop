import { useEffect, useState } from "react";
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

  const currentGame: Game | undefined = games.find((g) => g.id === gameType);

  useEffect(() => { fetchGames(); }, []);
  useEffect(() => { if (gameType) fetchRooms(gameType); }, [gameType]);

  const filtered = rooms.filter(r =>
    !searchText || r.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading && rooms.length === 0) return <Loading />;

  return (
    <div className="w-full" style={{ padding: '0 clamp(16px, 6vw, 86px)' }}>
      {/* Main Content Container (Figma: 692px vertical area) */}
      <div className="w-full relative" style={{ minHeight: '692px', paddingTop: '32px' }}>
        {/* Top bar: back link + game info + create button */}
        {/* Figma: x=16, y=32, w=992, h=72, horizontal layout, space-between */}
        <div className="w-full flex items-center justify-between mb-[calc(136px-32px-72px)]">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/games")} className="w-9 h-9 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition-colors shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-bold text-white">{currentGame ? `${currentGame.icon} ${currentGame.name}` : "游戏大厅"}</h1>
              <p className="text-white/35 text-xs">{currentGame?.online_count ?? 0}人在线 · {rooms.length}个房间</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-80" style={{ background: '#2563eb' }}>
            + 创建房间
          </button>
        </div>

        {/* Search bar */}
        <div className="w-full mb-6">
          <input value={searchText} onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索房间名称或房主..."
            className="w-full px-4 py-2.5 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.67px solid rgba(255,255,255,0.08)' }} />
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-xl text-red-400 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '0.67px solid rgba(239,68,68,0.15)' }}>{error}</div>}

        {/* Room cards grid - Figma 2-column: 488px each */}
        {filtered.length === 0 ? (
          <div className="w-full rounded-2xl py-16 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '0.67px solid rgba(255,255,255,0.06)' }}>
            <span className="text-4xl block mb-3">🏠</span>
            <p className="text-white/30 text-sm">暂无房间</p>
            <p className="text-white/15 text-xs mt-1">快来创建第一个房间吧</p>
          </div>
        ) : (
          <div className="w-full grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 460px), 1fr))', gap: '24px' }}>
            {filtered.map((room) => <RoomCard key={room.id} room={room} />)}
          </div>
        )}
      </div>

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
