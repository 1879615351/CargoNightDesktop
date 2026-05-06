import type { Player } from "../types";

export default function PlayerList({
  players,
  maxPlayers,
  isHost,
  onToggleReady,
  currentPlayerId,
}: {
  players: Player[];
  maxPlayers: number;
  isHost: boolean;
  onToggleReady: () => void;
  currentPlayerId: string;
}) {
  const emptySlots = Math.max(0, maxPlayers - players.length);
  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">
          玩家列表 ({players.length}/{maxPlayers})
        </h3>
      </div>
      <div className="space-y-1.5">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              player.is_ready
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-white/5 border border-white/5"
            }`}
          >
            <span className="text-xl">{player.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">{player.name}</span>
                {player.is_host && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">房主</span>
                )}
                {player.id === currentPlayerId && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">我</span>
                )}
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded ${
                player.is_ready
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-white/5 text-white/40"
              }`}
            >
              {player.is_ready ? "✅ 已准备" : "⏳ 未准备"}
            </span>
          </div>
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-dashed border-white/10"
          >
            <span className="text-xl opacity-30">👤</span>
            <span className="text-sm text-white/20">空位</span>
          </div>
        ))}
      </div>

      {currentPlayer && !currentPlayer.is_host && (
        <button
          onClick={onToggleReady}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentPlayer.is_ready
              ? "bg-white/10 hover:bg-white/15 text-white/70"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          {currentPlayer.is_ready ? "取消准备" : "准备"}
        </button>
      )}

      {isHost && (
        <button
          onClick={onToggleReady}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium transition-all"
        >
          🚀 开始游戏
        </button>
      )}
    </div>
  );
}
