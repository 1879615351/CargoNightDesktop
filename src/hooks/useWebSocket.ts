import { useEffect, useRef, useCallback } from "react";
import { getToken } from "../api/client";
import { WS_BASE } from "../config";

export function useWebSocket(roomId: string | undefined, handlers: {
  onChat?: (data: Record<string, unknown>) => void;
  onRoomEvent?: (data: Record<string, unknown>) => void;
  onSignaling?: (data: Record<string, unknown>) => void;
  onVoiceState?: (data: Record<string, unknown>) => void;
  onAvalonState?: (data: Record<string, unknown>, userId?: string) => void;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);
  const pingRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  handlersRef.current = handlers;

  const initPing = useCallback((ws: WebSocket) => {
    if (pingRef.current) clearInterval(pingRef.current);
    pingRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);
  }, []);

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;

    const url = roomId
      ? `${WS_BASE}?token=${token}&room_id=${roomId}`
      : `${WS_BASE}?token=${token}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;
    initPing(ws);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const h = handlersRef.current;
        switch (msg.type) {
          case "chat":
            h.onChat?.(msg);
            break;
          case "player_joined":
          case "player_left":
          case "ready_changed":
          case "game_started":
            h.onRoomEvent?.(msg);
            break;
          case "signaling":
            h.onSignaling?.(msg);
            break;
          case "voice_state":
            h.onVoiceState?.(msg);
            break;
          case "avalon_state":
            h.onAvalonState?.(msg);
            break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setTimeout(connect, 3000);
    };
  }, [roomId]);

  useEffect(() => {
    connect();
    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
