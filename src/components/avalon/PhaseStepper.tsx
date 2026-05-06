import type { GamePhase } from "../../types/avalon";

const PHASES: { key: GamePhase; label: string; icon: string }[] = [
  { key: "RoleReveal", label: "身份", icon: "👁" },
  { key: "Proposal", label: "提案", icon: "👑" },
  { key: "Discussion", label: "讨论", icon: "💬" },
  { key: "Vote", label: "投票", icon: "🗳" },
  { key: "Mission", label: "任务", icon: "⚔" },
  { key: "Result", label: "结果", icon: "📋" },
  { key: "Assassination", label: "刺杀", icon: "🔪" },
  { key: "End", label: "结束", icon: "🏁" },
];

interface Props { phase: GamePhase; round: number; }

export default function PhaseStepper({ phase, round }: Props) {
  const currentIdx = PHASES.findIndex(p => p.key === phase);

  return (
    <div className="flex items-center gap-1 overflow-x-auto px-1 py-2">
      {PHASES.map((p, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const hidden = i > currentIdx && phase !== "End";
        return (
          <div key={p.key} className="flex items-center gap-1 shrink-0">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-all duration-300 ${
              done ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              active ? "bg-blue-500/15 text-blue-300 border border-blue-400/30 animate-pulse-glow" :
              "bg-white/[0.03] text-white/20 border border-white/[0.05]"
            } ${hidden ? "opacity-25 scale-95" : ""}`}>
              <span className="text-[10px]">{done ? "✓" : p.icon}</span>
              <span>{p.label}</span>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`w-2.5 h-px ${i < currentIdx ? "bg-emerald-500/30" : "bg-white/[0.06]"}`} />
            )}
          </div>
        );
      })}
      {["Proposal","Discussion","Vote","Mission","Result"].includes(phase) && (
        <span className="ml-1 text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium shrink-0">
          第 {round} 轮
        </span>
      )}
    </div>
  );
}
