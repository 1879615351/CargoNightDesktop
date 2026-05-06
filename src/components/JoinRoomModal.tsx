import { useState } from "react";
import { api } from "../api/client";

export default function JoinRoomModal({
  roomId, roomName, hasPassword, onClose, onJoined,
}: {
  roomId: string; roomName: string; hasPassword: boolean; onClose: () => void; onJoined: () => void;
}) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleJoin = async () => {
    try {
      await api.post(`/rooms/${roomId}/join`, { password: hasPassword ? password : undefined });
      onJoined();
    } catch (e) { setErr(String(e)); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">加入房间</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white">✕</button>
        </div>

        <div className="text-sm text-white/70 mb-4">🎮 {roomName}</div>

        {hasPassword && (
          <div className="mb-4">
            <label className="text-xs text-white/40 block mb-1.5">🔒 此房间需要密码</label>
            <input value={password} onChange={e => setPassword(e.target.value)}
              type="password" placeholder="输入密码"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/30" />
          </div>
        )}

        {err && <div className="text-red-400 text-xs mb-3">{err}</div>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm">取消</button>
          <button onClick={handleJoin} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors">加入</button>
        </div>
      </div>
    </div>
  );
}
