import type { RoleName } from "../../types/avalon";

const AVATARS: Record<RoleName, string> = {
  Merlin: "/icons/avalon/merlin-avatar.jpg",
  Percival: "/icons/avalon/percival-avatar.jpg",
  LoyalServant: "/icons/avalon/loyal-servant-avatar.jpg",
  Assassin: "/icons/avalon/assassin-avatar.jpg",
  Morgana: "/icons/avalon/morgana-avatar.jpg",
  Mordred: "/icons/avalon/mordred-avatar.jpg",
  Oberon: "/icons/avalon/oberon-avatar.jpg",
  Minion: "/icons/avalon/minion-avatar.jpg",
};

const DEFAULT = "/icons/avalon/minion-avatar.jpg";

export function getRoleAvatar(role: RoleName | null | undefined): string {
  if (!role) return DEFAULT;
  return AVATARS[role] ?? DEFAULT;
}

interface Props {
  role?: RoleName | null;
  alignment?: string | null;
  size?: number;
  className?: string;
  isLeader?: boolean;
  isOnline?: boolean;
  isSelf?: boolean;
  isPicked?: boolean;
  showRing?: boolean;
}

export default function RoleAvatar({
  role, alignment, size = 48, className = "",
  isLeader, isOnline = true, isSelf, isPicked, showRing = true,
}: Props) {
  const src = getRoleAvatar(role);
  const s = size;
  const ring = showRing && alignment
    ? (alignment === "Good" ? "ring-2 ring-blue-500/60" : "ring-2 ring-red-500/60")
    : "";

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: s, height: s }}>
      <img
        src={src}
        alt={role ?? "unknown"}
        width={s}
        height={s}
        className={`rounded-xl object-cover w-full h-full transition-all duration-300 ${ring} ${isPicked ? "scale-110 brightness-110" : ""}`}
        loading="lazy"
        onError={(e) => {
          const t = e.currentTarget;
          t.style.display = "none";
          const fallback = document.createElement("span");
          fallback.className = "text-2xl flex items-center justify-center w-full h-full rounded-xl bg-white/[0.05]";
          fallback.textContent = "🎮";
          t.parentElement?.appendChild(fallback);
        }}
      />
      {!isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gray-600 border-2 border-[#0f172a]" title="离线">
          <div className="absolute inset-0.5 rounded-full bg-red-500" />
        </div>
      )}
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0f172a]" title="在线" />
      )}
      {isLeader && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] border-2 border-[#0f172a] font-bold text-white shadow-lg shadow-amber-500/30">
          👑
        </div>
      )}
      {isSelf && (
        <div className="absolute -top-1.5 right-0 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500 text-white font-bold border border-blue-400/50 shadow-lg shadow-blue-500/30">
          我
        </div>
      )}
      {isPicked && (
        <div className="absolute inset-0 rounded-xl bg-purple-500/20 ring-2 ring-purple-500/60 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-purple-500/40">✓</div>
        </div>
      )}
    </div>
  );
}

export { AVATARS };
