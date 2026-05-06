export default function Loading() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
        <span className="text-white/40 text-sm">加载中...</span>
      </div>
    </div>
  );
}
