import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRoomStore } from "../store/roomStore";
import { useAuthStore } from "../store/authStore";
import { useWebSocket } from "../hooks/useWebSocket";
import { useMediaDevice } from "../hooks/useMediaDevice";
import { useWebRTC } from "../hooks/useWebRTC";
import ChatArea from "../components/ChatArea";
import Loading from "../components/Loading";
import AvalonGame from "./AvalonGame";
import RoleConfig from "../components/avalon/RoleConfig";
import type { Player } from "../types";

export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { room, messages, loading, error, joinRoom, leaveRoom, toggleReady, startGame, sendMessage, setRoom, addMessage, setError, fetchRoom, fetchChat } = useRoomStore();
  const [joined, setJoined] = useState(false);
  const { mode, muted, micActive, checkSupport, startMic, stopMic, toggleMute } = useMediaDevice();
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [showRoleConfig, setShowRoleConfig] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleWsChat = useCallback((data: Record<string, unknown>) => {
    if (data.message) addMessage(data.message as import("../types").ChatMessage);
  }, [addMessage]);
  const handleWsRoomEvent = useCallback((data: Record<string, unknown>) => {
    if (data.room) setRoom(data.room as import("../types").Room);
  }, [setRoom]);

  const { send: wsSend } = useWebSocket(roomId, { onChat: handleWsChat, onRoomEvent: handleWsRoomEvent });
  const { closeAll, setLocalStream } = useWebRTC(roomId, user?.id ?? "", mode, wsSend, undefined);

  useEffect(() => { checkSupport().then((m) => setVoiceSupported(m !== "none")).catch(() => setVoiceSupported(false)); }, []);
  useEffect(() => {
    if (!roomId || joined) return;
    setJoined(true);
    if (room && room.id === roomId) { fetchChat(roomId); }
    else { setRoom(null as unknown as import("../types").Room); joinRoom(roomId); }
    return () => { closeAll(); stopMic(); };
  }, [roomId]);

  const handleStartVoice = async () => {
    if (micActive) { stopMic(); closeAll(); }
    else { const stream = await startMic(); if (stream) setLocalStream(stream); }
  };

  if (loading && !room) return <Loading />;
  if (error && !room) return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div className="text-red-400">{error}</div>
      <button onClick={() => { setError(null); roomId && fetchRoom(roomId); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">重试</button>
    </div>
  );
  if (!room || !user) return null;

  if (room.game_id === "avalon" && room.status === "Playing") {
    return (
      <AvalonGame roomId={roomId!} userId={user.id} onBackToRoom={async () => {
        const { fetchRoom } = useRoomStore.getState();
        await fetchRoom(roomId!);
      }} micActive={micActive} muted={muted} onToggleMic={toggleMute} onStartMic={handleStartVoice} />
    );
  }

  const isHost = room.host_id === user.id;
  const canStart = isHost && room.players.every((p) => p.is_ready) && room.players.length >= 2;
  const statusLabel: Record<string, string> = { Waiting: "等待中", Playing: "游戏中", Finished: "已结束" };

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Top Bar */}
      <div className="w-full px-4 sm:px-6 pt-4 shrink-0">
        <div className="w-full flex items-center justify-between gap-3 flex-wrap">
          <button onClick={async () => { if (roomId) await leaveRoom(roomId); navigate(-1); }}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span>返回大厅</span>
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            {voiceSupported && (
              <button onClick={handleStartVoice} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${micActive ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white border border-white/10"}`}>
                {micActive ? (muted ? "🔇" : "🎤") : "🎤"}
              </button>
            )}
            {micActive && (
              <button onClick={toggleMute} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${muted ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/[0.06] border-white/10 text-white/60"}`}>
                {muted ? "静音中" : "已开麦"}
              </button>
            )}
            {canStart && (
              <button onClick={() => roomId && startGame(roomId)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold transition-all">🚀 开始</button>
            )}
            <button onClick={() => roomId && leaveRoom(roomId).then(() => navigate(-1))} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-colors">离开</button>
          </div>
        </div>
      </div>

      {/* Room Info */}
      <div className="w-full px-4 sm:px-6 pt-3 shrink-0">
        <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-white">{room.name}</span>
            <span className={`text-[10px] px-2 py-1 rounded-md font-medium ${room.status === "Waiting" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
              ● {statusLabel[room.status] ?? room.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40 flex-wrap">
            <span>👤 {room.host_name}</span>
            <span>🎮 {room.game_name}</span>
            <span>👥 {room.players.filter(p => p.is_ready).length}/{room.players.length}/{room.max_players}人</span>
            <span className="text-white/25 flex items-center gap-1">🆔 {room.short_id ?? room.id.slice(0, 6)}<button onClick={() => navigator.clipboard?.writeText(room.id)} className="text-white/30 hover:text-white/60 text-[9px]">📋</button></span>
          </div>
        </div>
      </div>

      {/* Mobile toggle buttons */}
      <div className="md:hidden flex gap-2 px-4 pt-3 shrink-0">
        <button onClick={() => setShowChat(false)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${!showChat ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/35'}`}>
          👥 玩家
        </button>
        <button onClick={() => setShowChat(true)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${showChat ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/35'}`}>
          💬 聊天
        </button>
      </div>

      {/* Main Body */}
      <div className="w-full flex-1 min-h-0 px-4 sm:px-6 py-3">
        <div className="w-full h-full grid gap-4 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          {/* Player List */}
          <div className={`bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex flex-col min-h-0 overflow-auto ${showChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-sm font-semibold text-white/80">玩家列表</h3>
              <span className="text-xs text-white/30">{room.players.length}/{room.max_players}</span>
            </div>
            <div className="flex-1 space-y-1.5 overflow-auto">
              {room.players.map((p: Player) => (
                <div key={p.id} className={`rounded-lg p-2 flex items-center gap-2 ${p.is_ready ? "bg-white/[0.05]" : "bg-white/[0.02]"}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 border" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>{p.avatar === "AI" ? "🤖" : (p.avatar || "🎮")}</div>
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span className="text-xs text-white truncate">{p.name}</span>
                    {p.is_host && <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-300">房主</span>}
                    {p.id === user.id && <span className="text-[8px] px-1 py-0.5 rounded bg-blue-500/15 text-blue-300">我</span>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${p.is_ready ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"}`}>{p.is_ready ? "已准备" : "未准备"}</span>
                </div>
              ))}
            </div>
            <div className="shrink-0 mt-3 space-y-2">
              {isHost && room.status === "Waiting" && room.game_id === "avalon" && (
                <div className="space-y-1.5">
                  <button onClick={async () => {
                    if (!roomId) return;
                    try { const { api } = await import("../api/client"); await api.post(`/rooms/${roomId}/ai/add`, { count: 1, difficulty: "normal" }); const { fetchRoom } = useRoomStore.getState(); await fetchRoom(roomId); }
                    catch (e) { setError(String(e)); }
                  }} disabled={room.players.length >= room.max_players}
                    className="w-full py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] border border-white/[0.08] text-white/60 hover:bg-white/10 disabled:opacity-30">🤖 添加AI</button>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowRoleConfig(true); }}
                      className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white transition-colors">⚙ 角色配置</button>
                    <button onClick={async () => {
                      if (!roomId) return;
                      try { const { api } = await import("../api/client"); await api.post(`/rooms/${roomId}/avalon/start`, {}); const { fetchRoom } = useRoomStore.getState(); await fetchRoom(roomId); }
                      catch (e) { setError(String(e)); }
                    }}
                      disabled={room.players.length < 5 || !room.players.every(p => p.is_ready)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${room.players.length >= 5 && room.players.every(p => p.is_ready) ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white" : "bg-white/[0.04] text-white/20 cursor-not-allowed"}`}>
                      🛡️ 开始 ({room.players.length}/5)
                    </button>
                  </div>
                </div>
              )}
              {!isHost && room.status === "Waiting" && (
                <button onClick={() => roomId && toggleReady(roomId)}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${room.players.find(p => p.id === user.id)?.is_ready ? "bg-white/[0.06] hover:bg-white/10 text-white/60 border border-white/10" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
                  {room.players.find(p => p.id === user.id)?.is_ready ? "取消准备" : "准备"}
                </button>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className={`bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex flex-col min-h-0 ${showChat ? 'flex' : 'hidden md:flex'}`}>
            <ChatArea messages={messages} onSend={(c) => roomId && sendMessage(roomId, c)} currentPlayerId={user.id} />
          </div>
        </div>
      </div>

      {showRoleConfig && roomId && (
        <RoleConfig playerCount={room.players.length} selected={[]} roomId={roomId} onClose={() => setShowRoleConfig(false)}
          onGameStarted={async () => { const { fetchRoom } = useRoomStore.getState(); await fetchRoom(roomId!); }} />
      )}
    </div>
  );
}
