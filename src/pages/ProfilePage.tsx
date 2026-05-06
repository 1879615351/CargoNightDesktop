import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { ROLE_NAMES } from "../types/avalon";
import type { RoleName } from "../types/avalon";

interface GameRecord {
  id: string;
  room_name: string;
  game_type: string;
  winner: string;
  assassin_target: string | null;
  assassin_hit: boolean | null;
  rounds_played: number;
  mission_results: (boolean | null)[];
  players: { user_id: string; username: string; role: string }[];
  round_history: { round: number; leader_name: string; team: string[]; team_votes: Record<string, string>; team_approved: boolean; mission_success: boolean; success_count: number; fail_count: number }[];
  created_at: string;
  your_role: string | null;
  you_won: boolean | null;
}

interface ProfileStats {
  total_games: number;
  wins: number;
  win_rate: number;
  favorite_role: string | null;
  recent_records: GameRecord[];
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; host_name: string }[] | null>(null);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const [recs, s] = await Promise.all([
        api.get<GameRecord[]>("/profile/records"),
        api.get<ProfileStats>("/profile/stats"),
      ]);
      setRecords(recs); setStats(s);
    } catch {} finally { setLoading(false); }
  };

  const searchRooms = async () => {
    if (!searchText.trim()) { setSearchResults(null); return; }
    try {
      const results = await api.get<{ id: string; name: string; host_name: string }[]>(
        `/lobby/rooms?keyword=${encodeURIComponent(searchText)}`
      );
      setSearchResults(results);
    } catch {}
  };

  const toggleExpand = (id: string) => setExpandedRecord(expandedRecord === id ? null : id);

  return (
    <div className="w-full py-6 lg:py-8" style={{ paddingLeft: 'clamp(16px, 7vw, 102px)', paddingRight: 'clamp(16px, 7vw, 102px)' }}>
      <div className="max-w-[1024px] mx-auto w-full">
        <h1 className="text-xl lg:text-2xl font-bold text-white mb-6">个人中心</h1>

        {/* User Info */}
        {user && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 lg:p-6 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{user.avatar || "🎮"}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white">{user.username}</h2>
                <p className="text-white/40 text-xs mt-0.5">{user.email}</p>
                <p className="text-white/20 text-xs mt-0.5 font-mono">
                  账号: {user.account_id || "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))" }}>
            {[
              { label: "总场次", value: String(stats.total_games), color: "text-white" },
              { label: "胜场", value: String(stats.wins), color: "text-emerald-400" },
              { label: "胜率", value: `${Math.round(stats.win_rate * 100)}%`, color: "text-blue-400" },
              { label: "常用角色", value: stats.favorite_role ? ROLE_NAMES[stats.favorite_role as RoleName] ?? stats.favorite_role : "—", color: "text-amber-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-white/30 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Room Search */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white/80 mb-3">🔍 搜索房间</h3>
          <div className="flex gap-2">
            <input value={searchText} onChange={e => { setSearchText(e.target.value); setSearchResults(null); }}
              onKeyDown={e => e.key === "Enter" && searchRooms()} placeholder="输入房间名称或房主..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/30 transition-colors" />
            <button onClick={searchRooms} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors">搜索</button>
          </div>
          {searchResults && (
            <div className="mt-3 space-y-2 max-h-60 overflow-auto">
              {searchResults.length === 0 && <p className="text-white/30 text-xs text-center py-2">无匹配房间</p>}
              {searchResults.map(r => (
                <div key={r.id} className="bg-white/[0.02] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/80">{r.name}</div>
                    <div className="text-xs text-white/30">房主: {r.host_name}</div>
                  </div>
                  <span className="text-xs text-white/20 font-mono">{r.id.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Games */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 lg:p-6">
          <h3 className="text-sm font-semibold text-white/80 mb-4">📋 最近游戏 ({records.length})</h3>

          {loading && <p className="text-white/30 text-xs text-center py-8">加载中...</p>}
          {!loading && records.length === 0 && <p className="text-white/20 text-xs text-center py-8">暂无游戏记录</p>}

          <div className="space-y-3">
            {records.map(rec => {
              const isExpanded = expandedRecord === rec.id;
              const gameTypeLabel = rec.game_type === "avalon" ? "🛡️ 阿瓦隆" : rec.game_type;
              return (
                <div key={rec.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                  <button onClick={() => toggleExpand(rec.id)} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.04] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-white font-medium truncate">{rec.room_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">{gameTypeLabel}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${rec.you_won ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                          {rec.you_won ? "胜利" : "失败"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                        <span>{rec.created_at}</span>
                        <span>{rec.rounds_played}轮</span>
                        {rec.your_role && <span>角色: {ROLE_NAMES[rec.your_role as RoleName] ?? rec.your_role}</span>}
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-white/30 transition-transform shrink-0 ml-3 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Replay */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] p-4 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${rec.winner === "Good" ? "bg-blue-500/15 text-blue-400" : "bg-red-500/15 text-red-400"}`}>
                          {rec.winner === "Good" ? "好人胜利" : "坏人胜利"}
                        </span>
                        {rec.assassin_target && (
                          <span className="text-xs text-white/40">
                            🔪 刺杀: {rec.players.find(p => p.user_id === rec.assassin_target)?.username ?? "未知"}
                            {rec.assassin_hit ? " (命中!)" : " (未中)"}
                          </span>
                        )}
                      </div>

                      {/* Mission Results */}
                      <div className="flex gap-2">
                        {(rec.mission_results as (boolean | null)[]).filter(r => r !== null).map((r, i) => (
                          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${r ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-red-500/50 bg-red-500/10 text-red-400"}`}>
                            {r ? "✓" : "✗"}
                          </div>
                        ))}
                      </div>

                      {/* Round Details */}
                      {rec.round_history && rec.round_history.map((rd) => {
                        const teamNames = rd.team?.map((tid: string) => rec.players.find(p => p.user_id === tid)?.username ?? "?").join("、") ?? "";
                        return (
                          <div key={rd.round} className="bg-white/[0.02] rounded-lg p-3 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white/60 font-medium">第{rd.round}轮</span>
                              <span className={rd.team_approved ? (rd.mission_success ? "text-emerald-400" : "text-red-400") : "text-amber-400"}>
                                {rd.team_approved ? (rd.mission_success ? "✓ 成功" : "✗ 失败") : "⊘ 否决"}{rd.team_approved ? ` (${rd.success_count}/${rd.success_count + rd.fail_count})` : ""}
                              </span>
                            </div>
                            <div className="text-white/40">队长: {rd.leader_name} · 队员: {teamNames}</div>
                            <div className="text-white/25 mt-0.5">
                              投票: {Object.entries(rd.team_votes ?? {}).map(([uid, vote]: [string, string]) => {
                                const name = rec.players.find(p => p.user_id === uid)?.username ?? uid.slice(0, 6);
                                return `${name} ${vote === "approve" ? "✓" : "✗"}`;
                              }).join(" · ")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
