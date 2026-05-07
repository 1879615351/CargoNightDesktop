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

  useEffect(() => {
    if (!game) return;
    const results = game.mission_results.filter(r => r !== null);
    if (results.length > lastResultCountRef.current) {
      setToastData({ success: results[results.length - 1], round: results.length });
      setShowResultToast(true);
    }
    lastResultCountRef.current = results.length;
  }, [game?.mission_results]);

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
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
        <span className="text-white/30 text-sm">正在加入游戏...</span>
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
  const canSelect = isProposalPhase && game.proposal_ready && isLeader && !isSpeaking;
  const canAssassinate = isAssassination && game.your_role === "Assassin";

  const togglePlayer = (pid: string) => {
    setSelectedTeam(prev => prev.includes(pid) ? prev.filter(x => x !== pid) : prev.length < roundSize ? [...prev, pid] : prev);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-b from-[#0a0a12] via-[#0d1117] to-[#0f0f1a]">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vw,80vh)] h-[min(80vw,80vh)] rounded-full opacity-[0.03]" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      </div>

      {/* Top Status Bar */}
      <div className="relative shrink-0 z-10">
        <div className="px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-white/70 text-xs sm:text-sm font-bold tracking-wider">🔱 阿瓦隆</span>
            <div className="hidden sm:block"><PhaseStepper phase={game.phase} round={game.round} /></div>
            <span className="text-white/15 text-[10px] sm:text-xs">第 {game.round} 轮</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              {game.mission_results.map((r, i) => (
                <button key={i} onClick={() => setShowHistory(true)}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold transition-all ${
                    r === null ? "bg-white/[0.04] text-white/15 border border-white/[0.06]" :
                    r ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10" :
                    "bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm shadow-red-500/10"
                  }`}>
                  {r === null ? (i + 1) : r ? "✓" : "✗"}
                </button>
              ))}
            </div>
            <span className="text-white/25 text-[10px] sm:text-xs">👑 {leader?.username ?? "—"}</span>
            {game.consecutive_veto > 0 && (
              <span className="text-red-400/50 text-[9px] bg-red-500/10 px-1.5 py-0.5 rounded-full">否决×{game.consecutive_veto}</span>
            )}
          </div>
        </div>
        {err && (
          <div className="mx-3 sm:mx-5 mb-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-xs flex items-center justify-between">
            <span>{err}</span>
            <button onClick={() => setErr(null)} className="text-red-400/60 hover:text-red-400 ml-2">✕</button>
          </div>
        )}
      </div>

      {/* Role Reveal Overlay */}
      {showRoleCard && game.your_role && !isGameOver && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center" onClick={() => setShowRoleCard(false)}>
          <div className={`p-6 sm:p-8 rounded-3xl text-center max-w-[280px] sm:max-w-xs mx-4 shadow-2xl animate-scale-in ${
            game.your_alignment === "Good"
              ? "bg-gradient-to-b from-blue-950/95 to-blue-900/90 border border-blue-500/20"
              : "bg-gradient-to-b from-red-950/95 to-red-900/90 border border-red-500/20"
          }`} onClick={e => e.stopPropagation()}>
            <div className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
              game.your_alignment === "Good" ? "bg-blue-500/10 ring-2 ring-blue-400/30" : "bg-red-500/10 ring-2 ring-red-400/30"
            }`}>
              <RoleAvatar role={game.your_role} size={72} showRing={false} className="rounded-full" />
            </div>
            <h2 className={`text-xl sm:text-2xl font-black mb-1 ${game.your_alignment === "Good" ? "text-blue-200" : "text-red-200"}`}>
              {ROLE_NAMES[game.your_role]}
            </h2>
            <p className={`text-xs sm:text-sm mb-4 ${game.your_alignment === "Good" ? "text-blue-400/60" : "text-red-400/60"}`}>
              {game.your_alignment === "Good" ? "🛡️ 好人阵营" : "💀 坏人阵营"}
            </p>
            <button onClick={() => setShowRoleCard(false)}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${
                game.your_alignment === "Good" ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-red-600 hover:bg-red-500 text-white"
              }`}>确认身份</button>
          </div>
        </div>
      )}

      {/* Main Game Area - Circular Table Layout */}
      <div className="relative flex-1 min-h-0 z-10">
        <RoundTable
          players={game.players}
          userId={userId}
          game={game}
          selectedTeam={selectedTeam}
          canSelect={canSelect}
          canAssassinate={canAssassinate}
          submitting={submitting}
          togglePlayer={togglePlayer}
          apiCall={apiCall}
          isGameOver={isGameOver}
          isAssassination={isAssassination}
        />
      </div>

      {/* Bottom Action Panel */}
      {!isGameOver && (
        <div className="relative shrink-0 z-10 px-3 sm:px-5 pb-2 sm:pb-3">
          <ActionPanel
            game={game} isLeader={isLeader} inTeam={inTeam}
            selectedTeam={selectedTeam} roundSize={roundSize} submitting={submitting}
            apiCall={apiCall} micActive={micActive} muted={muted}
            onToggleMic={onToggleMic} onStartMic={onStartMic}
            isSpeaking={isSpeaking} setShowHistory={setShowHistory}
          />
        </div>
      )}

      {/* Game End Overlay */}
      {isGameOver && (
        <GameEndOverlay game={game} onBackToRoom={onBackToRoom} setShowHistory={setShowHistory} roomId={roomId} />
      )}

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

/* ====== Circular Table Component ====== */
function RoundTable({ players, userId, game, selectedTeam, canSelect, canAssassinate, submitting, togglePlayer, apiCall, isGameOver, isAssassination }: {
  players: PlayerGameView["players"]; userId: string; game: PlayerGameView;
  selectedTeam: string[]; canSelect: boolean; canAssassinate: boolean; submitting: boolean;
  togglePlayer: (pid: string) => void;
  apiCall: (path: string, body?: Record<string, unknown>) => void;
  isGameOver: boolean; isAssassination: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 400, h: 400 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setDims({ w: r.width, h: r.height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const n = players.length;
  const cx = dims.w / 2;
  const cy = dims.h / 2;
  const radius = Math.min(dims.w, dims.h) * 0.38;

  const phaseLabel = (() => {
    const labels: Record<string, string> = {
      RoleReveal: "身份确认", Proposal: "队长选人", Discussion: "讨论阶段",
      Vote: "投票表决", Mission: "任务执行", Result: "结果揭晓",
      Assassination: "刺杀阶段", End: "游戏结束"
    };
    return labels[game.phase] ?? game.phase;
  })();

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Central Table */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `${Math.min(dims.w, dims.h) * 0.3}px`,
          height: `${Math.min(dims.w, dims.h) * 0.3}px`,
        }}>
        <div className="w-full h-full rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)',
            border: '1.5px solid rgba(139,92,246,0.2)',
            boxShadow: '0 0 60px rgba(139,92,246,0.08), inset 0 0 40px rgba(0,0,0,0.3)',
          }}>
          <span className="text-white/10 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em]">{phaseLabel}</span>
          <div className="text-white/50 text-2xl sm:text-3xl mt-1">
            {game.phase === "Proposal" ? "👑" : game.phase === "Vote" ? "🗳️" : game.phase === "Mission" ? "⚔️" :
             game.phase === "Result" ? (game.mission_results.filter(r => r !== null).pop() ? "✅" : "❌") :
             game.phase === "Assassination" ? "🔪" : "🛡️"}
          </div>
          <span className="text-white/20 text-[10px] sm:text-xs mt-1">第 {game.round}/5 轮</span>
        </div>
      </div>

      {/* Players around the circle */}
      {players.map((p, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        const picked = selectedTeam.includes(p.user_id);
        const onMission = game.mission_team.includes(p.user_id);
        const isSpeaker = game.speaking_phase && game.current_speaker === p.user_id;
        const isSelf = p.user_id === userId;
        const isLeader = p.is_leader;

        const vis = (isGameOver || isAssassination) ? (() => {
          if (isGameOver && game.all_roles[p.user_id]) {
            const role = game.all_roles[p.user_id] as RoleName;
            return { align: (["Merlin","Percival","LoyalServant"].includes(role) ? "Good" : "Evil") as Alignment, role, isGood: ["Merlin","Percival","LoyalServant"].includes(role), isEvil: !["Merlin","Percival","LoyalServant"].includes(role) };
          }
          if (isAssassination && game.assassination_visibility[p.user_id]) {
            const v = game.assassination_visibility[p.user_id];
            return { align: v.alignment, role: v.role as RoleName | undefined, isGood: v.alignment === "Good", isEvil: v.alignment === "Evil" };
          }
          return { isGood: false, isEvil: false, align: undefined as Alignment | undefined, role: undefined as RoleName | undefined };
        })() : { isGood: false, isEvil: false, align: undefined as Alignment | undefined, role: undefined as RoleName | undefined };

        return (
          <button key={p.user_id}
            disabled={(!canSelect && !canAssassinate) || submitting}
            onClick={() => { if (canSelect) togglePlayer(p.user_id); if (canAssassinate) apiCall("assassinate", { target: p.user_id }); }}
            style={{
              position: "absolute",
              left: `${x}px`,
              top: `${y}px`,
              transform: "translate(-50%, -50%)",
              zIndex: isSpeaker ? 20 : 10,
            }}
            className={`group flex flex-col items-center gap-1 transition-all duration-300 ${
              !p.is_connected ? "opacity-40" : ""
            }`}>
            {/* Avatar circle */}
            <div className={`relative w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] rounded-full flex items-center justify-center transition-all duration-300 ${
              isSpeaker ? "ring-[3px] ring-amber-400/60 scale-110 shadow-lg shadow-amber-500/30" :
              picked && canSelect ? "ring-[3px] ring-purple-400/60 scale-105 shadow-lg shadow-purple-500/20" :
              onMission ? "ring-[3px] ring-blue-400/40 shadow-lg shadow-blue-500/15" :
              vis.isGood ? "ring-1 ring-blue-400/30" :
              vis.isEvil ? "ring-1 ring-red-400/30" :
              "ring-1 ring-white/[0.08]"
            } ${isSpeaker ? "animate-pulse-glow-gold" : ""}`}
              style={{
                background: isSpeaker ? 'rgba(251,191,36,0.1)' :
                            picked ? 'rgba(147,51,234,0.1)' :
                            onMission ? 'rgba(59,130,246,0.1)' :
                            vis.isGood ? 'rgba(59,130,246,0.06)' :
                            vis.isEvil ? 'rgba(239,68,68,0.06)' :
                            'rgba(255,255,255,0.04)',
              }}>
              <RoleAvatar
                role={vis.role ?? (isSelf ? game.your_role : undefined)}
                alignment={vis.align}
                size={isSpeaker ? 40 : 36}
                showRing={false}
                className="rounded-full"
              />
              {/* Leader crown */}
              {isLeader && (
                <div className="absolute -top-2 -right-1 text-[10px] sm:text-xs">👑</div>
              )}
              {/* Selection check */}
              {picked && canSelect && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-500 flex items-center justify-center text-[8px] text-white font-bold shadow-md">✓</div>
              )}
              {/* Speaking indicator */}
              {isSpeaker && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] px-1 rounded-full bg-amber-500 text-white font-bold animate-pulse">🎤</div>
              )}
            </div>
            {/* Name */}
            <span className={`text-[9px] sm:text-[10px] font-medium truncate max-w-[56px] text-center leading-tight ${
              isSpeaker ? "text-amber-300" : isSelf ? "text-blue-300" : "text-white/60"
            }`}>
              {p.username}
            </span>
            {/* Status tags */}
            <div className="flex gap-0.5 flex-wrap justify-center">
              {p.is_ai_controlled && <span className="text-[7px] px-1 py-0.5 rounded bg-purple-500/15 text-purple-400">AI</span>}
              {!p.is_connected && <span className="text-[7px] px-1 py-0.5 rounded bg-red-500/10 text-red-400">离线</span>}
              {p.known_evil && !isAssassination && !isGameOver && <span className="text-[7px] px-1 py-0.5 rounded bg-red-500/15 text-red-400">邪恶</span>}
              {vis.role && (isGameOver || isAssassination) && (
                <span className={`text-[7px] px-1 py-0.5 rounded ${vis.isGood ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>
                  {ROLE_NAMES[vis.role]}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ====== Bottom Action Panel ====== */
function ActionPanel({ game, isLeader, inTeam, selectedTeam, roundSize, submitting, apiCall, micActive, muted, onToggleMic, onStartMic, isSpeaking, setShowHistory }: {
  game: PlayerGameView; isLeader: boolean; inTeam: boolean; selectedTeam: string[]; roundSize: number;
  submitting: boolean; apiCall: (path: string, body?: Record<string, unknown>) => void;
  micActive: boolean; muted: boolean; onToggleMic: () => void; onStartMic: () => void;
  isSpeaking: boolean; setShowHistory: (v: boolean) => void;
}) {
  const phase = game.phase;

  return (
    <div className="flex flex-col gap-2">
      {/* Speaking Panel */}
      {isSpeaking && (
        <SpeakingPanel
          queue={game.speaking_queue}
          currentSpeaker={game.current_speaker}
          remaining={game.speaking_remaining}
          isYourTurn={game.is_your_turn}
          players={game.players.map(p => ({ user_id: p.user_id, username: p.username, avatar: p.avatar }))}
          onEndSpeaking={() => apiCall("end-speaking")}
          allRoles={game.all_roles as Record<string, RoleName>}
          showRoles={false}
          micActive={micActive}
          muted={muted}
          onToggleMic={onToggleMic}
          onStartMic={onStartMic}
        />
      )}

      {/* Phase-specific actions */}
      <div className="flex items-center gap-3">
        {/* Your role badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '0.67px solid rgba(255,255,255,0.06)' }}>
          <RoleAvatar role={game.your_role ?? undefined} alignment={game.your_alignment ?? undefined} size={32} showRing={false} className="rounded-full" />
          <div>
            <div className="text-white/80 text-[10px] sm:text-xs font-semibold">{ROLE_NAMES[game.your_role ?? "LoyalServant"]}</div>
            <div className={`text-[9px] sm:text-[10px] ${game.your_alignment === "Good" ? "text-blue-400" : "text-red-400"}`}>
              {game.your_alignment === "Good" ? "好人阵营" : "坏人阵营"}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {/* Proposal */}
          {phase === "Proposal" && isLeader && game.proposal_ready && !isSpeaking && (
            <button onClick={() => apiCall("select-team", { team: selectedTeam })}
              disabled={selectedTeam.length !== roundSize || submitting}
              className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedTeam.length === roundSize
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02]"
                  : "bg-white/[0.05] text-white/20"
              }`}>
              {selectedTeam.length === roundSize ? "⚔ 确认队伍" : `选择 ${roundSize} 名队员 (${selectedTeam.length}/${roundSize})`}
            </button>
          )}
          {phase === "Proposal" && (!isLeader || !game.proposal_ready || isSpeaking) && (
            <div className="flex-1 text-center text-white/20 text-xs sm:text-sm py-2">
              {isSpeaking ? "队长发言中..." : "等待队长选择队伍..."}
            </div>
          )}

          {/* Vote */}
          {phase === "Vote" && game.is_your_turn && (
            <div className="flex gap-2 flex-1">
              <button onClick={() => apiCall("team-vote", { vote: "approve" })} disabled={submitting}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]">
                ✓ 同意
              </button>
              <button onClick={() => apiCall("team-vote", { vote: "reject" })} disabled={submitting}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-500/20 hover:scale-[1.02]">
                ✗ 否决
              </button>
            </div>
          )}
          {phase === "Vote" && !game.is_your_turn && (
            <span className="flex-1 text-center text-white/20 text-xs sm:text-sm">等待投票中...</span>
          )}

          {/* Mission */}
          {phase === "Mission" && inTeam && (
            <div className="flex gap-2 flex-1">
              <button onClick={() => apiCall("mission-vote", { vote: "success" })} disabled={submitting}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02]">
                ✓ 任务成功
              </button>
              <button onClick={() => apiCall("mission-vote", { vote: "fail" })} disabled={submitting}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-500/20 hover:scale-[1.02]">
                ✗ 任务失败
              </button>
            </div>
          )}
          {phase === "Mission" && !inTeam && (
            <span className="flex-1 text-center text-white/20 text-xs sm:text-sm">任务执行中...</span>
          )}

          {/* Result */}
          {phase === "Result" && (
            <span className="flex-1 text-center text-white/30 text-xs sm:text-sm">等待下一轮...</span>
          )}

          {/* Assassination */}
          {phase === "Assassination" && (
            <span className={`flex-1 text-center text-xs sm:text-sm ${game.your_role === "Assassin" ? "text-red-400 font-semibold" : "text-white/25"}`}>
              {game.your_role === "Assassin" ? "点击场上玩家头像选择刺杀目标" : "刺客正在选择目标..."}
            </span>
          )}

          {/* Other phases */}
          {phase === "Discussion" && <span className="flex-1 text-center text-white/20 text-xs sm:text-sm">讨论阶段，等待进入投票</span>}
          {phase === "RoleReveal" && <span className="flex-1 text-center text-white/20 text-xs sm:text-sm">查看你的身份...</span>}
        </div>

        {/* Right-side buttons */}
        <button onClick={() => setShowHistory(true)}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors text-sm shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)' }} title="轮次历史">
          📋
        </button>
      </div>
    </div>
  );
}

/* ====== Game End Overlay ====== */
function GameEndOverlay({ game, onBackToRoom, setShowHistory, roomId }: {
  game: PlayerGameView; onBackToRoom: () => void; setShowHistory: (v: boolean) => void; roomId: string;
}) {
  const goodWins = game.winner === "Good";
  const handleLeave = async () => {
    try { await api.post(`/rooms/${roomId}/avalon/confirm-settlement`, {}); } catch {}
    onBackToRoom();
  };
  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleLeave}>
      <div onClick={(e) => { e.stopPropagation(); handleLeave(); }}
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 text-center cursor-pointer animate-scale-in"
        style={{
          background: goodWins ? 'linear-gradient(180deg, rgba(16,185,129,0.15), rgba(6,78,59,0.5))' : 'linear-gradient(180deg, rgba(239,68,68,0.15), rgba(127,29,29,0.5))',
          border: `1px solid ${goodWins ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
        <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl sm:text-4xl ${
          goodWins ? "bg-emerald-500/10 ring-2 ring-emerald-500/20" : "bg-red-500/10 ring-2 ring-red-500/20"
        }`}>
          {goodWins ? "🎉" : "💀"}
        </div>
        <h2 className={`text-xl sm:text-2xl font-black mb-2 ${goodWins ? "text-emerald-300" : "text-red-300"}`}>
          {goodWins ? "好人阵营获胜！" : "坏人阵营获胜！"}
        </h2>
        {game.assassin_target && (() => {
          const tname = game.players.find(p => p.user_id === game.assassin_target)?.username ?? "?";
          const wasMerlin = game.all_roles[game.assassin_target] === "Merlin";
          return (
            <p className={`text-xs sm:text-sm mt-1 font-medium ${wasMerlin ? "text-red-400" : "text-emerald-400"}`}>
              🔪 刺客刺杀了 <b>{tname}</b> {wasMerlin ? "(梅林!) → 坏人逆转" : "(未中)"}
            </p>
          );
        })()}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-5 text-left">
          <div>
            <p className="text-[10px] sm:text-xs text-emerald-400/70 font-semibold mb-2">🏆 胜利方</p>
            {Object.entries(game.all_roles).filter(([_, r]) => {
              const isGood = ["Merlin","Percival","LoyalServant"].includes(r);
              return goodWins ? isGood : !isGood;
            }).map(([uid, role]) => {
              const p = game.players.find(pp => pp.user_id === uid);
              return (
                <div key={uid} className="flex items-center gap-2 py-1">
                  <RoleAvatar role={role as RoleName} alignment={(["Merlin","Percival","LoyalServant"].includes(role) ? "Good" : "Evil") as Alignment} size={24} className="rounded-full" />
                  <span className="text-white/80 text-[10px] sm:text-xs truncate">{p?.username}</span>
                  <span className="text-white/30 text-[8px] sm:text-[9px]">{ROLE_NAMES[role as RoleName]}</span>
                </div>
              );
            })}
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-white/25 font-semibold mb-2">💀 失败方</p>
            {Object.entries(game.all_roles).filter(([_, r]) => {
              const isGood = ["Merlin","Percival","LoyalServant"].includes(r);
              return goodWins ? !isGood : isGood;
            }).map(([uid, role]) => {
              const p = game.players.find(pp => pp.user_id === uid);
              return (
                <div key={uid} className="flex items-center gap-2 py-1 opacity-60">
                  <RoleAvatar role={role as RoleName} alignment={(["Merlin","Percival","LoyalServant"].includes(role) ? "Good" : "Evil") as Alignment} size={24} className="rounded-full" />
                  <span className="text-white/60 text-[10px] sm:text-xs truncate">{p?.username}</span>
                  <span className="text-white/20 text-[8px] sm:text-[9px]">{ROLE_NAMES[role as RoleName]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {game.round_history.length > 0 && (
          <button onClick={(e) => { e.stopPropagation(); setShowHistory(true); }}
            className="mt-4 text-xs text-blue-400/70 hover:text-blue-400 underline">
            查看轮次历史 ({game.round_history.length}轮)
          </button>
        )}
        <p className="mt-3 text-white/15 text-[10px] sm:text-xs">点击任意位置回到房间</p>
      </div>
    </div>
  );
}
