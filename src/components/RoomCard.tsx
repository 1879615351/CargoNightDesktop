import { useNavigate } from "react-router-dom";
import type { Room } from "../types";

const statusStyle: Record<string, { label: string; color: string }> = {
  Waiting: { label: "等待中", color: "#34d399" },
  Playing: { label: "游戏中", color: "#fbbf24" },
  Finished: { label: "已结束", color: "rgba(255,255,255,0.3)" },
};

export default function RoomCard({ room }: { room: Room }) {
  const navigate = useNavigate();
  const readyCount = room.players.filter((p) => p.is_ready).length;
  const s = statusStyle[room.status] ?? statusStyle.Waiting;

  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between transition-all cursor-default" style={{ background: 'rgba(255,255,255,0.04)', border: '0.67px solid rgba(255,255,255,0.08)', minHeight: '199px' }}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-white truncate">{room.name}</h3>
              {room.is_private && <span className="text-[11px]">🔒</span>}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-white/30">
              <span>👤 {room.host_name}</span>
              <span>·</span>
              <span>🎮 {room.game_name}</span>
              <span>·</span>
              <span>📋 {room.game_mode}</span>
            </div>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-md shrink-0" style={{ color: s.color, background: `${s.color}15` }}>{s.label}</span>
        </div>

        {/* Player avatars row */}
        <div className="flex items-center gap-1 mt-4">
          {room.players.slice(0, 5).map((p, i) => (
            <div key={p.id} className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 -ml-1 first:ml-0 border-2" style={{ background: 'rgba(255,255,255,0.08)', borderColor: p.is_ready ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)', zIndex: 5 - i }}>
              {p.avatar === "AI" ? "🤖" : (p.avatar || "🎮")}
            </div>
          ))}
          {room.players.length > 5 && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white/40 -ml-1 border-2 border-dashed" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.15)' }}>
              +{room.players.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: game mode + action buttons */}
      <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <span className="text-xs text-white/25">{room.game_mode} · {readyCount}/{room.players.length}/{room.max_players}人</span>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/room/${room.id}`)}
            className="px-3.5 py-1.5 rounded-lg text-xs text-white/40 transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
            👁 观战
          </button>
          {room.status === "Waiting" && (
            <button onClick={() => { navigate(`/room/${room.id}`); }} className="px-4 py-1.5 rounded-lg text-xs text-white font-medium transition-colors" style={{ background: '#2563eb' }}>
              加入
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
