import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "../types";

export default function ChatArea({ messages, onSend, currentPlayerId }: {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  currentPlayerId: string;
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-sm font-semibold text-white/70 mb-3 shrink-0">聊天</h3>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0">
        {messages.length === 0 && <p className="text-white/15 text-xs text-center py-12">暂无消息</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`px-3 py-2 rounded-lg text-xs ${msg.is_system ? "bg-white/[0.02] text-white/25 text-center" : msg.sender_id === currentPlayerId ? "bg-blue-600/10 text-blue-300 ml-6" : "bg-white/[0.03] text-white/65 mr-6"}`}>
            {!msg.is_system && <span className="text-[10px] text-white/25 block">{msg.sender_name}</span>}
            <span>{msg.content}</span>
            {!msg.is_system && <span className="text-[10px] text-white/15 float-right ml-2 mt-1">{msg.timestamp}</span>}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 shrink-0">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="输入消息..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs placeholder-white/20 focus:outline-none focus:border-blue-500/30 transition-colors" />
        <button onClick={handleSend} disabled={!text.trim()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-white/[0.04] disabled:text-white/15 text-white text-xs font-medium transition-colors">发送</button>
      </div>
    </div>
  );
}
