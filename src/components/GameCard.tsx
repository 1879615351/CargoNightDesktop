import type { Game } from "../types";
import { useNavigate } from "react-router-dom";

const difficultyColor: Record<string, string> = {
  "简单": "bg-emerald-500/15 text-emerald-400",
  "中等": "bg-amber-500/15 text-amber-400",
  "困难": "bg-red-500/15 text-red-400",
};

export default function GameCard({ game }: { game: Game }) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '0.67px solid rgba(255,255,255,0.08)' }}
      onClick={() => navigate(`/games/${game.id}`)}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {game.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white truncate">{game.name}</h3>
            {game.hot && <span className="px-1.5 py-0.5 text-[10px] rounded-md font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>HOT</span>}
          </div>
          <p className="text-white/35 text-xs mt-1.5 line-clamp-2 leading-relaxed">{game.description}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[11px] text-white/45" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)' }}>👥 {game.min_players}-{game.max_players}人</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] text-white/45" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)' }}>⏱ {game.duration_minutes}分钟</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${difficultyColor[game.difficulty] ?? 'text-white/45'}`} style={{ background: 'rgba(255,255,255,0.04)' }}>{game.difficulty}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {game.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full text-purple-400" style={{ background: 'rgba(139,92,246,0.1)', border: '0.5px solid rgba(139,92,246,0.15)' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
