import { useState, useEffect, useRef } from "react";
import type { RoleName } from "../../types/avalon";
import { ROLE_NAMES } from "../../types/avalon";

interface SpeakerInfo {
  user_id: string;
  username: string;
  avatar: string;
}

interface Props {
  queue: string[];
  currentSpeaker: string | null;
  remaining: number;
  isYourTurn: boolean;
  players: SpeakerInfo[];
  onEndSpeaking: () => void;
  allRoles?: Record<string, RoleName>;
  showRoles?: boolean;
  micActive: boolean;
  muted: boolean;
  onToggleMic: () => void;
  onStartMic: () => void;
}

export default function SpeakingPanel({
  queue, currentSpeaker, remaining, isYourTurn, players, onEndSpeaking,
  allRoles, showRoles, micActive, muted, onToggleMic, onStartMic,
}: Props) {
  const [displayTime, setDisplayTime] = useState(remaining);
  const serverTimeRef = useRef(remaining);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync local timer with server value when it changes significantly or speaker changes
  useEffect(() => {
    const diff = Math.abs(remaining - serverTimeRef.current);
    if (diff > 2 || serverTimeRef.current === 0 || currentSpeaker !== serverSpeakerRef.current) {
      setDisplayTime(remaining);
    }
    serverTimeRef.current = remaining;
  }, [remaining, currentSpeaker]);

  const serverSpeakerRef = useRef(currentSpeaker);

  // Local countdown tick
  useEffect(() => {
    if (currentSpeaker) {
      tickRef.current = setInterval(() => {
        setDisplayTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
    };
  }, [currentSpeaker]);

  const mins = Math.floor(Math.max(0, displayTime) / 60);
  const secs = Math.floor(Math.max(0, displayTime) % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  const totalSecs = 90;
  const pct = Math.min(100, (displayTime / totalSecs) * 100);
  const urgent = displayTime < 15;

  const getPlayerName = (uid: string) => players.find(p => p.user_id === uid)?.username ?? uid.slice(0, 6);
  const getPlayerAvatar = (uid: string) => players.find(p => p.user_id === uid)?.avatar ?? "🎮";

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-3 sm:p-4 backdrop-blur-sm animate-fade-in-up">
      <h3 className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
        <span>💬</span> 发言阶段
        {currentSpeaker && <span className="text-xs text-white/30 font-normal">— 当前: {getPlayerName(currentSpeaker)}</span>}
      </h3>

      {/* Current Speaker Timer */}
      {currentSpeaker && (
        <div className={`rounded-xl p-3 mb-3 text-center transition-all duration-500 ${
          isYourTurn ? "bg-blue-500/[0.08] border border-blue-400/20 shadow-lg shadow-blue-500/5" : "bg-white/[0.02]"
        }`}>
          <div className="relative w-14 h-14 mx-auto mb-1.5">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle cx="32" cy="32" r="28" fill="none"
                stroke={urgent ? "#ef4444" : isYourTurn ? "#3b82f6" : "#6b7280"}
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 175.9} 175.9`}
                className="transition-all duration-1000" />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-sm font-mono font-bold ${urgent ? "text-red-400" : isYourTurn ? "text-blue-300" : "text-white/30"}`}>
              {timeStr}
            </span>
          </div>
          <p className={`text-xs font-medium ${isYourTurn ? "text-blue-300" : "text-white/30"}`}>
            {isYourTurn ? "🎤 正在发言" : "🔇 等待发言"}
          </p>
          {isYourTurn && (
            <div className="flex items-center justify-center gap-2 mt-3">
              {micActive ? (
                <button onClick={onToggleMic}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    muted ? "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}>
                  {muted ? "🔇 已静音" : "🎤 开麦中"}
                </button>
              ) : (
                <button onClick={onStartMic}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-all">
                  🎤 开启麦克风
                </button>
              )}
              <button onClick={onEndSpeaking}
                className="px-5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.14] text-white/70 text-xs font-medium transition-all hover:scale-105 active:scale-95">
                结束发言
              </button>
            </div>
          )}
        </div>
      )}

      {/* Speaking Queue */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-white/25 font-medium uppercase tracking-wider">发言顺序</p>
        {queue.map((uid, i) => {
          const isCurrent = uid === currentSpeaker;
          const isPast = !currentSpeaker || (queue.indexOf(currentSpeaker!) !== -1 && i < queue.indexOf(currentSpeaker!));
          const role = showRoles && allRoles ? allRoles[uid] : undefined;

          return (
            <div key={uid} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
              isCurrent ? "bg-blue-500/10 ring-1 ring-blue-400/20" :
              isPast ? "bg-white/[0.02] opacity-50" : "bg-white/[0.02]"
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                isCurrent ? "bg-blue-500 text-white" : isPast ? "bg-emerald-500/30 text-emerald-400" : "bg-white/[0.08] text-white/30"
              }`}>
                {isPast ? "✓" : i + 1}
              </span>
              <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs shrink-0">
                {getPlayerAvatar(uid) === "AI" || getPlayerAvatar(uid) === "🤖" ? "🤖" : getPlayerAvatar(uid)}
              </div>
              <span className={`text-xs truncate flex-1 ${isCurrent ? "text-white font-medium" : "text-white/50"}`}>
                {getPlayerName(uid)}
              </span>
              {role && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                  ["Merlin","Percival","LoyalServant"].includes(role) ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                }`}>
                  {ROLE_NAMES[role]}
                </span>
              )}
            </div>
          );
        })}
        {queue.length === 0 && (
          <p className="text-xs text-white/15 text-center py-3">无真人玩家需要发言</p>
        )}
      </div>
    </div>
  );
}
