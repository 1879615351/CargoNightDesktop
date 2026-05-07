import { useEffect, useState, useCallback } from "react";
import type { RoundRecord } from "../../types/avalon";

interface Props {
  success: boolean;
  round: number;
  lastRound: RoundRecord | null;
  onDone: () => void;
}

export default function MissionResultToast({ success, round, lastRound, onDone }: Props) {
  const [exiting, setExiting] = useState(false);

  const handleDone = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(handleDone, 400);
      return () => clearTimeout(timer);
    }
  }, [exiting, handleDone]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setExiting(true)}
    >
      <div className={exiting ? "animate-toast-out" : "animate-toast-in"}>
        <div
          className={`rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl border-2 ${
            success
              ? "bg-emerald-950/95 border-emerald-500/30 shadow-emerald-500/20"
              : "bg-red-950/95 border-red-500/30 shadow-red-500/20"
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
              success
                ? "bg-emerald-500/10 ring-2 ring-emerald-500/30"
                : "bg-red-500/10 ring-2 ring-red-500/30"
            } animate-float`}
          >
            {success ? "✅" : "❌"}
          </div>

          <h2
            className={`text-2xl font-black mb-2 ${
              success ? "text-emerald-300" : "text-red-300"
            }`}
          >
            第 {round} 轮 {success ? "任务成功！" : "任务失败！"}
          </h2>

          {lastRound && (
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-emerald-400 text-sm font-semibold">
                ✅ {lastRound.success_count}
              </span>
              <span className="text-white/15 text-xs">/</span>
              <span className="text-red-400 text-sm font-semibold">
                ❌ {lastRound.fail_count}
              </span>
            </div>
          )}

          <p className="text-white/25 text-xs mt-4 animate-pulse">点击任意位置关闭</p>
        </div>
      </div>
    </div>
  );
}
