import { create } from "zustand";
import type { Room, ChatMessage } from "../types";

interface RoomStore {
  room: Room | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: (roomId: string) => Promise<void>;
  toggleReady: (roomId: string) => Promise<void>;
  startGame: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  fetchChat: (roomId: string) => Promise<void>;
  fetchRoom: (roomId: string) => Promise<void>;
  setRoom: (room: Room) => void;
  addMessage: (msg: ChatMessage) => void;
  setError: (err: string | null) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  messages: [],
  loading: false,
  error: null,

  fetchRoom: async (roomId: string) => {
    try {
      const { api } = await import("../api/client");
      const rooms = await api.get<Room[]>(`/lobby/rooms`);
      const found = rooms.find((r) => r.id === roomId);
      if (found) {
        set({ room: found });
        await get().fetchChat(roomId);
      }
    } catch {}
  },

  joinRoom: async (roomId: string) => {
    set({ loading: true, error: null });
    try {
      const { api } = await import("../api/client");
      const room = await api.post<Room>(`/rooms/${roomId}/join`);
      set({ room, loading: false });
      await get().fetchChat(roomId);
    } catch (e) {
      const msg = String(e);
      if (msg.includes("Already in room") || msg.includes("已在房间中")) {
        await get().fetchRoom(roomId);
        set({ loading: false });
      } else {
        set({ error: msg, loading: false });
      }
    }
  },

  leaveRoom: async (roomId: string) => {
    try {
      const { api } = await import("../api/client");
      await api.post(`/rooms/${roomId}/leave`);
      set({ room: null, messages: [] });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  toggleReady: async (roomId: string) => {
    try {
      const { api } = await import("../api/client");
      const room = await api.post<Room>(`/rooms/${roomId}/ready`);
      set({ room });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  startGame: async (roomId: string) => {
    try {
      const { api } = await import("../api/client");
      const room = await api.post<Room>(`/rooms/${roomId}/start`);
      set({ room });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  sendMessage: async (roomId: string, content: string) => {
    try {
      const { api } = await import("../api/client");
      const msg = await api.post<ChatMessage>(`/rooms/${roomId}/chat`, { content });
      set((s) => ({ messages: [...s.messages, msg] }));
    } catch (e) {
      set({ error: String(e) });
    }
  },

  fetchChat: async (roomId: string) => {
    try {
      const { api } = await import("../api/client");
      const msgs = await api.get<ChatMessage[]>(`/rooms/${roomId}/chat`);
      set({ messages: msgs });
    } catch {}
  },

  setRoom: (room: Room) => set({ room }),
  addMessage: (msg: ChatMessage) => set((s) => ({ messages: [...s.messages, msg] })),
  setError: (err: string | null) => set({ error: err }),
}));
