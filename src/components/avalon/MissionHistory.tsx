import type { PlayerGameView, PlayerViewInfo } from "../../types/avalon";

interface Props { game: PlayerGameView; onClose: () => void; players: PlayerViewInfo[] }

export default function MissionHistory({ game, onClose, players }: Props) {
  return (
    <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center animate-fade-in-up" onClick={onClose}>
      <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl w-full max-w-lg mx-4 max-h-[82vh] overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/[0.06] px-5 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-lg">📋</span> 轮次历史
          </h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/40 hover:text-white flex items-center justify-center text-sm transition-all">✕</button>
        </div>

        <div className="p-4 space-y-3 overflow-auto max-h-[calc(82vh-60px)]">
          {game.round_history.length === 0 && (
            <p className="text-white/20 text-sm text-center py-8">暂无已完成轮次</p>
          )}
          {game.round_history.map((rec) => {
            const teamNames = rec.team.map(tid => players.find(p => p.user_id === tid)?.username ?? "未知").join("、");
            const voteCount = Object.keys(rec.team_votes).length;
            const approveCount = Object.values(rec.team_votes).filter(v => v === "approve").length;
            return (
              <div key={rec.round} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-white/[0.05] flex items-center justify-center text-xs font-bold text-white/60">
                      {rec.round}
                    </span>
                    <span className="text-sm font-semibold text-white/80">第 {rec.round} 轮</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    rec.team_approved
                      ? (rec.mission_success
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/15 text-red-400 border border-red-500/20")
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  }`}>
                    {rec.team_approved ? (rec.mission_success ? "✓ 成功" : "✗ 失败") : "⊘ 否决"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-white/25 shrink-0">👑 队长</span>
                    <span className="text-white/70">{rec.leader_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/25 shrink-0">👥 队员</span>
                    <span className="text-white/60">{teamNames}</span>
                  </div>
                  <div>
                    <span className="text-white/25 block mb-1">🗳 投票 ({approveCount}/{voteCount} 同意)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(rec.team_votes).map(([uid, vote]) => {
                        const name = players.find(p => p.user_id === uid)?.username ?? uid.slice(0, 6);
                        return (
                          <span key={uid} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            vote === "approve"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : "bg-red-500/10 text-red-400 border border-red-500/15"
                          }`}>
                            {name} {vote === "approve" ? "✓" : "✗"}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  {rec.team_approved && (
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/[0.04]">
                      <span className="text-white/25">⚔ 任务结果</span>
                      <span className="text-white/50">
                        <span className="text-emerald-400/80 font-medium">✓ {rec.success_count}</span>
                        <span className="text-white/20 mx-1">·</span>
                        <span className="text-red-400/80 font-medium">✗ {rec.fail_count}</span>
                      </span>
                      <span className="text-white/15 text-[10px]">(匿名)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
