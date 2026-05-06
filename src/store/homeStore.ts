import { create } from "zustand";
import { api } from "../api/client";
import type { HomeStats, Game } from "../types";

interface HomeStore {
  stats: HomeStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useHomeStore = create<HomeStore>((set) => ({
  stats: null,
  loading: false,
  error: null,
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<HomeStats>("/home/stats");
      set({ stats: data, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));

interface GameStore {
  games: Game[];
  loading: boolean;
  error: string | null;
  fetchGames: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set) => ({
  games: [],
  loading: false,
  error: null,
  fetchGames: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.get<Game[]>("/games");
      set({ games: data, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
