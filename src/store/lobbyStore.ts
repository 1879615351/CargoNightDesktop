import { create } from "zustand";
import type { Room } from "../types";

interface LobbyStore {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  gameType: string | null;
  fetchRooms: (gameType?: string) => Promise<void>;
  createRoom: (payload: Record<string, unknown>) => Promise<Room>;
}

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  rooms: [],
  loading: false,
  error: null,
  gameType: null,
  fetchRooms: async (gameType?: string) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (gameType) params.set("game_type", gameType);
      const query = params.toString();
      const { api } = await import("../api/client");
      const data = await api.get<Room[]>(`/lobby/rooms${query ? `?${query}` : ""}`);
      set({ rooms: data, loading: false, gameType: gameType || null });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
  createRoom: async (payload) => {
    const { api } = await import("../api/client");
    const room = await api.post<Room>("/rooms", payload);
    await get().fetchRooms(get().gameType ?? undefined);
    // Also set the room in roomStore so the room page loads instantly
    try {
      const { useRoomStore } = await import("./roomStore");
      useRoomStore.getState().setRoom(room);
    } catch {}
    return room;
  },
}));
