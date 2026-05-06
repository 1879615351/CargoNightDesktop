import { useState } from "react";
import { useFriendStore } from "../store/friendStore";

export default function AddFriendModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const { searchUser, addFriend } = useFriendStore();
  const [uid, setUid] = useState("");
  const [result, setResult] = useState<{ found: boolean; user?: { id: string; username: string; avatar: string } } | null>(null);
  const [err, setErr] = useState("");

  const handleSearch = async () => {
    setErr("");
    try {
      const res = await searchUser(uid.trim());
      setResult(res);
    } catch { setErr("搜索失败"); }
  };

  const handleAdd = async () => {
    if (!result?.user) return;
    try {
      await addFriend(result.user.id);
      onAdded();
      onClose();
    } catch (e) { setErr(String(e)); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">添加好友</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white">✕</button>
        </div>

        <div className="flex gap-2 mb-4">
          <input value={uid} onChange={e => setUid(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="输入12位账号或用户名"
            className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-white/20 focus:outline-none focus:border-blue-500/30" />
          <button onClick={handleSearch} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors">搜索</button>
        </div>

        {err && <div className="text-red-400 text-xs mb-3">{err}</div>}

        {result && (
          <div className="bg-white/[0.03] rounded-xl p-4">
            {result.found && result.user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{result.user.avatar}</span>
                  <div>
                    <div className="text-sm text-white/90">{result.user.username}</div>
                    <div className="text-[10px] text-white/30 font-mono">{result.user.id.slice(0, 12)}...</div>
                  </div>
                </div>
                <button onClick={handleAdd} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs transition-colors">
                  添加
                </button>
              </div>
            ) : (
              <p className="text-white/30 text-xs text-center">未找到该用户</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
