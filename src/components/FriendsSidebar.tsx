import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFriendStore } from "../store/friendStore";
import { useAuthStore } from "../store/authStore";
import AddFriendModal from "./AddFriendModal";
import JoinRoomModal from "./JoinRoomModal";

export default function FriendsSidebar() {
  const { friends, loading, fetchFriends, acceptFriend } = useFriendStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [joinTarget, setJoinTarget] = useState<{ roomId: string; name: string; hasPassword: boolean } | null>(null);

  useEffect(() => { fetchFriends(); }, []);

  const pending = friends.filter(f => f.status === "pending");
  const accepted = friends.filter(f => f.status !== "pending");

  const getStatusIcon = (s: string) => {
    if (s === "in_game") return "🟡";
    if (s === "online") return "🟢";
    return "⚫";
  };

  const getStatusText = (f: typeof friends[0]) => {
    if (f.online_status === "in_game") return `${f.game_name || "游戏中"}${f.game_mode ? ` · ${f.game_mode}` : ""} · ${f.player_count || "?"}/${f.max_players || "?"}人${f.has_password ? " 🔒" : ""}`;
    if (f.online_status === "online") return "空闲";
    return "离线";
  };

  const online = accepted.filter(f => f.online_status !== "offline").length;
  const isIncoming = (f: typeof friends[0]) => f.user_id !== user?.id; // request sent to current user

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '0.67px solid rgba(255,255,255,0.06)' }}>
        <div className="p-4" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80">
              好友 {accepted.length > 0 && <span className="text-white/25 font-normal text-xs ml-1">({online}在线)</span>}
              {pending.length > 0 && <span className="text-amber-400 font-normal text-xs ml-1">· {pending.length}待处理</span>}
            </h3>
            <button onClick={() => setShowAdd(true)} className="text-xs text-white/40 hover:text-white/70 transition-colors">+ 添加</button>
          </div>
        </div>

        <div className="p-3 space-y-1 max-h-[360px] overflow-auto">
          {loading && <div className="text-white/15 text-xs text-center py-6">加载中...</div>}

          {/* Pending requests */}
          {pending.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] text-amber-400/50 font-medium px-1 mb-1">待处理请求</div>
              {pending.map((f) => {
                const incoming = isIncoming(f);
                return (
                  <div key={f.id} className="rounded-xl p-2.5 mb-1" style={{ background: 'rgba(251,191,36,0.05)', border: '0.5px solid rgba(251,191,36,0.1)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {f.avatar || "🎮"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white truncate block">{f.username}</span>
                        <span className="text-[10px] text-amber-400/60">{incoming ? "请求添加你为好友" : "等待对方确认"}</span>
                      </div>
                      {incoming && (
                        <button onClick={async () => { await acceptFriend(f.id); await fetchFriends(); }}
                          className="text-[10px] px-2.5 py-1 rounded-lg text-white shrink-0" style={{ background: '#2563eb' }}>
                          接受
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Accepted friends */}
          {!loading && accepted.length === 0 && (
            <div className="text-center py-6">
              <p className="text-white/20 text-xs">暂无好友</p>
              <button onClick={() => setShowAdd(true)} className="text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors">添加好友</button>
            </div>
          )}

          {accepted.sort((a, _b) => a.online_status === "offline" ? 1 : -1).map((f) => (
            <div key={f.id} className="rounded-xl p-2.5 transition-colors" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {f.avatar || "🎮"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white truncate">{f.username}</span>
                    <span className="text-[10px]">{getStatusIcon(f.online_status)}</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${f.online_status === "offline" ? "text-white/15" : "text-white/30"}`}>
                    {getStatusText(f)}
                  </div>
                </div>
                {f.online_status === "in_game" && f.room_id && (
                  <button onClick={() => { if (f.has_password) setJoinTarget({ roomId: f.room_id!, name: f.game_name || "房间", hasPassword: true }); else navigate(`/room/${f.room_id}`); }}
                    className="text-[10px] px-2.5 py-1 rounded-lg text-white/50 hover:text-white transition-colors shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    进入
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddFriendModal onClose={() => setShowAdd(false)} onAdded={fetchFriends} />}
      {joinTarget && (
        <JoinRoomModal
          roomId={joinTarget.roomId} roomName={joinTarget.name}
          hasPassword={joinTarget.hasPassword}
          onClose={() => setJoinTarget(null)}
          onJoined={() => { setJoinTarget(null); navigate(`/room/${joinTarget.roomId}`); }}
        />
      )}
    </>
  );
}
