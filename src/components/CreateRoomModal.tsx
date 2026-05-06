import { useState } from "react";
import type { Game, CreateRoomPayload } from "../types";

export default function CreateRoomModal({ game, onClose, onCreate }: {
  game: Game;
  onClose: () => void;
  onCreate: (payload: CreateRoomPayload) => Promise<void>;
}) {
  const [name, setName] = useState(`${game.name}-房间`);
  const [maxPlayers, setMaxPlayers] = useState(game.max_players);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [gameMode, setGameMode] = useState("经典");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) { setError("请输入房间名称"); return; }
    setCreating(true); setError(null);
    try {
      await onCreate({
        name: name.trim(), game_id: game.id, game_name: game.name,
        max_players: maxPlayers, is_private: isPrivate,
        password: isPrivate && password ? password : null,
        game_mode: gameMode,
      });
    } catch (e) { setError(String(e)); }
    finally { setCreating(false); }
  };

  const gameModes = ["经典", "快速", "锦标赛", "欢乐"];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#151d2e] border border-white/[0.08] rounded-2xl w-full max-w-[460px] p-6 lg:p-8 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">创建房间 — {game.icon} {game.name}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {error && <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-xs">{error}</div>}

        <div className="space-y-5">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">房间名称</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/30 transition-colors" />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">最大人数 <span className="text-white/80 font-medium ml-1">{maxPlayers}</span></label>
            <input type="range" min={game.min_players} max={game.max_players} value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))} className="w-full accent-blue-500" />
            <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>{game.min_players}人</span><span>{game.max_players}人</span></div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">游戏模式</label>
            <div className="flex flex-wrap gap-2">
              {gameModes.map((mode) => (
                <button key={mode} onClick={() => setGameMode(mode)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${gameMode === mode ? "bg-blue-600 text-white" : "bg-white/[0.04] border border-white/[0.08] text-white/45 hover:text-white/70 hover:bg-white/[0.08]"}`}>{mode}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-white/50">私密房间（需要密码加入）</label>
            <button onClick={() => setIsPrivate(!isPrivate)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isPrivate ? "bg-blue-600" : "bg-white/[0.12]"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isPrivate ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {isPrivate && (
            <div>
              <label className="block text-xs text-white/50 mb-1.5">房间密码</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/30 transition-colors" placeholder="输入密码" />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/50 text-sm font-medium transition-colors">取消</button>
          <button onClick={handleCreate} disabled={creating}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white text-sm font-medium transition-all">{creating ? "创建中..." : "创建房间"}</button>
        </div>
      </div>
    </div>
  );
}
