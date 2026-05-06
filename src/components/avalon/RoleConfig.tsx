import { useState } from "react";
import RoleAvatar from "./RoleAvatar";

const ALL_ROLES = [
  { key: "Merlin", name: "梅林", align: "good", required: true, desc: "知道所有坏人（除莫德雷德）" },
  { key: "Percival", name: "派西维尔", align: "good", required: false, desc: "知道梅林和莫甘娜但无法区分" },
  { key: "LoyalServant", name: "忠臣", align: "good", required: false, desc: "普通好人，协助完成任务" },
  { key: "Assassin", name: "刺客", align: "evil", required: true, desc: "坏人，最后可刺杀梅林" },
  { key: "Minion", name: "爪牙", align: "evil", required: false, desc: "普通坏人" },
  { key: "Morgana", name: "莫甘娜", align: "evil", required: false, desc: "伪装成梅林，混淆派西维尔" },
  { key: "Mordred", name: "莫德雷德", align: "evil", required: false, desc: "梅林看不到他" },
  { key: "Oberon", name: "奥伯伦", align: "evil", required: false, desc: "其他坏人不知道他" },
];

const RECOMMENDED: Record<number, string[]> = {
  5: ["Merlin","LoyalServant","LoyalServant","Assassin","Minion"],
  6: ["Merlin","Percival","LoyalServant","LoyalServant","Assassin","Minion"],
  7: ["Merlin","Percival","LoyalServant","LoyalServant","Assassin","Morgana","Minion"],
  8: ["Merlin","Percival","LoyalServant","LoyalServant","LoyalServant","Assassin","Morgana","Minion"],
  9: ["Merlin","Percival","LoyalServant","LoyalServant","LoyalServant","LoyalServant","Assassin","Morgana","Mordred"],
  10: ["Merlin","Percival","LoyalServant","LoyalServant","LoyalServant","LoyalServant","Assassin","Morgana","Mordred","Oberon"],
};

interface Props {
  playerCount: number;
  selected: string[];
  roomId: string;
  onClose: () => void;
  onGameStarted: () => void;
}

export default function RoleConfig({ playerCount, selected, roomId, onClose, onGameStarted }: Props) {
  const [roles, setRoles] = useState<string[]>(() => {
    if (selected.length > 0) return selected;
    return RECOMMENDED[playerCount] ?? RECOMMENDED[5];
  });

  const toggleRole = (key: string) => {
    if (ALL_ROLES.find(r => r.key === key)?.required) return;
    setRoles(prev => {
      if (prev.includes(key)) return prev.filter(r => r !== key);
      return [...prev, key];
    });
  };

  const isRecommended = (role: string) => (RECOMMENDED[playerCount] ?? []).includes(role);
  const goodCount = roles.filter(r => ALL_ROLES.find(a => a.key === r)?.align === "good").length;
  const evilCount = roles.length - goodCount;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">⚙ 游戏设置 — 🛡️ 阿瓦隆</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white text-lg">✕</button>
        </div>

        <div className="mb-4 text-sm text-white/40">当前人数: <span className="text-white/70 font-medium">{playerCount} 人</span></div>

        <div className="space-y-2 mb-5">
          {ALL_ROLES.map((r) => {
            const checked = roles.includes(r.key);
            const rec = isRecommended(r.key);
            return (
              <label key={r.key} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                rec ? "border-amber-500/30 bg-amber-500/5" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
              }`}>
                <input type="checkbox" checked={checked} onChange={() => toggleRole(r.key)}
                  disabled={r.required} className="accent-blue-500 w-4 h-4 shrink-0" />
                <RoleAvatar role={r.key as any} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${r.align === "good" ? "text-blue-400" : "text-red-400"}`}>{r.name}</span>
                    {r.required && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/30">必选</span>}
                    {rec && !r.required && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">推荐</span>}
                  </div>
                  <p className="text-[11px] text-white/25 mt-0.5 truncate">{r.desc}</p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-white/40 mb-4">
          <span>好人: <span className="text-blue-400 font-medium">{goodCount}人</span></span>
          <span>坏人: <span className="text-red-400 font-medium">{evilCount}人</span></span>
          <button onClick={() => { setRoles(RECOMMENDED[playerCount] ?? RECOMMENDED[5]); }}
            className="text-xs text-amber-400/70 hover:text-amber-400 underline">恢复推荐</button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm">取消</button>
          <button onClick={async () => {
            try {
              const { api } = await import("../../api/client");
              await api.post(`/rooms/${roomId}/avalon/start`, { roles });
              onClose();
              onGameStarted();
            } catch {}
          }}
            disabled={roles.length !== playerCount}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white text-sm font-medium transition-all">
            开始游戏 ({roles.length}/{playerCount})
          </button>
        </div>
      </div>
    </div>
  );
}
