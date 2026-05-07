import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import { useWebSocket } from "../hooks/useWebSocket";
import MissionHistory from "../components/avalon/MissionHistory";
import PhaseStepper from "../components/avalon/PhaseStepper";
import RoleAvatar from "../components/avalon/RoleAvatar";
import SpeakingPanel from "../components/avalon/SpeakingPanel";
import MissionResultToast from "../components/avalon/MissionResultToast";
import type { PlayerGameView, RoleName, Alignment } from "../types/avalon";
import { ROLE_NAMES } from "../types/avalon";

interface Props { roomId: string; userId: string; onBackToRoom: () => void; micActive: boolean; muted: boolean; onToggleMic: () => void; onStartMic: () => void; }

export default function AvalonGame({ roomId, userId, onBackToRoom, micActive, muted, onToggleMic, onStartMic }: Props) {
  const [game, setGame] = useState<PlayerGameView | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [showRoleCard, setShowRoleCard] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showResultToast, setShowResultToast] = useState(false);
  const [toastData, setToastData] = useState<{ success: boolean; round: number } | null>(null);
  const lastResultCountRef = useRef(0);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.get<PlayerGameView>(`/rooms/${roomId}/avalon/state`);
      setGame(data); setLoading(false);
    } catch (e) { setErr(String(e)); setLoading(false); }
  }, [roomId]);

  useEffect(() => { fetchState(); }, [fetchState]);

  // Show result toast when a new mission result appears
  useEffect(() => {
    if (!game) return;
    const results = game.mission_results.filter(r => r !== null);
    if (results.length > lastResultCountRef.current) {
      const lastResult = results[results.length - 1];
      setToastData({ success: lastResult, round: game.round });
      setShowResultToast(true);
    }
    lastResultCountRef.current = results.length;
  }, [game?.mission_results]);

  // Auto-mute when not your speaking turn
  useEffect(() => {
    if (game?.speaking_phase && !game?.is_your_turn && micActive && !muted) {
      onToggleMic();
    }
  }, [game?.speaking_phase, game?.is_your_turn, game?.current_speaker]);

  useWebSocket(roomId, {
    onAvalonState: useCallback((msg: Record<string, unknown>) => {
      const views = msg.views as Record<string, PlayerGameView> | undefined;
      if (!views) return;
      const myView = views[userId] ?? Object.values(views)[0];
      if (myView) { setGame(myView); setSelectedTeam([]); setSubmitting(false); setErr(null); }
    }, [userId]),
  });

  const apiCall = async (path: string, body?: Record<string, unknown>) => {
    setSubmitting(true); setErr(null);
    try { await api.post(`/rooms/${roomId}/avalon/${path}`, body); await fetchState(); }
    catch (e) { setErr(String(e)); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-[#0a0f1a] to-[#1a1040]">
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
        <span className="text-white/30 text-sm">加载游戏中...</span>
      </div>
    </div>
  );
  if (!game) return null;

  const leader = game.players.find(p => p.is_leader);
  const roundSize = game.mission_sizes[game.round - 1] ?? 2;
  const isLeader = leader?.user_id === userId;
  const inTeam = game.mission_team.includes(userId);
  const isGameOver = game.phase === "End";
  const isSpeaking = game.speaking_phase;
  const isProposalPhase = game.phase === "Proposal";
  const isAssassination = game.phase === "Assassination";

  const togglePlayer = (pid: string) => {
    setSelectedTeam(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : prev.length < roundSize ? [...prev, pid] : prev);
  };

  const canSelect = isProposalPhase && game.proposal_ready && isLeader && !isSpeaking;
  const canAssassinate = isAssassination && game.your_role === "Assassin";
  const mid = Math.ceil(game.players.length / 2);
  const leftPlayers = game.players.slice(0, mid);
  const rightPlayers = game.players.slice(mid);

  // Determine role/alignment visibility per player
  const getPlayerVisibleRole = (uid: string): { align?: Alignment; role?: RoleName; isGood: boolean; isEvil: boolean } => {
    if (isGameOver && game.all_roles[uid]) {
      const role = game.all_roles[uid] as RoleName;
      return { align: (["Merlin","Percival","LoyalServant"].includes(role) ? "Good" : "Evil") as Alignment, role, isGood: ["Merlin","Percival","LoyalServant"].includes(role), isEvil: !["Merlin","Percival","LoyalServant"].includes(role) };
    }
    if (isAssassination && game.assassination_visibility[uid]) {
      const v = game.assassination_visibility[uid];
      return { align: v.alignment, role: v.role as RoleName | undefined, isGood: v.alignment === "Good", isEvil: v.alignment === "Evil" };
    }
    return { isGood: false, isEvil: false };
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-[#0a0f1a] via-[#0f172b] to-[#1a1040]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      {/* Header */}
      <div className="relative shrink-0 bg-white/[0.02] border-b border-white/[0.05] backdrop-blur-sm">
        <div className="px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-white/80 text-sm font-bold tracking-wide shrink-0">🔱 阿瓦隆</span>
              <PhaseStepper phase={game.phase} round={game.round} />
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                {game.mission_results.map((r, i) => (
                  <button key={i} onClick={() => setShowHistory(true)} title="查看轮次历史"
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-all hover:scale-115 ${
                      r === null ? "border-white/[0.08] bg-white/[0.02] text-white/15" :
                      r ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10" :
                      "border-red-500/60 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/10"
                    }`}>
                    {r === null ? (i + 1) : r ? "✓" : "✗"}
                  </button>
                ))}
              </div>
              <span className="text-white/15 text-xs">👑 {leader?.username ?? "—"}</span>
              {game.consecutive_veto > 0 && (
                <span className="text-red-400/50 text-[10px] font-medium bg-red-500/5 px-2 py-0.5 rounded-full">否决×{game.consecutive_veto}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {err && (
        <div className="relative shrink-0 bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between animate-fade-in-up">
          <span className="text-red-400 text-xs">{err}</span>
          <button onClick={() => setErr(null)} className="text-red-400/60 hover:text-red-400 text-sm ml-3 shrink-0">✕</button>
        </div>
      )}

      {/* Role Reveal Card */}
      {showRoleCard && game.your_role && !isGameOver && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in-up" onClick={() => setShowRoleCard(false)}>
          <div className={`bg-[#0f172a]/90 backdrop-blur-xl border-2 rounded-3xl p-8 text-center max-w-xs mx-4 shadow-2xl animate-scale-in ${
            game.your_alignment === "Good" ? "border-blue-500/30 shadow-blue-500/10" : "border-red-500/30 shadow-red-500/10"
          }`} onClick={e => e.stopPropagation()}>
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full p-1 ${
              game.your_alignment === "Good" ? "bg-gradient-to-br from-blue-500/20 to-blue-600/10 ring-2 ring-blue-500/40" : "bg-gradient-to-br from-red-500/20 to-red-600/10 ring-2 ring-red-500/40"
            }`}>
              <RoleAvatar role={game.your_role} size={88} showRing={false} className="rounded-full" />
            </div>
            <h2 className={`text-xl font-bold mb-1 ${game.your_alignment === "Good" ? "text-blue-300" : "text-red-300"}`}>{ROLE_NAMES[game.your_role]}</h2>
            <p className={`text-sm font-medium mb-3 ${game.your_alignment === "Good" ? "text-blue-400/70" : "text-red-400/70"}`}>
              {game.your_alignment === "Good" ? "🛡️ 好人阵营" : "💀 坏人阵营"}
            </p>
            <button onClick={() => setShowRoleCard(false)}
              className={`mt-4 px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${game.your_alignment === "Good" ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"}`}>确认身份</button>
          </div>
        </div>
      )}

      {/* Main Game Area - Three Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-3 p-2 sm:p-4 min-h-0">
        {/* Player Rows - horizontal on mobile, vertical columns on desktop */}
        <div className="flex lg:flex-col justify-evenly gap-1.5 lg:w-1/4 lg:min-h-0 shrink-0">
          {leftPlayers.map((p, idx) => (
            <PlayerCard key={p.user_id} {...{ p, idx, game, userId, selectedTeam, canSelect, canAssassinate, submitting, togglePlayer, apiCall, getPlayerVisibleRole }} />
          ))}
        </div>

        {/* Center */}
        <div className="flex flex-col justify-center flex-1 min-w-0 min-h-0 lg:max-w-xl mx-auto w-full overflow-auto">
          {isSpeaking && (
            <SpeakingPanel
              queue={game.speaking_queue}
              currentSpeaker={game.current_speaker}
              remaining={game.speaking_remaining}
              isYourTurn={game.is_your_turn}
              players={game.players.map(p => ({ user_id: p.user_id, username: p.username, avatar: p.avatar }))}
              onEndSpeaking={() => apiCall("end-speaking")}
              allRoles={game.all_roles as Record<string, RoleName>}
              showRoles={isGameOver}
              micActive={micActive}
              muted={muted}
              onToggleMic={onToggleMic}
              onStartMic={onStartMic}
            />
          )}
          <PhaseActions {...{ game, isLeader, selectedTeam, roundSize, inTeam, submitting, apiCall, onBackToRoom, setShowHistory, roomId }} />
        </div>

        {/* Player Rows - horizontal on mobile, vertical columns on desktop */}
        <div className="flex lg:flex-col justify-evenly gap-1.5 lg:w-1/4 lg:min-h-0 shrink-0">
          {rightPlayers.map((p, idx) => (
            <PlayerCard key={p.user_id} {...{ p, idx, game, userId, selectedTeam, canSelect, canAssassinate, submitting, togglePlayer, apiCall, getPlayerVisibleRole }} />
          ))}
        </div>
      </div>

      {showHistory && <MissionHistory game={game} players={game.players} onClose={() => setShowHistory(false)} />}
      {showResultToast && toastData && (
        <MissionResultToast
          success={toastData.success}
          round={toastData.round}
          lastRound={game.round_history[game.round_history.length - 1] ?? null}
          onDone={() => { setShowResultToast(false); setToastData(null); }}
        />
      )}
    </div>
  );
}

function PlayerCard({ p, idx, game, userId, selectedTeam, canSelect, canAssassinate, submitting, togglePlayer, apiCall, getPlayerVisibleRole }: {
  p: PlayerGameView["players"][0]; idx: number; game: PlayerGameView; userId: string;
  selectedTeam: string[]; canSelect: boolean; canAssassinate: boolean;
  submitting: boolean; togglePlayer: (pid: string) => void;
  apiCall: (path: string, body?: Record<string, unknown>) => void;
  getPlayerVisibleRole: (uid: string) => { align?: Alignment; role?: RoleName; isGood: boolean; isEvil: boolean };
}) {
  const picked = selectedTeam.includes(p.user_id);
  const onMission = game.mission_team.includes(p.user_id);
  const isGameOver = game.phase === "End";
  const isAssassination = game.phase === "Assassination";
  const vis = (isGameOver || isAssassination) ? getPlayerVisibleRole(p.user_id) : { isGood: false, isEvil: false };
  const roleBadge = vis.role ? ROLE_NAMES[vis.role] : null;
  const isSpeaker = game.speaking_phase && game.current_speaker === p.user_id;

  return (
    <button key={p.user_id} disabled={(!canSelect && !canAssassinate) || submitting}
      style={{ animationDelay: `${idx * 50}ms` }}
      onClick={() => { if (canSelect) togglePlayer(p.user_id); if (canAssassinate) apiCall("assassinate", { target: p.user_id }); }}
      className={`animate-fade-in-up relative p-1.5 sm:p-2 lg:p-2.5 rounded-xl border transition-all duration-300 text-left w-full backdrop-blur-sm flex-shrink-0 lg:flex-shrink ${
        isSpeaker ? "bg-amber-500/[0.08] border-amber-400/50 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30 animate-pulse-glow-gold" :
        onMission ? "bg-blue-500/[0.08] border-blue-500/30 shadow-lg shadow-blue-500/5" :
        picked ? "bg-purple-500/[0.08] border-purple-500/40 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30" :
        !p.is_connected ? "bg-white/[0.02] border-white/[0.04] opacity-60" :
        vis.isGood ? "bg-blue-500/[0.06] border-blue-400/20 ring-1 ring-blue-400/15" :
        vis.isEvil ? "bg-red-500/[0.06] border-red-400/20 ring-1 ring-red-400/15" :
        "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]"
      }`}>
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
        <RoleAvatar
          role={vis.role ?? (p.user_id === userId ? game.your_role : undefined)}
          alignment={vis.align}
          size={36}
          isLeader={p.is_leader}
          isOnline={p.is_connected}
          isSelf={p.user_id === userId}
          isPicked={picked}
          showRing={!!vis.align}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] sm:text-xs font-semibold text-white truncate">{p.username}</span>
            {p.is_ai_controlled && <span className="text-[8px] px-1 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">AI</span>}
            {!p.is_connected && <span className="text-[8px] px-1 py-0.5 rounded-full bg-red-500/10 text-red-400 font-medium">离线</span>}
          </div>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            {p.known_evil && !isAssassination && !isGameOver && (
              <span className="text-[8px] px-1 py-0.5 rounded-full bg-red-500/15 text-red-400 font-semibold">邪恶</span>
            )}
            {p.known_role && !isAssassination && !isGameOver && (
              <span className="text-[8px] px-1 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold">{p.known_role === "Merlin" || p.known_role === "Morgana" ? "梅林/莫甘娜" : ROLE_NAMES[p.known_role as RoleName]}</span>
            )}
            {vis.isGood && !roleBadge && (
              <span className="text-[8px] px-1 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-400/20">好人阵营</span>
            )}
            {vis.isEvil && roleBadge && (
              <span className="text-[8px] px-1 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-400/20">{roleBadge}</span>
            )}
            {vis.isEvil && !roleBadge && (
              <span className="text-[8px] px-1 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-400/20">坏人阵营</span>
            )}
            {isSpeaker && (
              <span className="text-[8px] px-1 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30 animate-pulse-glow-gold">🎤 发言中</span>
            )}
            {isGameOver && vis.role && (
              <span className={`text-[8px] px-1 py-0.5 rounded-full font-semibold ${vis.isGood ? "bg-blue-500/10 text-blue-400 border border-blue-400/15" : "bg-red-500/10 text-red-400 border border-red-400/15"}`}>
                {ROLE_NAMES[vis.role]}
              </span>
            )}
          </div>
        </div>
      </div>
      {picked && !isGameOver && !isAssassination && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[9px] text-white font-bold shadow-lg shadow-purple-500/30">✓</div>
      )}
      {onMission && !isGameOver && !isAssassination && (
        <div className="absolute top-1 right-1 text-[8px] px-1 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">任务中</div>
      )}
    </button>
  );
}

function PhaseActions({ game, isLeader, selectedTeam, roundSize, inTeam, submitting, apiCall, onBackToRoom, setShowHistory, roomId }: {
  game: PlayerGameView; isLeader: boolean; selectedTeam: string[]; roundSize: number;
  inTeam: boolean; submitting: boolean;
  apiCall: (path: string, body?: Record<string, unknown>) => void;
  onBackToRoom: () => void; setShowHistory: (v: boolean) => void; roomId: string;
}) {
  const isGameOver = game.phase === "End";
  const goodWins = game.winner === "Good";
  const isAssassination = game.phase === "Assassination";

  return (
    <div className="animate-fade-in-up flex flex-col gap-3">
      {/* Proposal Phase */}
      {game.phase === "Proposal" && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3 sm:p-3.5 backdrop-blur-sm text-center">
          {isLeader && game.proposal_ready && !game.speaking_phase ? (
            <>
              <h3 className="text-sm font-semibold text-white/80 mb-2">👑 选择 <span className="text-amber-400">{roundSize}</span> 名队员</h3>
              <button onClick={() => apiCall("select-team", { team: selectedTeam })}
                disabled={selectedTeam.length !== roundSize || submitting}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 ${
                  selectedTeam.length === roundSize ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-purple-500/25" : "bg-white/[0.05] text-white/20"
                }`}>
                {selectedTeam.length === roundSize ? "⚔ 确认队伍" : `还需 ${roundSize - selectedTeam.length} 人`}
              </button>
            </>
          ) : (
            <p className="text-white/25 text-sm py-1">{game.speaking_phase ? "队长正在发言..." : "等待队长选择队伍"}</p>
          )}
        </div>
      )}

      {/* Vote Phase */}
      {game.phase === "Vote" && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3 sm:p-3.5 backdrop-blur-sm text-center">
          <h3 className="text-xs font-semibold text-white/60 mb-2">🗳 投票表决</h3>
          {game.is_your_turn ? (
            <div className="flex gap-3 justify-center">
              <button onClick={() => apiCall("team-vote", { vote: "approve" })} disabled={submitting}
                className="w-28 h-12 rounded-2xl bg-emerald-600/80 hover:bg-emerald-500 disabled:bg-white/[0.05] disabled:text-white/15 text-white text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1"><span>✓</span> 同意</button>
              <button onClick={() => apiCall("team-vote", { vote: "reject" })} disabled={submitting}
                className="w-28 h-12 rounded-2xl bg-red-600/80 hover:bg-red-500 disabled:bg-white/[0.05] disabled:text-white/15 text-white text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/20 flex items-center justify-center gap-1"><span>✗</span> 否决</button>
            </div>
          ) : (
            <p className="text-white/20 text-xs py-1">等待投票...</p>
          )}
        </div>
      )}

      {/* Mission Phase */}
      {game.phase === "Mission" && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3 sm:p-3.5 backdrop-blur-sm text-center">
          {inTeam ? (
            <>
              <h3 className="text-sm font-semibold text-white/80 mb-3">⚔ 你在任务队伍中</h3>
              <div className="flex gap-3 justify-center">
                <button onClick={() => apiCall("mission-vote", { vote: "success" })} disabled={submitting}
                  className="w-32 h-12 rounded-2xl bg-emerald-600/80 hover:bg-emerald-500 disabled:bg-white/[0.05] disabled:text-white/15 text-white text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1"><span>✓</span> 成功</button>
                <button onClick={() => apiCall("mission-vote", { vote: "fail" })} disabled={submitting}
                  className="w-32 h-12 rounded-2xl bg-red-600/80 hover:bg-red-500 disabled:bg-white/[0.05] disabled:text-white/15 text-white text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/20 flex items-center justify-center gap-1"><span>✗</span> 失败</button>
              </div>
            </>
          ) : (
            <p className="text-white/20 text-xs py-2">任务进行中...</p>
          )}
        </div>
      )}

      {/* Result Phase */}
      {game.phase === "Result" && (() => {
        const lastResult = game.mission_results.filter(r => r !== null).pop();
        return (
          <div className={`rounded-2xl p-5 text-center backdrop-blur-sm animate-scale-in ${lastResult ? "bg-emerald-500/[0.06] border border-emerald-500/20" : "bg-red-500/[0.06] border border-red-500/20"}`}>
            <span className="text-3xl block mb-2 animate-float">{lastResult ? "✅" : "❌"}</span>
            <h3 className={`text-lg font-bold ${lastResult ? "text-emerald-300" : "text-red-300"}`}>{lastResult ? "任务成功！" : "任务失败！"}</h3>
          </div>
        );
      })()}

      {/* Assassination */}
      {isAssassination && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-sm text-center animate-fade-in-up">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/10 ring-2 ring-red-500/20 flex items-center justify-center text-xl animate-float">🔪</div>
          {game.your_role === "Assassin" ? (
            <h3 className="text-sm font-bold text-red-400">你是刺客，点击上方玩家头像选择刺杀目标</h3>
          ) : (
            <p className="text-white/25 text-sm">刺客正在选择目标...</p>
          )}
        </div>
      )}

      {/* Game End - Split Winners / Losers */}
      {isGameOver && (
        <div onClick={async () => {
          try { await api.post(`/rooms/${roomId}/avalon/confirm-settlement`, {}); } catch {}
          onBackToRoom();
        }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-sm animate-scale-in cursor-pointer">
          {/* Winner Banner */}
          <div className={`text-center mb-5 pb-4 border-b border-white/[0.06]`}>
            <div className={`w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl ring-3 ${goodWins ? "bg-blue-500/10 ring-blue-500/20" : "bg-red-500/10 ring-red-500/20"}`}>
              {goodWins ? "🎉" : "💀"}
            </div>
            <h2 className={`text-xl font-black ${goodWins ? "text-emerald-300" : "text-red-300"}`}>
              {goodWins ? "好人阵营获胜！" : "坏人阵营获胜！"}
            </h2>
            {game.assassin_target && (() => {
              const tname = game.players.find(p => p.user_id === game.assassin_target)?.username ?? "?";
              const wasMerlin = game.all_roles[game.assassin_target] === "Merlin";
              return (
                <p className={`text-xs mt-1 font-medium ${wasMerlin ? "text-red-400" : "text-emerald-400"}`}>
                  🔪 刺客刺杀了 <b>{tname}</b> {wasMerlin ? "(梅林!) → 坏人逆转" : "(未中)"}
                </p>
              );
            })()}
          </div>

          {/* Winning Side */}
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider mb-2">🏆 胜利方</p>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
              {Object.entries(game.all_roles).filter(([_, r]) => {
                const isGood = ["Merlin","Percival","LoyalServant"].includes(r);
                return goodWins ? isGood : !isGood;
              }).map(([uid, role]) => {
                const p = game.players.find(pp => pp.user_id === uid);
                const isGood = ["Merlin","Percival","LoyalServant"].includes(role);
                return (
                  <div key={uid} className={`rounded-xl p-2.5 text-center ${isGood ? "bg-blue-500/[0.04] border border-blue-500/10" : "bg-red-500/[0.04] border border-red-500/10"}`}>
                    <RoleAvatar role={role as RoleName} alignment={isGood ? "Good" : "Evil"} size={36} className="mx-auto" />
                    <div className="mt-1 text-[11px] font-semibold text-white truncate">{p?.username ?? uid}</div>
                    <div className={`text-[9px] font-bold ${isGood ? "text-blue-400" : "text-red-400"}`}>{ROLE_NAMES[role as RoleName]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Losing Side */}
          <div>
            <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider mb-2">💀 失败方</p>
            <div className="grid gap-2 opacity-70" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))" }}>
              {Object.entries(game.all_roles).filter(([_, r]) => {
                const isGood = ["Merlin","Percival","LoyalServant"].includes(r);
                return goodWins ? !isGood : isGood;
              }).map(([uid, role]) => {
                const p = game.players.find(pp => pp.user_id === uid);
                const isGood = ["Merlin","Percival","LoyalServant"].includes(role);
                return (
                  <div key={uid} className={`rounded-xl p-2.5 text-center ${isGood ? "bg-blue-500/[0.04] border border-blue-500/10" : "bg-red-500/[0.04] border border-red-500/10"}`}>
                    <RoleAvatar role={role as RoleName} alignment={isGood ? "Good" : "Evil"} size={36} className="mx-auto" />
                    <div className="mt-1 text-[11px] font-semibold text-white truncate">{p?.username ?? uid}</div>
                    <div className={`text-[9px] font-bold ${isGood ? "text-blue-400" : "text-red-400"}`}>{ROLE_NAMES[role as RoleName]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          {game.round_history.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setShowHistory(true); }} className="block mx-auto mt-4 text-xs text-blue-400/70 hover:text-blue-400 underline">
              查看轮次历史 ({game.round_history.length}轮)
            </button>
          )}
          <p className="mt-4 text-white/20 text-xs animate-pulse">点击任意位置回到房间</p>
        </div>
      )}
    </div>
  );
}
